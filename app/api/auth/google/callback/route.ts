import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/login?error=GoogleAuthFailed', req.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=NoCode', req.url));
    }

    try {
        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokens.id_token) {
            throw new Error('No id_token returned');
        }

        // 2. Get User Info
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userRes.json();

        if (!googleUser.email) {
            throw new Error('No email found in Google profile');
        }

        // 3. Upsert User
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        if (user) {
            // Link Google ID if not present
            // @ts-ignore
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        // @ts-ignore
                        googleId: googleUser.id,
                        // @ts-ignore
                        image: googleUser.picture || user.image
                    },
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    fullName: googleUser.name || 'Google User',
                    password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Dummy password
                    // @ts-ignore
                    googleId: googleUser.id,
                    // @ts-ignore
                    image: googleUser.picture,
                    // phoneNumber, address, etc. are optional now
                },
            });
        }

        // 4. Issue JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Set Cookie
        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // 6. Redirect to Home
        return NextResponse.redirect(new URL('/', req.url));

    } catch (err) {
        console.error('Google Auth Error:', err);
        return NextResponse.redirect(new URL('/login?error=AuthFailed', req.url));
    }
}
