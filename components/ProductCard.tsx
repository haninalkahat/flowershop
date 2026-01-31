'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, Product } from '@/context/CartContext';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product, 1);
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
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-full transition-colors duration-300 font-medium shadow-sm hover:shadow-md"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
