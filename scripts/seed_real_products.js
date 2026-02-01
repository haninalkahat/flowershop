
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const productsToSeed = [
    {
        name: 'White Lilies',
        description: 'A delicate and elegant white lily bouquet, symbolizing purity and refined beauty.',
        price: 34.99,
        flowerType: 'Lilies',
        imagePath: 'C:/Users/hanin/.gemini/antigravity/brain/5a6dec95-3d9e-411f-be3c-4f78f0b4f80b/uploaded_media_0_1769964120265.jpg'
    },
    {
        name: 'Lotus Blossom',
        description: 'A serene and beautiful pink lotus, representing enlightenment and rebirth.',
        price: 19.99,
        flowerType: 'Lotus',
        imagePath: 'C:/Users/hanin/.gemini/antigravity/brain/5a6dec95-3d9e-411f-be3c-4f78f0b4f80b/uploaded_media_1_1769964120265.jpg'
    },
    {
        name: 'Pink & White Tulips',
        description: 'A romantic mix of pink and white tulips, perfect for expressing affection.',
        price: 32.99,
        flowerType: 'Tulips',
        imagePath: 'C:/Users/hanin/.gemini/antigravity/brain/5a6dec95-3d9e-411f-be3c-4f78f0b4f80b/uploaded_media_2_1769964120265.jpg'
    },
    {
        name: 'Red Tulips',
        description: 'Vibrant and fresh red tulips, a classic symbol of perfect love.',
        price: 29.99,
        flowerType: 'Tulips',
        imagePath: 'C:/Users/hanin/.gemini/antigravity/brain/5a6dec95-3d9e-411f-be3c-4f78f0b4f80b/uploaded_media_3_1769964120265.jpg'
    },
    {
        name: 'Sweet Pea',
        description: 'Graceful and colorful sweet pea flowers, known for their delicate fragrance.',
        price: 24.99,
        flowerType: 'Sweet Pea',
        imagePath: 'C:/Users/hanin/.gemini/antigravity/brain/5a6dec95-3d9e-411f-be3c-4f78f0b4f80b/uploaded_media_4_1769964120265.jpg'
    }
];

async function main() {
    console.log('Starting seed process...');

    // 1. Cleanup old data
    console.log('Cleaning up old data...');
    try {
        // Delete dependent records first to avoid foreign key constraints
        await prisma.cartItem.deleteMany({});
        await prisma.paymentReceipt.deleteMany({});
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.product.deleteMany({}); // Now we can delete products
        console.log('Cleanup successful.');
    } catch (error) {
        console.warn('Warning during cleanup (might be acceptable if already empty):', error.message);
    }

    // 2. Upload and Create
    for (const p of productsToSeed) {
        console.log(`Processing: ${p.name}`);

        try {
            // Read file
            if (!fs.existsSync(p.imagePath)) {
                console.error(`File not found: ${p.imagePath}`);
                continue;
            }
            const fileBuffer = fs.readFileSync(p.imagePath);
            const fileName = path.basename(p.imagePath);

            // Upload to Blob
            console.log(`  Uploading image...`);
            const blob = await put(`products/${fileName}`, fileBuffer, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN
            });
            console.log(`  Uploaded to: ${blob.url}`);

            // Create Product in DB
            await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.description,
                    originalPrice: p.price,
                    discountPrice: null, // No discount initially
                    flowerType: p.flowerType,
                    imageUrl: blob.url
                }
            });
            console.log(`  Created product record.`);

        } catch (err) {
            console.error(`  Failed to process ${p.name}:`, err);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
