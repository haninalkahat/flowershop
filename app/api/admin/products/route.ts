
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            include: { variants: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

import { put } from '@vercel/blob';

export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const originalPrice = formData.get('originalPrice') as string;
        const flowerType = formData.get('flowerType') as string;
        const isFeatured = formData.get('isFeatured') === 'true';

        const mainImage = formData.get('mainImage') as File;
        const variantsData = formData.get('variants') as string; // JSON string

        let mainImageUrl = '';

        // Upload Main Image
        if (mainImage) {
            const filename = `${Date.now()}-main-${mainImage.name.replace(/\s+/g, '_')}`;
            const blob = await put(filename, mainImage, { access: 'public' });
            mainImageUrl = blob.url;
        }

        // Create Product
        const product = await prisma.product.create({
            data: {
                name,
                description,
                originalPrice: Number(originalPrice),
                imageUrl: mainImageUrl,
                flowerType: flowerType || 'Mixed',
                isFeatured,
            }
        });

        // Process Variants
        if (variantsData) {
            const variants = JSON.parse(variantsData);
            // variants is array of { colorName, fileIndex } 
            // We need to match fileIndex to the actual files in formData

            // Actually, easier way:
            // Client sends `variant_0_image`, `variant_0_color`, etc?
            // Or just a JSON structure and we map files?

            // Let's assume client sends:
            // variants: JSON string [{ colorName: 'Red', tempId: '123' }]
            // variant_file_123: File

            for (const v of variants) {
                const file = formData.get(`variant_file_${v.tempId}`) as File;
                let variantImageUrl = '';
                if (file) {
                    const vFilename = `${Date.now()}-var-${file.name.replace(/\s+/g, '_')}`;
                    const vBlob = await put(vFilename, file, { access: 'public' });
                    variantImageUrl = vBlob.url;
                }

                await prisma.productVariant.create({
                    data: {
                        productId: product.id,
                        colorName: v.colorName,
                        imageUrl: variantImageUrl
                    }
                });
            }
        }

        return NextResponse.json({ success: true, product });

    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
