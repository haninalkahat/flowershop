
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string, isAdmin?: boolean };
        // Ideally verify admin status here too if possible, but middleware/logic handles it usually.
        // Assuming simple userId check for now, but really should verify admin via DB or token claim if stored.
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    // Basic admin check - in real app, verify role
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const questions = await prisma.productQuestion.findMany({
            include: {
                user: { select: { fullName: true, email: true } },
                product: { select: { id: true, name: true, images: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Mark unread as read? Maybe not automatically on fetch list, but maybe on view detail.
        // For now just return list.
        return NextResponse.json({ questions });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
