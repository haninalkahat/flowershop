
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

import { put } from '@vercel/blob';

export async function POST(request: Request) {
    const userId = await getUser();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        let receiptUrl = '';

        if (!file) {
            return NextResponse.json({ error: 'Receipt file is required' }, { status: 400 });
        }

        // Upload to Vercel Blob
        try {
            // Check for BLOB_READ_WRITE_TOKEN presence implicitly by catching error if missing/invalid
            console.log(`Uploading file: ${file.name}, Token present: ${!!process.env.BLOB_READ_WRITE_TOKEN}`);

            // Generate unique filename to avoid conflicts/overwrites if necessary and for better organization
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

            const blob = await put(filename, file, { access: 'public' });
            receiptUrl = blob.url;
        } catch (blobError: any) {
            console.error("Blob Upload Error Details:", blobError);
            return NextResponse.json(
                { error: `Failed to upload receipt: ${blobError.message || 'Unknown error'}. Ensure BLOB_READ_WRITE_TOKEN is set correcty.` },
                { status: 500 }
            );
        }

        // Fetch user's cart
        const dbCart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        let orderItems = [];
        let itemsSource = 'db';

        if (dbCart && dbCart.items.length > 0) {
            // Use DB cart
            orderItems = dbCart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.discountPrice
                    ? Number(item.product.discountPrice)
                    : Number(item.product.originalPrice),
                selectedColor: item.selectedColor
            }));
        } else {
            // Fallback: Use client items if provided
            itemsSource = 'client';
            const clientItemsJson = formData.get('items') as string;
            if (clientItemsJson) {
                const clientItems = JSON.parse(clientItemsJson);
                if (Array.isArray(clientItems) && clientItems.length > 0) {
                    // Verify products exist and get real prices
                    for (const item of clientItems) {
                        const product = await prisma.product.findUnique({
                            where: { id: item.id }
                        });

                        if (!product) {
                            return NextResponse.json({ error: `Product '${item.name}' no longer exists. Please clear your cart.` }, { status: 400 });
                        }

                        orderItems.push({
                            productId: product.id,
                            quantity: item.quantity,
                            price: product.discountPrice ? Number(product.discountPrice) : Number(product.originalPrice),
                            selectedColor: item.selectedColor
                        });
                    }
                }
            }
        }

        if (orderItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total
        const totalAmount = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

        const paymentMethod = (formData.get('paymentMethod') as string) || 'BANK_TRANSFER';

        const order = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: 'AWAITING_PAYMENT',
                    paymentMethod: paymentMethod === 'WESTERN_UNION' ? 'WESTERN_UNION' : 'BANK_TRANSFER',
                    items: {
                        create: orderItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            selectedColor: item.selectedColor
                        }))
                    }
                }
            });

            // 2. Add Payment Receipt with blob URL
            await tx.paymentReceipt.create({
                data: {
                    orderId: newOrder.id,
                    imageUrl: receiptUrl
                }
            });

            // 3. Clear Cart (only if we used DB cart)
            if (itemsSource === 'db' && dbCart) {
                await tx.cartItem.deleteMany({
                    where: { cartId: dbCart.id }
                });
            }

            return newOrder;
        });

        return NextResponse.json({ orderId: order.id, success: true });

    } catch (error) {
        console.error('Order creation failed:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

export async function GET() {
    const userId = await getUser();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                },
                receipt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
