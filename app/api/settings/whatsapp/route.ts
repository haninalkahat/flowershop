
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        return user;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    // Public endpoint to get settings
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: 'whatsapp_button_enabled' }
        });
        return NextResponse.json({ enabled: setting?.value === 'true' });
    } catch (error) {
        return NextResponse.json({ enabled: false }); // Default to false if error
    }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user || user.email !== 'llaffashopstore@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { enabled } = await request.json();
        const setting = await prisma.setting.upsert({
            where: { key: 'whatsapp_button_enabled' },
            update: { value: String(enabled) },
            create: { key: 'whatsapp_button_enabled', value: String(enabled) }
        });
        return NextResponse.json({ success: true, enabled: setting.value === 'true' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
