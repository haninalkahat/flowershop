import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = [
            {
                name: 'Royal Red Roses',
                description: 'Breathtaking long-stemmed red roses for your special someone.',
                imageUrl: '/flower-red.jpg',
                originalPrice: 89.99,
                discountPrice: 69.99,
                flowerType: 'Roses',
            },
            {
                name: 'Pure White Lilies',
                description: 'Elegant white lilies that symbolize purity and grace.',
                imageUrl: '/flower-blue.jpg',
                originalPrice: 54.99,
                discountPrice: null,
                flowerType: 'Lilies',
            },
            {
                name: 'Sunflower Happiness',
                description: 'Bright and cheerful sunflowers to light up any room.',
                imageUrl: '/flower-pink.jpg',
                originalPrice: 45.00,
                discountPrice: 39.99,
                flowerType: 'Sunflowers',
            },
            {
                name: 'Midnight Tulips',
                description: 'Rare dark purple tulips for a touch of mystery.',
                imageUrl: '/flower-tulip.jpg',
                originalPrice: 65.00,
                discountPrice: null,
                flowerType: 'Tulips',
            },
            {
                name: 'Pink Orchid Delight',
                description: 'Stunning pink orchids in a decorative pot.',
                imageUrl: '/flower-lilies.jpg',
                originalPrice: 120.00,
                discountPrice: 99.00,
                flowerType: 'Orchids',
            },
            {
                name: 'Mixed Carnation Bouquet',
                description: 'A colorful mix of fresh carnations.',
                imageUrl: '/flower-red.jpg',
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
