'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { MOCK_PRODUCTS } from '@/lib/data';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Correctly unwrap params using React.use()
    const resolvedParams = use(params);
    const product = MOCK_PRODUCTS.find((p) => p.id === resolvedParams.id);
    const { addToCart } = useCart();

    // Default to the first color if available, or just a generic 'Original'
    const [selectedColor, setSelectedColor] = useState<string>(
        product?.colors?.[0] || 'Original'
    );

    // Determine the image to show based on color selection
    // If the product has a color map, use it. Otherwise fall back to main image.
    const [currentImage, setCurrentImage] = useState<string>(product?.imageUrl || '');
    const [quantity, setQuantity] = useState(1);

    // If we change color, update the image if a specific mapping exists
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        if (product?.colorImages && product.colorImages[color]) {
            setCurrentImage(product.colorImages[color]);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-serif text-gray-900 mb-4">Product Not Found</h1>
                <Link href="/shop" className="text-pink-600 hover:underline">
                    Back to Shop
                </Link>
            </div>
        );
    }

    // Ensure currentImage is initialized on first render (if state was empty initially)
    if (!currentImage) setCurrentImage(product.imageUrl);

    const price = product.discountPrice || product.originalPrice;

    const handleAddToCart = () => {
        // Add the product with the selected quantity
        // Note: Currently CartContext matches by ID only, so different colors of same ID will merge.
        // For a full e-commerce app, we'd need a composite key (id + color) or unique IDs for variants.
        addToCart({ ...product, selectedColor }, quantity);
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
                        <Image
                            src={currentImage}
                            alt={product.name}
                            fill
                            className="object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
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
                                    ${product.originalPrice.toFixed(2)}
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
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-8">
                                <span className="block text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                                    Select Color: <span className="text-pink-600">{selectedColor}</span>
                                </span>
                                <div className="flex gap-4">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleColorSelect(color)}
                                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color
                                                ? 'border-gray-900 scale-110 shadow-md'
                                                : 'border-transparent hover:scale-110'
                                                }`}
                                            title={color}
                                        >
                                            <span
                                                className="w-8 h-8 rounded-full border border-black/10 shadow-inner"
                                                style={{
                                                    backgroundColor: color.toLowerCase() === 'mixed' ? 'violet' : color.toLowerCase()
                                                }}
                                            />
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
                                className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-full hover:bg-pink-600 transition-colors shadow-lg shadow-gray-200 hover:shadow-pink-200 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>Add to Cart - ${(price * quantity).toFixed(2)}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
