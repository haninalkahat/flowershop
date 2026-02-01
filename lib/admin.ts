
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAIL = 'llaffashopstore@gmail.com';

export async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) return false;

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string, email?: string };
        // We need to fetch the user to get the email if not in token, but for now let's hope it's not needed or token has it?
        // Wait, current login doesn't put email in token typically. Let's verify.
        // If not, we have to fetch user from DB.

        // Let's assume we need to fetch user from DB to be safe and secure.
        const prisma = require('@/lib/prisma').default;
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        return user && user.email === ADMIN_EMAIL;
    } catch (error) {
        return false;
    }
}
