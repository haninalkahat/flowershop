'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useCart, Product } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext'; // Added
import { toast } from 'react-hot-toast';
import { Loader2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

import { useTranslations, useLocale } from 'next-intl';

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency(); // Added

    const getName = () => {
        if (locale === 'tr') return product.name_tr || product.name_en || product.name;
        if (locale === 'ar') return product.name_ar || product.name_en || product.name;
        return product.name_en || product.name;
    };

    const getDescription = () => {
        if (locale === 'tr') return product.description_tr || product.description_en || product.description;
        if (locale === 'ar') return product.description_ar || product.description_en || product.description;
        return product.description_en || product.description;
    };

    const calculateDiscountPercentage = (original: number, discount: number) => {
        if (!original || !discount) return 0;
        return Math.round(((original - discount) / original) * 100);
    };

    const displayName = getName();
    const displayDescription = getDescription();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isFavorite = isInWishlist(product.id);
    const [loading, setLoading] = useState(false);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFavorite) removeFromWishlist(product.id);
        else addToWishlist(product.id);
    };

    const handleAddToCart = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief simulated delay
            addToCart(product, 1);
            toast.success(tCommon('addedToCart'));
        } catch (error) {
            toast.error(tCommon('failedAddToCart'));
        } finally {
            setLoading(false);
        }
    };

    const displayPrice = product.discountPrice !== null ? Number(product.discountPrice) : Number(product.originalPrice);


    // Helper to get link with variant
    const getProductLink = () => {
        if (product && product.variants && product.variants.length > 0) {
            // Default to first variant, but if we had state for selected swatch preview it would be better.
            // For now, simple link to product page. Swatches below will link to specific variants.
            return `/shop/${product.id}`;
        }
        return `/shop/${product.id}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
            <Link href={getProductLink()} className="block relative w-full aspect-square bg-[#F9F9F9] cursor-pointer overflow-hidden p-6">
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(e);
                        }}
                        className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-pink-50 transition-colors group/heart"
                    >
                        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 group-hover/heart:text-pink-500'}`} />
                    </button>
                </div>

                {product.discountPrice && (
                    <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        -{calculateDiscountPercentage(Number(product.originalPrice), Number(product.discountPrice))}%
                    </div>
                )}

                <div className="relative w-full h-full transform transition-transform duration-500 group-hover:scale-110">
                    <Image
                        src={product.images?.[0] || product.imageUrl || '/placeholder.jpg'}
                        alt={displayName}
                        fill
                        className="object-contain drop-shadow-sm"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={priority}
                    />
                </div>
            </Link>

            <div className="p-4 flex flex-col flex-grow bg-white relative z-20 text-center">
                <Link href={getProductLink()} className="flex-grow flex flex-col items-center">
                    <h3 className="text-base font-semibold text-pink-700 mb-1 font-serif hover:text-pink-900 transition-colors line-clamp-1">{displayName}</h3>
                    <p className="text-gray-600 mb-3 text-xs line-clamp-2">{displayDescription}</p>
                </Link>

                {product.variants && product.variants.length > 0 && (
                    <div className="flex gap-1.5 mb-3 justify-center">
                        {product.variants.slice(0, 5).map((v: any) => (
                            <Link
                                key={v.id}
                                href={`/shop/${product.id}?variant=${v.colorName}`}
                                className="w-4 h-4 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: v.colorName.toLowerCase() }}
                                title={v.colorName}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ))}
                        {product.variants.length > 5 && (
                            <span className="text-[10px] text-gray-400">+{product.variants.length - 5}</span>
                        )}
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-gray-50 w-full">
                    <div className="flex flex-col items-center justify-center mb-3">
                        {product.discountPrice ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through decoration-red-400 decoration-2">
                                    {formatPrice(Number(product.originalPrice))}
                                </span>
                                <span className="text-lg font-bold text-red-600 block">
                                    {formatPrice(displayPrice)}
                                </span>
                            </div>
                        ) : (
                            <span className="text-lg font-bold text-pink-600 block">
                                {formatPrice(displayPrice)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-pink-600 text-white py-2 rounded-full font-medium hover:bg-pink-700 shadow-md transform active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <span>{tCommon('addToCart')}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
