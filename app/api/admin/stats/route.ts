import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const newOrdersCount = await prisma.order.count({
            where: {
                status: 'AWAITING_PAYMENT'
            }
        });

        const unreadMessagesCount = await prisma.orderMessage.count({
            where: {
                isAdmin: false,
                isRead: false
            }
        });

        return NextResponse.json({
            newOrdersCount,
            unreadMessagesCount
        });
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
