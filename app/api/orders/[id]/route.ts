
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } },
            receipt: true
        }
    });

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { status } = body; // 'CANCELED'

    // Only allow user to cancel if AWAITING_PAYMENT
    const order = await prisma.order.findUnique({
        where: { id }
    });

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (status === 'CANCELED') {
        if (order.status !== 'AWAITING_PAYMENT') {
            return NextResponse.json({ error: 'Cannot cancel processed order' }, { status: 400 });
        }
        await prisma.order.update({
            where: { id },
            data: { status: 'CANCELED' }
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
