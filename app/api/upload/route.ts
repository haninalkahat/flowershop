
import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file received.' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Determine type roughly from mime or just use auto
        const type = file.type.startsWith('image') ? 'image' :
            file.type.startsWith('video') ? 'video' : 'auto';

        const url = await uploadToCloudinary(buffer, 'flowershop/uploads', type as any);

        return NextResponse.json({ url, success: true });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Error uploading file' },
            { status: 500 }
        );
    }
}
