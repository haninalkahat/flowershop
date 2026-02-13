
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ADMIN_EMAIL } from '@/lib/admin';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getAdminUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string, email?: string, isAdmin?: boolean };
        if (decoded.email === ADMIN_EMAIL || decoded.isAdmin === true) {
            return decoded.userId;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function POST() {
    try {
        const userId = await getAdminUser();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.productQuestion.updateMany({
            where: { isReadByAdmin: false },
            data: { isReadByAdmin: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
