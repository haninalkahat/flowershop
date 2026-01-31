import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security, do not reveal if user does not exist.
            // Pretend success.
            return NextResponse.json({ message: 'If account exists, email sent' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Token valid for 1 hour
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        // Save to DB
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            } as any,
        });

        // Send Email
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

        await sendPasswordResetEmail(email, resetUrl);

        return NextResponse.json({ message: 'If account exists, email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
