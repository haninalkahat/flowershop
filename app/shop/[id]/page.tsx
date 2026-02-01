
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch product with variants
    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true }
    });

    if (!product) {
        notFound();
    }

    // Pass serialized date or other non-serializable objects if necessary
    // Prisma Decimal -> Number/String handling might be needed if Client Component tries to render it directly or use it.
    // We can cast decimals to numbers/strings here.

    const formattedProduct = {
        ...product,
        originalPrice: product.originalPrice.toString(),
        discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
        // formatted dates if needed
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };

    return <ProductDetailClient product={formattedProduct} />;
}
