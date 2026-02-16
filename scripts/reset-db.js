const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
    console.log('🔄 Starting full database reset for Laffa...');

    try {
        // 1. Database Cleanup
        console.log('🗑️ Cleaning up database...');

        // Delete dependent tables first
        await prisma.review.deleteMany({});
        console.log(' - Reviews deleted');

        await prisma.productQuestion.deleteMany({});
        console.log(' - Product Questions deleted');

        await prisma.wishlistItem.deleteMany({});
        console.log(' - Wishlist Items deleted');

        await prisma.cartItem.deleteMany({});
        console.log(' - Cart Items deleted');

        await prisma.orderItem.deleteMany({});
        console.log(' - Order Items deleted');

        await prisma.paymentReceipt.deleteMany({});
        console.log(' - Payment Receipts deleted');

        await prisma.orderMessage.deleteMany({});
        console.log(' - Order Messages deleted');

        await prisma.order.deleteMany({});
        console.log(' - Orders deleted');

        // Note: ProductVariant has onDelete: Cascade with Product, but we delete explicitly to be safe
        // However, if we delete Product, variants go.
        await prisma.productVariant.deleteMany({});
        console.log(' - Product Variants deleted');

        await prisma.product.deleteMany({});
        console.log(' - Products deleted');

        // Check specific tables mentioned by user that we DO NOT have in schema but might be conceptual
        // "Categories" -> Not in schema. "Questions/FAQs" -> ProductQuestion handled.

        const userCount = await prisma.user.count();
        console.log(`ℹ️ User count remaining: ${userCount} (Admin preserved)`);

        // 2. Cloudinary Cleanup
        console.log('☁️ Cleaning up Cloudinary...');
        const folder = 'flowershop/products';

        try {
            // Trying to delete by prefix. This requires Admin API access (api_secret).
            const imageResult = await cloudinary.api.delete_resources_by_prefix(folder, { resource_type: 'image' });
            console.log(' - Cloudinary images deleted:', imageResult.deleted ? Object.keys(imageResult.deleted).length : 'Unknown');
        } catch (e) {
            console.warn(' - Note: Could not delete Cloudinary images by prefix (maybe folder empty or permissions):', e.message);
        }

        try {
            const videoResult = await cloudinary.api.delete_resources_by_prefix(folder, { resource_type: 'video' });
            console.log(' - Cloudinary videos deleted:', videoResult.deleted ? Object.keys(videoResult.deleted).length : 'Unknown');
        } catch (e) {
            console.warn(' - Note: Could not delete Cloudinary videos by prefix (maybe folder empty or permissions):', e.message);
        }

        // 3. Local Uploads Cleanup
        console.log('📂 Cleaning up public/uploads...');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            let deletedCount = 0;
            for (const file of files) {
                if (file !== '.gitkeep') { // Preserve gitkeep if it exists
                    fs.unlinkSync(path.join(uploadsDir, file));
                    deletedCount++;
                }
            }
            console.log(` - Deleted ${deletedCount} files from public/uploads`);
        } else {
            console.log(' - public/uploads directory not found');
        }

        console.log('✅ Reset complete! Site is ready for Laffa.');

    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
