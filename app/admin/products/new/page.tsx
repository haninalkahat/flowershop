
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [flowerType, setFlowerType] = useState('Mixed');
    const [isFeatured, setIsFeatured] = useState(false);
    const [mainImage, setMainImage] = useState<File | null>(null);

    // Variants State
    const [variants, setVariants] = useState<{ tempId: number, colorName: string, file: File | null }[]>([]);

    const handleAddVariant = () => {
        setVariants([...variants, { tempId: Date.now(), colorName: '', file: null }]);
    };

    const handleRemoveVariant = (id: number) => {
        setVariants(variants.filter(v => v.tempId !== id));
    };

    const updateVariant = (id: number, field: 'colorName' | 'file', value: any) => {
        setVariants(variants.map(v => v.tempId === id ? { ...v, [field]: value } : v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('originalPrice', originalPrice);
            formData.append('flowerType', flowerType);
            formData.append('isFeatured', String(isFeatured));
            if (mainImage) formData.append('mainImage', mainImage);

            // Prepare variants metadata
            const variantsMeta = variants.map(v => ({
                tempId: v.tempId,
                colorName: v.colorName
            }));
            formData.append('variants', JSON.stringify(variantsMeta));

            // Append variant files
            variants.forEach(v => {
                if (v.file) {
                    formData.append(`variant_file_${v.tempId}`, v.file);
                }
            });

            const res = await fetch('/api/admin/products', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                alert('Failed to create product');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
                    ← Cancel
                </Link>
                <h1 className="text-3xl font-serif font-bold text-gray-800">New Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">

                {/* General Info */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">General Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                placeholder="e.g. Red Rose Bouquet"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={originalPrice}
                                onChange={e => setOriginalPrice(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Flower Type</label>
                            <select
                                value={flowerType}
                                onChange={e => setFlowerType(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            >
                                <option value="Mixed">Mixed</option>
                                <option value="Roses">Roses</option>
                                <option value="Lilies">Lilies</option>
                                <option value="Tulips">Tulips</option>
                                <option value="Orchids">Orchids</option>
                                <option value="Carnations">Carnations</option>
                                <option value="Sunflowers">Sunflowers</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={isFeatured}
                                onChange={e => setIsFeatured(e.target.checked)}
                                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                            />
                            <label htmlFor="isFeatured" className="font-medium text-gray-700">Feature on Home Page</label>
                        </div>
                    </div>
                </section>

                {/* Main Image */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Main Image</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center">
                        <input
                            type="file"
                            id="mainImage"
                            accept="image/*"
                            onChange={e => setMainImage(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        <label htmlFor="mainImage" className="cursor-pointer flex flex-col items-center">
                            {mainImage ? (
                                <div className="text-green-600 font-medium flex items-center gap-2">
                                    <ImageIcon size={20} />
                                    {mainImage.name}
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                                    <span className="text-gray-600">Click to upload main photo</span>
                                </>
                            )}
                        </label>
                    </div>
                </section>

                {/* Variants */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800">Color Variants</h2>
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                        >
                            <Plus size={16} /> Add Variant
                        </button>
                    </div>

                    {variants.length === 0 && (
                        <p className="text-gray-500 italic text-sm">No variants added yet.</p>
                    )}

                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <div key={variant.tempId} className="flex gap-4 p-4 bg-gray-50 rounded-lg items-start border border-gray-200">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Color Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Blue"
                                        value={variant.colorName}
                                        onChange={e => updateVariant(variant.tempId, 'colorName', e.target.value)}
                                        className="w-full px-3 py-2 border rounded bg-white text-sm"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => updateVariant(variant.tempId, 'file', e.target.files?.[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(variant.tempId)}
                                    className="mt-6 text-gray-400 hover:text-red-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-6 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors shadow-lg disabled:bg-gray-400"
                    >
                        {submitting ? 'Creating Product...' : 'Create Product'}
                    </button>
                </div>

            </form>
        </div>
    );
}
