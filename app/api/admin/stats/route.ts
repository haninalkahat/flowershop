import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Count new orders based on isNewOrder flag
        const newOrdersCount = await prisma.order.count({
            where: {
                isNewOrder: true
            }
        });

        const unreadMessagesCount = await prisma.orderMessage.count({
            where: {
                isAdmin: false,
                isRead: false
            }
        });

        let unreadQuestionsCount = 0;
        try {
            unreadQuestionsCount = await prisma.productQuestion.count({
                where: {
                    isReadByAdmin: false
                }
            });
        } catch (e) {
            console.warn('Failed to count unread questions (Prisma schema mismatch?)', e);
        }

        return NextResponse.json({
            newOrdersCount,
            unreadMessagesCount,
            unreadQuestionsCount
        });
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
