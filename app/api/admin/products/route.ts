import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: { variants: true }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        // Localized fields
        const name_tr = formData.get('name_tr') as string;
        const name_en = formData.get('name_en') as string;
        const name_ar = formData.get('name_ar') as string;
        const description_tr = formData.get('description_tr') as string;
        const description_en = formData.get('description_en') as string;
        const description_ar = formData.get('description_ar') as string;

        const originalPrice = parseFloat(formData.get('originalPrice') as string);
        const discountPriceStr = formData.get('discountPrice');
        const discountPrice = discountPriceStr ? parseFloat(discountPriceStr as string) : null;
        const flowerType = formData.get('flowerType') as string;
        const origin = formData.get('origin') as string;
        const freshness = formData.get('freshness') as string;
        const height = formData.get('height') as string;

        // Handle Video Upload
        const videoFile = formData.get('video') as File;
        let videoUrl = null;
        if (videoFile && videoFile.size > 0) {
            const buffer = Buffer.from(await videoFile.arrayBuffer());
            const filename = `video-${Date.now()}-${videoFile.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const publicPath = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(publicPath)) {
                fs.mkdirSync(publicPath, { recursive: true });
            }
            fs.writeFileSync(path.join(publicPath, filename), buffer);
            videoUrl = `/uploads/${filename}`;
        }

        // Handle Multiple Main Images (Up to 4)
        const mainImageUrls: string[] = [];
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
                mainImageUrls.push(`/uploads/${filename}`);
            }
        }

        // Process variants
        const variantsJson = formData.get('variants') as string;
        const variantData = JSON.parse(variantsJson || '[]');

        // Create Product
        const product = await prisma.product.create({
            data: {
                name,
                description,
                name_tr,
                name_en,
                name_ar,
                description_tr,
                description_en,
                description_ar,
                originalPrice,
                discountPrice,
                flowerType,
                origin,
                freshness,
                height,
                images: mainImageUrls,
                videoUrl,
                isFeatured: formData.get('isFeatured') === 'true',
            }
        });

        // Handle Variants
        for (let i = 0; i < variantData.length; i++) {
            const v = variantData[i];

            // Handle Multiple Variant Images
            const variantImageUrls: string[] = [];
            for (let j = 0; j < 4; j++) {
                const vImageFile = formData.get(`variantImage_${v.tempId}_${j}`) as File;
                if (vImageFile) {
                    const buffer = Buffer.from(await vImageFile.arrayBuffer());
                    const filename = `variant-${Date.now()}-${v.tempId}-${j}-${vImageFile.name.replace(/[^a-z0-9.]/gi, '_')}`;
                    const publicPath = path.join(process.cwd(), 'public', 'uploads');
                    fs.writeFileSync(path.join(publicPath, filename), buffer);
                    variantImageUrls.push(`/uploads/${filename}`);
                }
            }

            // Fallback to main images if none provided (or just empty array? Logic choice: empty usually or main[0])
            // If no specific variant images, we might leave it empty or clone main images. 
            // Product requirements say: "implement an image gallery... to display these 4 images".
            // Let's default to main images if empty, or just empty. 
            // Better behavior: If explicit variant images, use them. Else empty (inherits, or just use product.images on frontend).
            // Let's use empty if none uploaded specific to variant, unless we want to copy.
            // Actually, frontend usually falls back to product images if variant matches. 
            // But let's copy main images if 0 variant images are uploaded, for simplicity in DB.
            const finalVariantImages = variantImageUrls.length > 0 ? variantImageUrls : mainImageUrls;

            await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    colorName: v.colorName,
                    price: v.price ? parseFloat(v.price) : null,
                    images: finalVariantImages
                }
            });
        }

        return NextResponse.json({ success: true, product });

    } catch (error: any) {
        console.error('Create Product Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
