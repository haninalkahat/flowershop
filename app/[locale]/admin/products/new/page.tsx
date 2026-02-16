'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Upload, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function NewProductPage() {
    const t = useTranslations('Admin.form');
    const tTypes = useTranslations('FlowerTypes');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Product State
    const [formData, setFormData] = useState({
        name_tr: '',
        name_en: '',
        name_ar: '',
        description_tr: '',
        description_en: '',
        description_ar: '',
        originalPrice: '',
        discountPrice: '',
        flowerType: 'Rose',
        origin: 'Holland',
        freshness: 'Guaranteed 7 Days',
        height: '50cm',
        isFeatured: false
    });

    const [mainImages, setMainImages] = useState<File[]>([]);
    const [videoFile, setVideoFile] = useState<File | null>(null);

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
            toast.error(t('imageRequired'));
            return;
        }

        setLoading(true);
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

        // Append Main Images
        mainImages.forEach((file, index) => {
            data.append(`images_${index}`, file);
        });

        if (videoFile) {
            data.append('video', videoFile);
        }

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
                toast.success(t('success'));
                router.push('/admin/products');
            } else {
                const err = await res.json();
                toast.error(err.error || t('error'));
            }
        } catch (error) {
            toast.error(t('genericError'));
        } finally {
            setLoading(false);
        }
    };

    const flowerTypes = [
        "Rose", "Tulip", "Lily", "Orchid", "Mixed", "Hydrangea", "Carnation", "Pampas", "Peony", "Calla Lily", "Daffodil", "Sunflower", "Daisy", "Lily of the Valley"
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">{t('addNewProduct')}</h1>

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
                                value={formData.discountPrice}
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
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 text-left rtl:text-right">{t('specifications')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('origin')}</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left rtl:text-right"
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('freshnessGuarantee')}</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left rtl:text-right"
                                value={formData.freshness}
                                onChange={e => setFormData({ ...formData, freshness: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('heightSize')}</label>
                            <input
                                type="text"
                                placeholder={t('heightPlaceholder')}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left rtl:text-right"
                                value={formData.height}
                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Images */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 text-left rtl:text-right">{t('productImages')} ({t('imagesMax4')})</h2>
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
                                        <span className="text-xs">{t('upload')}</span>
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

                {/* Product Video */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 text-left rtl:text-right">Product Video (Optional)</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center relative">
                        {videoFile ? (
                            <>
                                <video src={URL.createObjectURL(videoFile)} className="max-h-60 rounded mb-4" controls />
                                <button
                                    type="button"
                                    onClick={() => setVideoFile(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
                                >
                                    <X size={18} />
                                </button>
                                <span className="text-sm text-gray-600">{videoFile.name}</span>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-pink-500">
                                <Upload size={32} className="mb-2" />
                                <span className="text-sm font-medium">Click to upload video (MP4, MOV)</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="video/mp4,video/quicktime"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setVideoFile(e.target.files[0]);
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
                        <h2 className="text-xl font-semibold text-gray-700">{t('colorVariants')}</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                            <Plus size={18} /> {t('addVariant')}
                        </button>
                    </div>

                    {variants.length === 0 && <p className="text-gray-500 text-center py-4">{t('noVariants')}</p>}

                    <div className="space-y-6">
                        {variants.map((variant, index) => (
                            <div key={variant.tempId} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                                <button
                                    type="button"
                                    onClick={() => removeVariant(variant.tempId)}
                                    className="absolute top-2 right-2 rtl:left-2 rtl:right-auto text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 text-left rtl:text-right">{t('colorName')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('colorPlaceholder')}
                                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-left rtl:text-right"
                                            value={variant.colorName}
                                            onChange={e => updateVariant(variant.tempId, 'colorName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 text-left rtl:text-right">{t('priceOverride')}</label>
                                        <input
                                            type="number" step="0.01"
                                            placeholder={t('priceOverridePlaceholder')}
                                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-left rtl:text-right"
                                            value={variant.price}
                                            onChange={e => updateVariant(variant.tempId, 'price', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-2 text-left rtl:text-right">{t('variantImages')} ({t('imagesMax4')})</label>
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
                        {loading ? t('creating') : t('createProduct')}
                    </button>
                </div>
            </form>
        </div>
    );
}
