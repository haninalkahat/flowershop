import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ user: null });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    // Don't SELECT password
                }
            });

            if (!user) {
                return NextResponse.json({ user: null });
            }

            return NextResponse.json({ user });

        } catch (err) {
            // Token invalid
            return NextResponse.json({ user: null });
        }

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
