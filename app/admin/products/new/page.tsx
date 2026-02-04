'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Product State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        originalPrice: '',
        flowerType: 'Rose',
        origin: 'Holland',
        freshness: 'Guaranteed 7 Days',
        height: '50cm',
        isFeatured: false
    });

    const [mainImages, setMainImages] = useState<File[]>([]);

    // Variants State
    const [variants, setVariants] = useState<any[]>([]);
    // { tempId, colorName, price, imageFiles: File[] }

    const addVariant = () => {
        setVariants([...variants, {
            tempId: Date.now(),
            colorName: '',
            price: '',
            imageFiles: []
        }]);
    };

    const removeVariant = (id: number) => {
        setVariants(variants.filter(v => v.tempId !== id));
    };

    const updateVariant = (id: number, field: string, value: any) => {
        setVariants(variants.map(v => v.tempId === id ? { ...v, [field]: value } : v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mainImages.length === 0) {
            toast.error('At least one image is required');
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('originalPrice', formData.originalPrice);
        data.append('flowerType', formData.flowerType);
        data.append('origin', formData.origin);
        data.append('freshness', formData.freshness);
        data.append('height', formData.height);
        data.append('isFeatured', String(formData.isFeatured));

        // Append Main Images
        mainImages.forEach((file, index) => {
            data.append(`images_${index}`, file);
        });

        // Prepare variants metadata (excluding file objects which go separate)
        const variantsMeta = variants.map(v => ({
            tempId: v.tempId,
            colorName: v.colorName,
            price: v.price
        }));
        data.append('variants', JSON.stringify(variantsMeta));

        // Append variant images
        variants.forEach(v => {
            if (v.imageFiles && v.imageFiles.length > 0) {
                v.imageFiles.forEach((file: File, idx: number) => {
                    data.append(`variantImage_${v.tempId}_${idx}`, file);
                });
            }
        });

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                toast.success('Product created successfully');
                router.push('/admin/products');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to create product');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">Add New Product</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input
                                required
                                type="number" step="0.01"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                value={formData.originalPrice}
                                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Flower Type</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all bg-white"
                                value={formData.flowerType}
                                onChange={e => setFormData({ ...formData, flowerType: e.target.value })}
                            >
                                <option value="Rose">Rose</option>
                                <option value="Tulip">Tulip</option>
                                <option value="Lily">Lily</option>
                                <option value="Orchid">Orchid</option>
                                <option value="Mixed">Mixed Bouquet</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-3 pt-6">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 border-gray-300"
                                checked={formData.isFeatured}
                                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                            <label htmlFor="isFeatured" className="text-gray-700 font-medium cursor-pointer">Featured Product</label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Specifications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Specifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Freshness Guarantee</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                value={formData.freshness}
                                onChange={e => setFormData({ ...formData, freshness: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height / Size</label>
                            <input
                                type="text"
                                placeholder="e.g. 50cm"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                value={formData.height}
                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Images */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Product Images (Max 4)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center overflow-hidden">
                                {mainImages[index] ? (
                                    <>
                                        <img
                                            src={URL.createObjectURL(mainImages[index])}
                                            alt={`Preview ${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const filtered = mainImages.filter((_, i) => i !== index);
                                                setMainImages(filtered);
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-pink-500">
                                        <Upload size={24} className="mb-1" />
                                        <span className="text-xs">Upload</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const newImages = [...mainImages];
                                                    // Add to next available slot if we used fixed slots, or just push
                                                    // But here we mapped [0,1,2,3] so we need to fill potentially
                                                    if (index < mainImages.length) {
                                                        newImages[index] = e.target.files[0];
                                                        setMainImages(newImages);
                                                    } else {
                                                        setMainImages([...mainImages, e.target.files[0]]);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Variants */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-xl font-semibold text-gray-700">Color Variants</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                            <Plus size={18} /> Add Variant
                        </button>
                    </div>

                    {variants.length === 0 && <p className="text-gray-500 text-center py-4">No variants added yet. Click above to add different colors.</p>}

                    <div className="space-y-6">
                        {variants.map((variant, index) => (
                            <div key={variant.tempId} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                                <button
                                    type="button"
                                    onClick={() => removeVariant(variant.tempId)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Color Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Red, White"
                                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                                            value={variant.colorName}
                                            onChange={e => updateVariant(variant.tempId, 'colorName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Price (Optional Override)</label>
                                        <input
                                            type="number" step="0.01"
                                            placeholder="Leave blank to use base price"
                                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                                            value={variant.price}
                                            onChange={e => updateVariant(variant.tempId, 'price', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Variant Images (Max 4)</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {/* Existing/Selected Images Preview */}
                                                {variant.imageFiles && variant.imageFiles.map((file: File, idx: number) => (
                                                    <div key={idx} className="relative w-16 h-16 border rounded overflow-hidden group">
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => {
                                                            const newFiles = variant.imageFiles.filter((_: any, i: number) => i !== idx);
                                                            updateVariant(variant.tempId, 'imageFiles', newFiles);
                                                        }} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}

                                                {(!variant.imageFiles || variant.imageFiles.length < 4) && (
                                                    <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 hover:text-pink-500">
                                                        <Plus size={16} />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    const current = variant.imageFiles || [];
                                                                    updateVariant(variant.tempId, 'imageFiles', [...current, e.target.files[0]]);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? 'Creating Product...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
