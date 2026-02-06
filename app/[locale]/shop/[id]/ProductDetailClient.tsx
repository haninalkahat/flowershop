
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Loader2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';
import ProductQuestions from '@/components/ProductQuestions';
import ProductReviews from '@/components/ProductReviews';

export default function ProductDetailClient({ product, initialColor }: { product: any, initialColor?: string }) {
    const t = useTranslations('Product');
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isFavorite = isInWishlist(product.id);

    const toggleWishlist = () => {
        if (isFavorite) removeFromWishlist(product.id);
        else addToWishlist(product.id);
    };

    // Parse variants to get colors
    const hasVariants = product.variants && product.variants.length > 0;

    // Use initialColor if provided and valid, otherwise default to first variant or 'Original'
    const getInitialColor = () => {
        if (initialColor && hasVariants) {
            const variantExists = product.variants.some((v: any) => v.colorName.toLowerCase() === initialColor.toLowerCase());
            if (variantExists) return product.variants.find((v: any) => v.colorName.toLowerCase() === initialColor.toLowerCase()).colorName;
        }
        return hasVariants ? product.variants[0].colorName : 'Original';
    };

    const [selectedColor, setSelectedColor] = useState<string>(getInitialColor());

    // Initial image logic based on selectedColor
    const getInitialImages = () => {
        const color = getInitialColor();
        if (hasVariants) {
            const variant = product.variants.find((v: any) => v.colorName === color);
            // Check if variant has specific images, else fallback to product images
            if (variant && variant.images && variant.images.length > 0) return variant.images;
            if (variant && variant.imageUrl) return [variant.imageUrl]; // Legacy fallback
        }
        return product.images && product.images.length > 0 ? product.images : [product.imageUrl];
    };

    // State for the currently displayed images list (based on variant)
    const [currentImages, setCurrentImages] = useState<string[]>(getInitialImages());
    // State for the main large image being viewed
    const [mainImage, setMainImage] = useState<string>(currentImages[0]);

    // Review Stats
    const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });

    useEffect(() => {
        const fetchReviewStats = async () => {
            try {
                const res = await fetch(`/api/products/${product.id}/reviews`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    const avg = data.length > 0 ? data.reduce((acc: number, r: any) => acc + r.rating, 0) / data.length : 0;
                    setReviewStats({ average: avg, count: data.length });
                }
            } catch (e) { console.error('Failed to fetch review stats'); }
        };
        fetchReviewStats();
    }, [product.id]);

    useEffect(() => {
        // When selectedColor changes, update images
        const color = selectedColor;
        let newImages: string[] = [];

        if (hasVariants) {
            const variant = product.variants.find((v: any) => v.colorName === color);
            if (variant) {
                if (variant.images && variant.images.length > 0) newImages = variant.images;
                else if (variant.imageUrl) newImages = [variant.imageUrl];
                else newImages = product.images || [product.imageUrl];
            } else {
                newImages = product.images || [product.imageUrl];
            }
        } else {
            newImages = product.images || [product.imageUrl];
        }

        setCurrentImages(newImages);
        setMainImage(newImages[0]);
    }, [selectedColor, product, hasVariants]); // Added hasVariants to dependency array for completeness


    // Check if main image should be the default fallback if "Original" is selected?
    // Actually, if variants exist, we probably want to select one.
    // If user clicks "Original" (if we allow deselecting), we show main image.
    // Let's assume strict variant selection if variants exist.

    const [quantity, setQuantity] = useState(1);

    // Calculate current price based on selected variant
    const selectedVariant = hasVariants ? product.variants.find((v: any) => v.colorName === selectedColor) : null;
    const currentPrice = selectedVariant && selectedVariant.price
        ? Number(selectedVariant.price)
        : (product.discountPrice ? Number(product.discountPrice) : Number(product.originalPrice));

    // Effect to update image when variant changes (already handled by handleColorSelect but let's reinforce or simplify)
    // Actually handleColorSelect handles it, but let's ensure it doesn't get messed up.

    // Fix: We need to ensure we don't pass 'Decimal' objects if any slipped through, but we handle that in server component now.

    // Ensure initial image is correct if not set
    // (State initialization already does this)

    // Fix "Ghosting" or "Reset" - straightforward state update.
    // The issue might be that if we re-render or something, we want to stick to the selected variant.

    // One edge case: if we swap variants, but the image is invalid?
    // We assume valid images.

    // Let's ensure handleColorSelect is robust
    const handleColorSelect = (color: string) => {
        if (color === selectedColor) return; // No op
        setSelectedColor(color);
        // Effect will update images
    };

    const [loading, setLoading] = useState(false);

    const handleAddToCart = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            addToCart({
                id: product.id,
                name: product.name,
                description: product.description,
                imageUrl: mainImage,
                // Override original price with current calculated price (variant or base)
                originalPrice: currentPrice,
                discountPrice: null, // Ensure discount is cleared when overriding
                flowerType: product.flowerType,
                images: currentImages,
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
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative w-full aspect-square bg-[#F9F9F9] rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 group">
                            <Image
                                src={mainImage || '/placeholder.jpg'}
                                alt={product.name}
                                fill
                                priority
                                className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <button
                                onClick={toggleWishlist}
                                className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-all duration-300 z-10 group/btn"
                            >
                                <Heart className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 group-hover/btn:text-pink-500'}`} />
                            </button>

                            {/* Floating Info Badges */}
                            {product.isFeatured && (
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                    <span className="text-xs font-semibold text-gray-800 tracking-wide uppercase">Featured</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {currentImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {currentImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-[#F9F9F9] transition-all ${mainImage === img ? 'border-pink-500 ring-2 ring-pink-100' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <Image src={img} alt={`View ${idx}`} fill className="object-contain p-1" sizes="20vw" />
                                    </button>
                                ))}
                            </div>
                        )}
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
                                ${currentPrice.toFixed(2)}
                            </span>
                            {/* Only show "sale" price if we are NOT on a variant specific upgrade that might hide the discount logic, 
                               or if the base product had a discount. Complex logic... 
                               For now, simplified: show current price as the price. */}
                            {!selectedVariant && product.discountPrice && (
                                <span className="text-xl text-gray-300 line-through">
                                    ${Number(product.originalPrice).toFixed(2)}
                                </span>
                            )}
                            <div className="flex items-center gap-1 ml-auto">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-gray-900">{reviewStats.average.toFixed(1)}</span>
                                <span className="text-sm text-gray-400">({reviewStats.count} reviews)</span>
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
                                {product.height && (
                                    <div>
                                        <span className="block text-gray-500 mb-1">Height / Size</span>
                                        <span className="font-medium text-gray-900">{product.height}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="block text-gray-500 mb-1">Freshness</span>
                                    <span className="font-medium text-gray-900">{product.freshness || 'Guaranteed 7 Days'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">Origin</span>
                                    <span className="font-medium text-gray-900">{product.origin || 'Holland / Ecuador'}</span>
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
                                                <Image src={v.images?.[0] || v.imageUrl || '/placeholder.jpg'} alt={v.colorName} fill className="object-cover" sizes="16px" />
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
                            <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 md:px-4 md:py-3 gap-3 md:gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-bold text-gray-900 w-4 text-center text-sm">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={handleAddToCart}
                                disabled={loading}
                                className={`flex-1 bg-gray-900 text-white font-bold py-2 md:py-4 px-4 text-xs md:text-base rounded-full transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 ${loading
                                    ? 'opacity-80 cursor-not-allowed scale-[0.98]'
                                    : 'hover:bg-pink-600 hover:shadow-pink-200'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 md:w-5 md:h-5 animate-spin" />
                                        <span>{t('adding')}</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                        <span>{t('addToCart')} - ${(currentPrice * quantity).toFixed(2)}</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={toggleWishlist}
                                className={`p-2 md:p-4 rounded-full border transition-all flex items-center justify-center ${isFavorite ? 'bg-pink-50 border-pink-200 text-pink-500' : 'border-gray-200 hover:border-pink-300 text-gray-400 hover:text-pink-500'}`}
                            >
                                <Heart className={`w-4 h-4 md:w-6 md:h-6 ${isFavorite ? 'fill-pink-500' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Q&A and Reviews Sections */}
                <ProductQuestions productId={product.id} />
                <ProductReviews productId={product.id} />
            </div>
        </main >
    );
}
