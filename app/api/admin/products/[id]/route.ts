
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { variants: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const originalPrice = parseFloat(formData.get('originalPrice') as string);
        const flowerType = formData.get('flowerType') as string;
        const origin = formData.get('origin') as string;
        const freshness = formData.get('freshness') as string;
        const height = formData.get('height') as string;

        // Handle Main Images
        // Existing images might be passed as hidden fields or encoded?
        // Let's assume frontend sends `existingImages` as JSON array or simply we replace/append?
        // Simplest: `images_0`, `images_1` etc are NEW files. `existingImages` is a JSON list of URL strings to KEEP.

        const existingImagesJson = formData.get('existingImages') as string;
        let finalMainImages: string[] = JSON.parse(existingImagesJson || '[]');

        for (let i = 0; i < 4; i++) {
            const imageFile = formData.get(`images_${i}`) as File;
            if (imageFile) {
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                const filename = `product-${Date.now()}-${i}-${imageFile.name.replace(/[^a-z0-9.]/gi, '_')}`;
                const publicPath = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(publicPath)) {
                    fs.mkdirSync(publicPath, { recursive: true });
                }
                fs.writeFileSync(path.join(publicPath, filename), buffer);
                finalMainImages.push(`/uploads/${filename}`);
            }
        }
        // Limit to 4 if needed, but existing + new order depends on frontend.
        finalMainImages = finalMainImages.slice(0, 4);


        // Update Product
        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                originalPrice,
                flowerType,
                origin,
                freshness,
                height,
                images: finalMainImages,
                isFeatured: formData.get('isFeatured') === 'true',
            }
        });

        // Handle Variants: Delete existing and recreate
        await prisma.productVariant.deleteMany({
            where: { productId: id }
        });

        const variantsJson = formData.get('variants') as string;
        const variantData = JSON.parse(variantsJson || '[]');

        for (let i = 0; i < variantData.length; i++) {
            const v = variantData[i];

            // Handle Variant Images
            let finalVariantImages: string[] = v.existingImages || []; // Should be passed in variantData

            for (let j = 0; j < 4; j++) {
                const vImageFile = formData.get(`variantImage_${v.tempId}_${j}`) as File;
                if (vImageFile) {
                    const buffer = Buffer.from(await vImageFile.arrayBuffer());
                    const filename = `variant-${Date.now()}-${v.tempId}-${j}-${vImageFile.name.replace(/[^a-z0-9.]/gi, '_')}`;
                    const publicPath = path.join(process.cwd(), 'public', 'uploads');
                    // Ensure publicPath exists for variant images too
                    if (!fs.existsSync(publicPath)) {
                        fs.mkdirSync(publicPath, { recursive: true });
                    }
                    fs.writeFileSync(path.join(publicPath, filename), buffer);
                    finalVariantImages.push(`/uploads/${filename}`);
                }
            }
            finalVariantImages = finalVariantImages.slice(0, 4);
            if (finalVariantImages.length === 0 && finalMainImages.length > 0) {
                finalVariantImages = finalMainImages; // Default to main
            }

            await prisma.productVariant.create({
                data: {
                    productId: id,
                    colorName: v.colorName,
                    price: v.price ? parseFloat(v.price) : null,
                    images: finalVariantImages
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update Product Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
