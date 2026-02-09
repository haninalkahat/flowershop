import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
            userId = decoded.userId;
        } catch (err) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Mark all answered questions for this user as read
        const updateResult = await prisma.productQuestion.updateMany({
            where: {
                userId: user.id,
                answer: { not: null },
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return NextResponse.json({
            success: true,
            updatedCount: updateResult.count
        });
    } catch (error) {
        console.error('Error marking questions as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
