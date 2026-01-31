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
    if (!userId) return NextResponse.json({ cart: [] });

    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } }
    });

    if (!cart) return NextResponse.json({ cart: [] });

    return NextResponse.json({
        cart: cart.items.map(item => ({
            ...item.product,
            quantity: item.quantity,
            // Ensure compatibility with Product interface in frontend
            originalPrice: Number(item.product.originalPrice),
            discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
        }))
    });
}

export async function POST(request: Request) {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, quantity } = body;

    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if item exists
    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId }
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
        });
    } else {
        // Check if product exists to avoid FK error (optional but good)
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity
            }
        });
    }

    return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, quantity } = body;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId }
    });

    if (existingItem) {
        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: existingItem.id } });
        } else {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity }
            });
        }
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId } = body; // Simplified: remove by productId

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId }
    });

    if (existingItem) {
        await prisma.cartItem.delete({ where: { id: existingItem.id } });
    }

    return NextResponse.json({ success: true });
}
