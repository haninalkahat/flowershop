
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ variant?: string }>
}) {
    const { id } = await params;
    const { variant } = await searchParams;

    // Fetch product with variants
    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true }
    });

    if (!product) {
        notFound();
    }

    const formattedProduct = JSON.parse(JSON.stringify({
        ...product,
        originalPrice: Number(product.originalPrice),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
        // @ts-ignore
        images: product.images || (product.imageUrl ? [product.imageUrl] : []),
        // @ts-ignore - Prisma types update lag
        variants: product.variants.map(v => ({
            ...v,
            // @ts-ignore
            price: v.price ? Number(v.price) : null,
            // @ts-ignore
            images: v.images || (v.imageUrl ? [v.imageUrl] : [])
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    }));

    return <ProductDetailClient product={formattedProduct} initialColor={variant} />;
}
