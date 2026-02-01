
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    try {
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.product.deleteMany();
        console.log('Cleared existing data.');
    } catch (e) {
        console.log('Error clearing data (tables might not exist yet):', e.message);
    }

    // Create products
    const products = [
        {
            name: 'Red Rose Bouquet',
            description: 'A classic bouquet of red roses, perfect for expressing love and passion.',
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
            originalPrice: 49.99,
            discountPrice: 39.99,
            flowerType: 'Rose',
            stemLength: 50,
        },
        {
            name: 'Sunflower Sunshine',
            description: 'Bright and cheerful sunflowers to bring warmth to any room.',
            imageUrl: 'https://images.unsplash.com/photo-1470509037663-253ce7169ac2?auto=format&fit=crop&q=80&w=1000',
            originalPrice: 34.99,
            flowerType: 'Sunflower',
            stemLength: 60,
        },
        {
            name: 'Tulip Garden',
            description: 'A colorful mix of tulips, celebrating the arrival of spring.',
            imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=1000',
            originalPrice: 29.99,
            flowerType: 'Tulip',
            stemLength: 40,
        },
        {
            name: 'Elegant Orchid',
            description: 'A sophisticated orchid plant, a symbol of luxury and beauty.',
            imageUrl: 'https://images.unsplash.com/photo-1566938064504-a6490f055018?auto=format&fit=crop&q=80&w=1000',
            originalPrice: 59.99,
            flowerType: 'Orchid',
            stemLength: 30,
        },
    ];

    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }

    console.log('Seed data inserted successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
