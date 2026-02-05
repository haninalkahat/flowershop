
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
        const body = await request.json();

        const { fullName, email, phoneNumber, address, city } = body;

        // Validations could go here

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                fullName,
                email,
                phoneNumber,
                address,
                city
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                address: true,
                city: true
            }
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
