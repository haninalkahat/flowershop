'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useCart, Product } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { Loader2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

import { useTranslations } from 'next-intl';

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
    const t = useTranslations('Product');
    const { addToCart } = useCart();
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
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
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
                <Image
                    src={product.images?.[0] || product.imageUrl || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    priority={!!priority}
                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-all duration-300 z-10 group/heart"
                >
                    <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 group-hover/heart:text-pink-500'}`} />
                </button>
            </Link>
            <div className="p-4 text-center flex-grow flex flex-col justify-between">
                <div>
                    <Link href={getProductLink()}>
                        <h3 className="text-base font-semibold text-pink-700 mb-1 font-serif hover:text-pink-900 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    {product.description && (
                        <p className="text-gray-600 mb-3 text-xs line-clamp-2">{product.description}</p>
                    )}
                </div>
                {product.variants && product.variants.length > 0 && (
                    <div className="flex gap-1.5 mb-2 justify-center">
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
                <div>
                    <span className="text-lg font-bold text-pink-600 block mb-3">
                        ${displayPrice.toFixed(2)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        disabled={loading}
                        className={`w-full text-white py-2 rounded-full transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${loading ? 'bg-pink-400 cursor-wait' : 'bg-pink-500 hover:bg-pink-600'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{t('adding')}</span>
                            </>
                        ) : (
                            t('addToCart')
                        )}
                    </button>

                </div >
            </div >
        </div >
    );
}
