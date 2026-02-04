
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    try {
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.paymentReceipt.deleteMany(); // Clear receipts to avoid constraint errors if needed
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        // We delete products last or handle cascades. 
        // OrderItems and CartItems depend on Products.
        // Assuming cascade delete is set up or we manually clear.
        await prisma.product.deleteMany();
        console.log('Cleared existing data.');
    } catch (e) {
        console.log('Error clearing data (tables might not exist yet):', e.message);
    }

    // Create products
    const products = [
        // NEW PRODUCTS
        {
            name: 'Coral Peony Trio',
            description: 'Three stunning coral-pink peonies in full bloom. A symbol of romance and prosperity.',
            images: ['/three-peonies.jpg'],
            originalPrice: 55.00,
            discountPrice: 49.99,
            flowerType: 'Peony',
            stemLength: 45,
            isFeatured: true,
            freshness: 'Guaranteed 5 Days',
            origin: 'France'
        },
        {
            name: 'Spring Daffodil Delight',
            description: 'Bright yellow and white daffodils to welcome the spring season with joy.',
            images: ['/yellow-white-daffodils.jpg'],
            originalPrice: 32.00,
            flowerType: 'Daffodil',
            stemLength: 40,
            isFeatured: true,
            origin: 'Netherlands'
        },
        {
            name: 'Royal Purple Calla Lilies',
            description: 'Deep purple calla lilies radiating elegance and mystery. Perfect for modern spaces.',
            images: ['/purple-calla-lilies.jpg'],
            originalPrice: 65.00,
            flowerType: 'Calla Lily',
            stemLength: 55,
            isFeatured: true,
            freshness: 'Guaranteed 8 Days'
        },
        {
            name: 'Soft Pink Hydrangea',
            description: 'A cloud of soft pink petals. This large hydrangea head makes a statement on its own.',
            images: ['/pink-hydrangea-large.jpg'],
            originalPrice: 45.00,
            flowerType: 'Hydrangea',
            stemLength: 30,
            isFeatured: false
        },
        {
            name: 'Elegant White Lilies',
            description: 'Classic white lilies representing purity and commitment. A timeless choice.',
            images: ['/white-lilies-stem.jpg'],
            originalPrice: 48.00,
            flowerType: 'Lily',
            stemLength: 60,
            isFeatured: false
        },
        // EXISTING PRODUCTS (Fixed structure)
        {
            name: 'Red Rose Bouquet',
            description: 'A classic bouquet of red roses, perfect for expressing love and passion.',
            images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000'],
            originalPrice: 49.99,
            discountPrice: 39.99,
            flowerType: 'Rose',
            stemLength: 50,
        },
        {
            name: 'Sunflower Sunshine',
            description: 'Bright and cheerful sunflowers to bring warmth to any room.',
            images: ['https://images.unsplash.com/photo-1470509037663-253ce7169ac2?auto=format&fit=crop&q=80&w=1000'],
            originalPrice: 34.99,
            flowerType: 'Sunflower',
            stemLength: 60,
        },
        {
            name: 'Tulip Garden',
            description: 'A colorful mix of tulips, celebrating the arrival of spring.',
            images: ['https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=1000'],
            originalPrice: 29.99,
            flowerType: 'Tulip',
            stemLength: 40,
        },
        {
            name: 'Elegant Orchid',
            description: 'A sophisticated orchid plant, a symbol of luxury and beauty.',
            images: ['https://images.unsplash.com/photo-1566938064504-a6490f055018?auto=format&fit=crop&q=80&w=1000'],
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
