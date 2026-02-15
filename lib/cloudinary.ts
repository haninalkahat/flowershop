import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * 
 * @param buffer The file buffer to upload.
 * @param folder The folder in Cloudinary to store the file (default: 'flowershop/products').
 * @param resourceType The type of resource ('image', 'video', 'raw', 'auto').
 * @returns The secure URL of the uploaded file.
 */
export const uploadToCloudinary = (
    buffer: Buffer,
    folder: string = 'flowershop/products',
    resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<string> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
                // Add auto-format and auto-quality transformations for optimization
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Unknown upload error'));
                }
            }
        ).end(buffer);
    });
};

export default cloudinary;
