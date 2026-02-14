
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

import { sendEmail } from '@/lib/email';
import { getOrderStatusEmail } from '@/lib/email-templates';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // TODO: Verify admin role.

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate Status: AWAITING_PAYMENT, PAID, REJECTED, CANCELED
    const validStatuses = ['AWAITING_PAYMENT', 'PAID', 'PREPARING', 'DELIVERED', 'REJECTED', 'CANCELED'];

    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    try {
        const order = await prisma.order.update({
            where: { id },
            data: {
                status,
                isNewOrder: false
            },
            include: {
                user: true
            }
        });

        // Send Email Notification
        if (order.user.email) {
            try {
                const { subject, html } = getOrderStatusEmail(
                    order.locale || 'en',
                    order.id,
                    order.status,
                    order.user.fullName
                );
                await sendEmail(order.user.email, subject, html);
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
                // Continue execution, do not fail the request
            }
        }

        return NextResponse.json({ success: true, status });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
