import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = [
            // New Featured Products (3)
            {
                name: 'Midnight Calla Lilies',
                description: 'Elegant and mysterious dark purple calla lilies, perfect for a sophisticated statement.',
                images: ['/calla-lily.jpg'],
                originalPrice: 75.00,
                discountPrice: null,
                flowerType: 'Lilies',
                isFeatured: true,
                origin: 'Holland',
                freshness: 'Guaranteed 7 Days',
            },
            {
                name: 'Elegant White Lilies',
                description: 'Pristine white lilies that radiate purity and grace. A classic choice for any refined setting.',
                images: ['/white-lily-fresh.jpg'],
                originalPrice: 60.00,
                discountPrice: 55.00,
                flowerType: 'Lilies',
                isFeatured: true,
                origin: 'France',
                freshness: 'Guaranteed 5 Days',
            },
            {
                name: 'Blushing Peonies',
                description: 'Lush pink peonies with voluminous layers of petals. A symbol of romance and prosperity.',
                images: ['/pink-peony.jpg'],
                originalPrice: 95.00,
                discountPrice: null,
                flowerType: 'Peonies',
                isFeatured: true,
                origin: 'Holland',
                freshness: 'Guaranteed 5 Days',
            },
            // Other New Products (2)
            {
                name: 'Spring Daffodils',
                description: 'Bright and cheery daffodils to welcome the warmth of spring.',
                images: ['/daffodil.jpg'],
                originalPrice: 40.00,
                discountPrice: null,
                flowerType: 'Daffodils',
                isFeatured: false,
                origin: 'UK',
                freshness: 'Guaranteed 5 Days',
            },
            {
                name: 'Pink Hydrangea Cloud',
                description: 'A voluminous cloud of soft pink hydrangea blooms.',
                images: ['/hydrangea-pink.jpg'],
                originalPrice: 55.00,
                discountPrice: 48.00,
                flowerType: 'Hydrangea',
                isFeatured: false,
                origin: 'Colombia',
                freshness: 'Guaranteed 7 Days',
            },
            // Existing Products
            {
                name: 'Royal Red Roses',
                description: 'Breathtaking long-stemmed red roses for your special someone.',
                images: ['/flower-red.jpg'],
                originalPrice: 89.99,
                discountPrice: 69.99,
                flowerType: 'Roses',
            },
            {
                name: 'Pure White Lilies',
                description: 'Elegant white lilies that symbolize purity and grace.',
                images: ['/flower-blue.jpg'],
                originalPrice: 54.99,
                discountPrice: null,
                flowerType: 'Lilies',
            },
            {
                name: 'Sunflower Happiness',
                description: 'Bright and cheerful sunflowers to light up any room.',
                images: ['/flower-pink.jpg'],
                originalPrice: 45.00,
                discountPrice: 39.99,
                flowerType: 'Sunflowers',
            },
            {
                name: 'Midnight Tulips',
                description: 'Rare dark purple tulips for a touch of mystery.',
                images: ['/flower-tulip.jpg'],
                originalPrice: 65.00,
                discountPrice: null,
                flowerType: 'Tulips',
            },
            {
                name: 'Pink Orchid Delight',
                description: 'Stunning pink orchids in a decorative pot.',
                images: ['/flower-lilies.jpg'],
                originalPrice: 120.00,
                discountPrice: 99.00,
                flowerType: 'Orchids',
            },
            {
                name: 'Mixed Carnation Bouquet',
                description: 'A colorful mix of fresh carnations.',
                images: ['/flower-red.jpg'],
                originalPrice: 35.00,
                discountPrice: null,
                flowerType: 'Carnations',
            },
        ];

        for (const product of products) {
            await prisma.product.upsert({
                where: { id: product.name.replace(/\s+/g, '-').toLowerCase() }, // Using name as a mock ID for upsert
                update: product,
                create: {
                    ...product,
                    id: product.name.replace(/\s+/g, '-').toLowerCase(),
                },
            });
        }

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
