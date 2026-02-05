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
        return { userId: decoded.userId };
    } catch (error) {
        return null;
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;

    try {
        // We use $executeRawUnsafe or $executeRaw to bypass potential stale Prisma Client types
        // "OrderMessage" is the table name (default PascalCase from model name)
        // We cast parameters to ensure safety

        // Note: In some setups, table names might be lowercased. 
        // We attempt standard quoting first.
        await prisma.$executeRaw`
            UPDATE "OrderMessage"
            SET "isRead" = true, "readAt" = NOW()
            WHERE "orderId" = ${orderId} AND "isAdmin" = true AND "isRead" = false
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to mark messages as read:', error);
        return NextResponse.json({ error: error.message || 'Failed to update messages' }, { status: 500 });
    }
}
