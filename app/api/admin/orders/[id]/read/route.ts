import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        await prisma.orderMessage.updateMany({
            where: {
                orderId: id,
                isAdmin: false,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark messages as read:', error);
        return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
    }
}
