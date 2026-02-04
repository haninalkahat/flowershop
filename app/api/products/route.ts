import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const productsDb = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: { variants: true }
        });

        // Convert Decimals to Numbers to prevent serialization issues
        const products = productsDb.map(p => ({
            ...p,
            originalPrice: Number(p.originalPrice),
            discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
            variants: p.variants.map(v => ({
                ...v,
                price: v.price ? Number(v.price) : null
            }))
        }));

        return NextResponse.json(products);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
