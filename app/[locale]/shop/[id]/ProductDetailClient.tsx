
'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext'; // Added
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Loader2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';
import ProductQuestions from '@/components/ProductQuestions';
import ProductReviews from '@/components/ProductReviews';

export default function ProductDetailClient({ product, initialColor }: { product: any, initialColor?: string }) {
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');
    const tTypes = useTranslations('FlowerTypes');
    const locale = useLocale();

    // Localized Name/Description Helpers
    const getName = () => {
        if (locale === 'tr') return product.name_tr || product.name_en || product.name;
        if (locale === 'ar') return product.name_ar || product.name_en || product.name;
        return product.name_en || product.name;
    };

    const calculateDiscountPercentage = (original: number, discount: number) => {
        if (!original || !discount) return 0;
        return Math.round(((original - discount) / original) * 100);
    };

    const getDescription = () => {
        if (locale === 'tr') return product.description_tr || product.description_en || product.description;
        if (locale === 'ar') return product.description_ar || product.description_en || product.description;
        return product.description_en || product.description;
    };

    const displayName = getName();
    const displayDescription = getDescription();

    const { addToCart } = useCart();
    const { formatPrice } = useCurrency(); // Added
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
    const effectiveDiscountPrice = product.discountPrice ? Number(product.discountPrice) : null;
    const currentPrice = selectedVariant && selectedVariant.price
        ? Number(selectedVariant.price)
        : (effectiveDiscountPrice !== null ? effectiveDiscountPrice : Number(product.originalPrice));

    const showDiscount = !selectedVariant && product.discountPrice;

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
                name: displayName,
                description: displayDescription,
                imageUrl: mainImage,
                // Override original price with current calculated price (variant or base)
                originalPrice: currentPrice,
                discountPrice: null, // Ensure discount is cleared when overriding
                flowerType: product.flowerType,
                images: currentImages,
                selectedColor: selectedColor !== 'Original' ? selectedColor : undefined
            }, quantity);

            toast.success(tCommon('productAddedToCart', { name: displayName }), {
                position: 'top-center',
                style: {
                    background: '#ECFDF5', // Light green
                    color: '#065F46',     // Dark green
                    border: '1px solid #A7F3D0',
                },
                iconTheme: {
                    primary: '#10B981', // Green icon
                    secondary: '#ECFDF5',
                },
            });
        } catch (error) {
            toast.error(tCommon('failedAddToCart'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white pt-24 pb-20">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl overflow-hidden">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/shop" className="hover:text-pink-600 transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Shop
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate">{displayName}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative w-full aspect-square bg-[#F9F9F9] rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 group">
                            <Image
                                src={mainImage || '/placeholder.jpg'}
                                alt={displayName}
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
                            {/* @ts-ignore */}
                            {tTypes(product.flowerType.toLowerCase())}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4 leading-tight">
                            {displayName}
                        </h1>
                        {/* Price & Rating */}
                        {/* Price & Rating */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="text-3xl font-medium text-gray-900">
                                {formatPrice(currentPrice)}
                            </span>
                            {showDiscount && (
                                <>
                                    <span className="text-xl text-gray-300 line-through">
                                        {formatPrice(Number(product.originalPrice))}
                                    </span>
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-bold">
                                        -{calculateDiscountPercentage(Number(product.originalPrice), Number(product.discountPrice))}%
                                    </span>
                                </>
                            )}
                            <div className="flex items-center gap-1 md:ml-auto w-full md:w-auto mt-2 md:mt-0">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-gray-900">{reviewStats.average.toFixed(1)}</span>
                                <span className="text-sm text-gray-400">({reviewStats.count} reviews)</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
                            {displayDescription}
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
                        {/* Actions */}
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border-t border-gray-100 pt-6 mt-6">
                            {/* Quantity */}
                            <div className="order-1 h-12 flex items-center border border-gray-200 rounded-full px-3 gap-3 shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-gray-900 w-4 text-center text-sm">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Wishlist (Heart) - Reordered for mobile layout */}
                            <button
                                onClick={toggleWishlist}
                                className={`order-2 md:order-3 h-12 w-12 shrink-0 rounded-full border transition-all flex items-center justify-center ${isFavorite ? 'bg-pink-50 border-pink-200 text-pink-500' : 'border-gray-200 hover:border-pink-300 text-gray-400 hover:text-pink-500'}`}
                            >
                                <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'fill-pink-500' : ''}`} />
                            </button>

                            {/* Add to Cart - Full width on mobile wrap */}
                            <button
                                onClick={handleAddToCart}
                                disabled={loading}
                                className={`order-3 md:order-2 w-full md:w-auto flex-1 h-12 bg-gray-900 text-white font-bold px-4 text-sm md:text-base rounded-full transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 whitespace-nowrap ${loading
                                    ? 'opacity-80 cursor-not-allowed scale-[0.98]'
                                    : 'hover:bg-pink-600 hover:shadow-pink-200'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{t('adding')}</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>{tCommon('addToCart')} - {formatPrice(currentPrice * quantity)}</span>
                                    </>
                                )}
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
