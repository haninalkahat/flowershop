import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const [updatedMessages, updatedOrder] = await prisma.$transaction([
            prisma.orderMessage.updateMany({
                where: {
                    orderId: id,
                    isAdmin: false,
                    isRead: false
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            }),
            prisma.order.update({
                where: { id },
                data: { isNewOrder: false }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark messages as read:', error);
        return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
    }
}
