
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany({ include: { cart: { include: { items: true } } } });
    if (users.length === 0) console.log('No users found.');
    users.forEach(u => {
        console.log(`User: ${u.email} (ID: ${u.id})`);
        if (u.cart) {
            console.log(`  Cart ID: ${u.cart.id}`);
            console.log(`  Items: ${u.cart.items.length}`);
            u.cart.items.forEach(i => console.log(`    - Product: ${i.productId}, Qty: ${i.quantity}`));
        } else {
            console.log('  No cart.');
        }
    });

    console.log('\n--- PRODUCTS ---');
    const products = await prisma.product.findMany();
    console.log(`Total Products: ${products.length}`);
    products.forEach(p => console.log(`  ${p.name} (ID: ${p.id})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
