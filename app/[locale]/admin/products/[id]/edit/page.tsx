'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, Save, ArrowLeft, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { use } from 'react';
import { useTranslations } from 'next-intl';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations('Admin.form');
    const tTypes = useTranslations('FlowerTypes');
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Product State
    const [formData, setFormData] = useState({
        name_tr: '',
        name_en: '',
        name_ar: '',
        description_tr: '',
        description_en: '',
        description_ar: '',
        name: '', // Derived/Legacy
        description: '', // Derived/Legacy
        originalPrice: '',
        discountPrice: '',
        flowerType: 'Rose',
        origin: 'Holland',
        freshness: 'Guaranteed 7 Days',
        height: '50cm',
        images: [] as string[],
        isFeatured: false
    });

    const [mainImageFiles, setMainImageFiles] = useState<File[]>([]);

    // Variants State
    const [variants, setVariants] = useState<any[]>([]);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/admin/products/${id}`);
            if (res.ok) {
                const product = await res.json();
                setFormData({
                    name_tr: product.name_tr || '',
                    name_en: product.name_en || product.name || '',
                    name_ar: product.name_ar || '',
                    description_tr: product.description_tr || '',
                    description_en: product.description_en || product.description || '',
                    description_ar: product.description_ar || '',
                    name: product.name,
                    description: product.description || '',
                    originalPrice: product.originalPrice.toString(),
                    discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
                    flowerType: product.flowerType || 'Rose',
                    origin: product.origin || '',
                    freshness: product.freshness || '',
                    height: product.height || '',
                    images: product.images || (product.imageUrl ? [product.imageUrl] : []),
                    isFeatured: product.isFeatured
                });

                // Map existing variants
                setVariants(product.variants.map((v: any) => ({
                    tempId: v.id,
                    colorName: v.colorName,
                    price: v.price ? String(v.price) : '',
                    existingImages: v.images || (v.imageUrl ? [v.imageUrl] : []),
                    imageFiles: []
                })));
            } else {
                toast.error('Product not found');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading product');
        } finally {
            setLoading(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, {
            tempId: Date.now(),
            colorName: '',
            price: '',
            existingImages: [],
            imageFiles: []
        }]);
    };

    const removeVariant = (id: string | number) => {
        setVariants(variants.filter(v => v.tempId !== id));
    };

    const updateVariant = (id: string | number, field: string, value: any) => {
        setVariants(variants.map(v => v.tempId === id ? { ...v, [field]: value } : v));
    };

    const handleDeleteProduct = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Product deleted');
                router.push('/admin/products');
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) {
            toast.error('Error deleting');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSaving(true);
        const data = new FormData();
        data.append('name_tr', formData.name_tr);
        data.append('name_en', formData.name_en);
        data.append('name_ar', formData.name_ar);
        data.append('description_tr', formData.description_tr);
        data.append('description_en', formData.description_en);
        data.append('description_ar', formData.description_ar);
        // Fallback for legacy fields
        data.append('name', formData.name_en || formData.name_tr || formData.name_ar);
        data.append('description', formData.description_en || formData.description_tr || formData.description_ar);
        data.append('originalPrice', formData.originalPrice);
        data.append('discountPrice', formData.discountPrice);
        data.append('flowerType', formData.flowerType);
        data.append('origin', formData.origin);
        data.append('freshness', formData.freshness);
        data.append('height', formData.height);
        data.append('isFeatured', String(formData.isFeatured));

        // Existing images to keep (passed as JSON string)
        data.append('existingImages', JSON.stringify(formData.images));

        // New Main Images
        mainImageFiles.forEach((file, index) => {
            data.append(`images_${index}`, file);
        });

        // Prepare variants metadata
        const variantsMeta = variants.map(v => ({
            tempId: v.tempId,
            colorName: v.colorName,
            price: v.price,
            existingImages: v.existingImages || []
        }));
        data.append('variants', JSON.stringify(variantsMeta));

        // Append variant new image files
        variants.forEach(v => {
            if (v.imageFiles && v.imageFiles.length > 0) {
                v.imageFiles.forEach((file: File, idx: number) => {
                    data.append(`variantImage_${v.tempId}_${idx}`, file);
                });
            }
        });

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'PUT',
                body: data
            });

            if (res.ok) {
                toast.success('Product updated successfully');
                router.refresh();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to update product');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSaving(false);
        }
    };


    const flowerTypes = [
        "Rose", "Tulip", "Lily", "Orchid", "Mixed", "Hydrangea", "Carnation", "Pampas", "Peony", "Calla Lily", "Daffodil", "Sunflower", "Daisy", "Lily of the Valley"
    ];

    if (loading) return <div className="p-10 text-center">{t('loading')}</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors">
                    <ArrowLeft size={20} /> {t('backToShop')}
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={handleDeleteProduct}
                        className="text-red-500 hover:text-red-700 px-4 py-2 border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Trash size={18} /> {t('delete')}
                    </button>
                </div>
            </div>

            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">{t('editProduct')}: {formData.name_en || formData.name}</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 text-left rtl:text-right">{t('basicInfo')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('productName')} (TR / EN / AR)</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Turkish Name"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-left"
                                    value={formData.name_tr}
                                    onChange={e => setFormData({ ...formData, name_tr: e.target.value })}
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="English Name"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-left"
                                    value={formData.name_en}
                                    onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Arabic Name"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-right"
                                    value={formData.name_ar}
                                    onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('price')}</label>
                            <input
                                required
                                type="number" step="0.01"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-left rtl:text-right"
                                value={formData.originalPrice}
                                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">Discount Price (Optional)</label>
                            <input
                                type="number" step="0.01"
                                placeholder="Leave empty if no discount"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-left rtl:text-right"
                                value={formData.discountPrice ?? ''}
                                onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('flowerType')}</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all bg-white text-left rtl:text-right"
                                value={formData.flowerType}
                                onChange={e => setFormData({ ...formData, flowerType: e.target.value })}
                            >
                                {flowerTypes.map(type => (
                                    <option key={type} value={type}>
                                        {/* @ts-ignore */}
                                        {tTypes(type.toLowerCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-3 pt-6 rtl:space-x-reverse">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 border-gray-300"
                                checked={formData.isFeatured}
                                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                            <label htmlFor="isFeatured" className="text-gray-700 font-medium cursor-pointer selects-none">{t('featuredProduct')}</label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('description')} (TR / EN / AR)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <textarea
                                rows={4}
                                placeholder="Turkish Description"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-left"
                                value={formData.description_tr}
                                onChange={e => setFormData({ ...formData, description_tr: e.target.value })}
                            />
                            <textarea
                                required
                                rows={4}
                                placeholder="English Description"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-left"
                                value={formData.description_en}
                                onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                            />
                            <textarea
                                rows={4}
                                placeholder="Arabic Description"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-right"
                                value={formData.description_ar}
                                onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                            />
                        </div>
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
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Main Images (Max 4)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Show Existing Images */}
                        {formData.images.map((url, idx) => (
                            <div key={`exist-${idx}`} className="relative aspect-square border rounded-lg overflow-hidden group">
                                <Image src={url} alt="Current" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            images: formData.images.filter((_, i) => i !== idx)
                                        });
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">Existing</span>
                            </div>
                        ))}

                        {/* Show New Files */}
                        {mainImageFiles.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square border rounded-lg overflow-hidden group">
                                <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMainImageFiles(mainImageFiles.filter((_, i) => i !== idx));
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                                <span className="absolute bottom-1 right-1 bg-blue-500/80 text-white text-xs px-1 rounded">New</span>
                            </div>
                        ))}

                        {/* Upload Button */}
                        {(formData.images.length + mainImageFiles.length) < 4 && (
                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-pink-500">
                                <Upload size={24} className="mb-1" />
                                <span className="text-xs">Add Image</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setMainImageFiles([...mainImageFiles, e.target.files[0]]);
                                        }
                                    }}
                                />
                            </label>
                        )}
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
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-2">Variant Images (Max 4)</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {/* Existing */}
                                            {variant.existingImages && variant.existingImages.map((url: string, idx: number) => (
                                                <div key={`vexist-${idx}`} className="relative w-16 h-16 border rounded overflow-hidden group">
                                                    <Image src={url} alt="Variant" fill className="object-cover" />
                                                    <button type="button" onClick={() => {
                                                        const newExisting = variant.existingImages.filter((_: any, i: number) => i !== idx);
                                                        updateVariant(variant.tempId, 'existingImages', newExisting);
                                                    }} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* New Files */}
                                            {variant.imageFiles && variant.imageFiles.map((file: File, idx: number) => (
                                                <div key={`vnew-${idx}`} className="relative w-16 h-16 border rounded overflow-hidden group">
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => {
                                                        const newFiles = variant.imageFiles.filter((_: any, i: number) => i !== idx);
                                                        updateVariant(variant.tempId, 'imageFiles', newFiles);
                                                    }} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add Button */}
                                            {((variant.existingImages?.length || 0) + (variant.imageFiles?.length || 0) < 4) && (
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
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-20">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
                    >
                        <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
