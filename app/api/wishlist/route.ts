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

export async function GET() {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!wishlist) {
            return NextResponse.json({ items: [] });
        }

        return NextResponse.json({ items: wishlist.items });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    try {
        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId }
            });
        }

        // Check if item exists
        const exists = await prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId
                }
            }
        });

        if (exists) {
            return NextResponse.json({ message: 'Already in wishlist' });
        }

        const item = await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId
            }
        });

        return NextResponse.json({ item });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
}
