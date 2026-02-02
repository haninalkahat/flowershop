'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, Product } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

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

    const displayPrice = product.discountPrice !== null ? product.discountPrice : product.originalPrice;

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
            <Link href={`/shop/${product.id}`} className="block relative w-full pt-[100%] bg-white p-6 cursor-pointer"> {/* Square Aspect Ratio + Padding for object-contain */}
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" // Gentle zoom
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </Link>
            <div className="p-6 text-center flex-grow flex flex-col justify-between">
                <div>
                    <Link href={`/shop/${product.id}`}>
                        <h3 className="text-xl font-semibold text-pink-700 mb-2 font-serif hover:text-pink-900 transition-colors">{product.name}</h3>
                    </Link>
                    {product.description && (
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                    )}
                </div>
                <div>
                    <span className="text-2xl font-bold text-pink-600 block mb-4">
                        ${displayPrice.toFixed(2)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        disabled={loading}
                        className={`w-full text-white py-2 rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${loading ? 'bg-pink-400 cursor-wait' : 'bg-pink-500 hover:bg-pink-600'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            'Add to Cart'
                        )}
                    </button>

                </div >
            </div >
        </div >
    );
}
