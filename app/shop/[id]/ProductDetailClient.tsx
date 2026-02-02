
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProductDetailClient({ product }: { product: any }) {
    const { addToCart } = useCart();

    // Parse variants to get colors
    // We assume backend returns: { ..., variants: [{ colorName: 'Red', imageUrl: '...' }] }

    // Default to the first variant color if available, or 'Original'
    const hasVariants = product.variants && product.variants.length > 0;

    const [selectedColor, setSelectedColor] = useState<string>(
        hasVariants ? product.variants[0].colorName : 'Original'
    );

    // Initial image is main image or first variant
    const [currentImage, setCurrentImage] = useState<string>(
        hasVariants ? product.variants[0].imageUrl : product.imageUrl
    );

    // Check if main image should be the default fallback if "Original" is selected?
    // Actually, if variants exist, we probably want to select one.
    // If user clicks "Original" (if we allow deselecting), we show main image.
    // Let's assume strict variant selection if variants exist.

    const [quantity, setQuantity] = useState(1);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        const variant = product.variants.find((v: any) => v.colorName === color);
        if (variant) {
            setCurrentImage(variant.imageUrl);
        }
    };

    const price = product.discountPrice ? Number(product.discountPrice) : Number(product.originalPrice);

    const [loading, setLoading] = useState(false);

    // ... imports need to include toast and Loader2 ... 
    // Wait, I can't easily add imports with replace_file_content if they are far away.
    // I should check imports first.

    // Skipping import check for a moment, assuming I can add them if I do a wider replace or use multi_replace.
    // Actually, let's use multi_replace to add imports and logic.

    const handleAddToCart = async () => {
        if (loading) return;
        setLoading(true);
        try {
            // Simulate a brief network delay for better UX (optional, but requested "briefly")
            await new Promise(resolve => setTimeout(resolve, 500));

            addToCart({
                id: product.id,
                name: product.name,
                description: product.description,
                imageUrl: currentImage,
                originalPrice: Number(product.originalPrice),
                discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
                flowerType: product.flowerType,
                selectedColor: selectedColor !== 'Original' ? selectedColor : undefined
            }, quantity);

            toast.success(`${product.name} added to cart! 🌸`);
        } catch (error) {
            toast.error('Could not add to cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white pt-24 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/shop" className="hover:text-pink-600 transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Shop
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Image */}
                    <div className="relative bg-gray-50 rounded-3xl overflow-hidden aspect-square border border-gray-100 shadow-sm group">
                        <div className="relative w-full h-full">
                            {/* Wrapper div for Fill image */}
                            <Image
                                src={currentImage}
                                alt={product.name}
                                fill
                                className="object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col justify-center">
                        <span className="text-pink-600 font-bold tracking-widest uppercase text-sm mb-2">
                            {product.flowerType}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-3xl font-medium text-gray-900">
                                ${price.toFixed(2)}
                            </span>
                            {product.discountPrice && (
                                <span className="text-xl text-gray-300 line-through">
                                    ${Number(product.originalPrice).toFixed(2)}
                                </span>
                            )}
                            <div className="flex items-center gap-1 ml-auto">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-gray-900">4.9</span>
                                <span className="text-sm text-gray-400">(128 reviews)</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
                            {product.description}
                        </p>

                        {/* Specifications */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Specifications</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 mb-1">Flower Type</span>
                                    <span className="font-medium text-gray-900">{product.flowerType}</span>
                                </div>
                                {product.stemLength && (
                                    <div>
                                        <span className="block text-gray-500 mb-1">Stem Length</span>
                                        <span className="font-medium text-gray-900">{product.stemLength} cm</span>
                                    </div>
                                )}
                                <div>
                                    <span className="block text-gray-500 mb-1">Freshness</span>
                                    <span className="font-medium text-gray-900">Guaranteed 7 Days</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">Origin</span>
                                    <span className="font-medium text-gray-900">Holland / Ecuador</span>
                                </div>
                            </div>
                        </div>

                        {/* Color Selection */}
                        {hasVariants && (
                            <div className="mb-8">
                                <span className="block text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                                    Select Color: <span className="text-pink-600">{selectedColor}</span>
                                </span>
                                <div className="flex gap-4 flex-wrap">
                                    {product.variants.map((v: any) => (
                                        <button
                                            key={v.id}
                                            onClick={() => handleColorSelect(v.colorName)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedColor === v.colorName
                                                ? 'border-pink-600 bg-pink-50 text-pink-700 font-medium'
                                                : 'border-gray-200 hover:border-pink-300 text-gray-600'
                                                }`}
                                        >
                                            <div className="w-4 h-4 rounded-full border shadow-sm relative overflow-hidden">
                                                <Image src={v.imageUrl} alt={v.colorName} fill className="object-cover" sizes="16px" />
                                            </div>
                                            {v.colorName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 border-t border-gray-100 pt-8">
                            {/* Quantity */}
                            <div className="flex items-center border border-gray-200 rounded-full px-4 py-3 gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-gray-900 w-4 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={handleAddToCart}
                                disabled={loading}
                                className={`flex-1 bg-gray-900 text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 ${loading
                                        ? 'opacity-80 cursor-not-allowed scale-[0.98]'
                                        : 'hover:bg-pink-600 hover:shadow-pink-200'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>Add to Cart - ${(price * quantity).toFixed(2)}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
