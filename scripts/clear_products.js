const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Clearing all product data...');

    // OrderItems and CartItems depend on Products, so we might need to cascade delete or clear them too.
    // Ideally we wipe everything to start fresh as requested "Clear all existing product data".
    // This usually implies clearing orders/cart items linked to them to avoid FK errors.

    await prisma.orderItem.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    console.log('✅ All product data cleared.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
