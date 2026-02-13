import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SuccessClient from './SuccessClient';

export default async function SuccessPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
        notFound();
    }

    // Serialize Decimal to number/string for client component
    // We only pass what SuccessClient needs
    const serializedOrder = {
        id: order.id,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            selectedColor: item.selectedColor,
            product: {
                id: item.product.id,
                name: item.product.name || 'Unknown Product',
                name_tr: item.product.name_tr,
                name_en: item.product.name_en,
                name_ar: item.product.name_ar,
                imageUrl: item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.jpg'
            }
        }))
    };

    return <SuccessClient order={serializedOrder as any} locale={locale} />;
}
