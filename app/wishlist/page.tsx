'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Loader2, Heart } from 'lucide-react';

export default function WishlistPage() {
    const { user } = useAuth();
    const { wishlist } = useWishlist();
    // ^ `wishlist` here is just a list of IDs from context.
    // Ideally we want to re-fetch the products if the list of IDs changes.

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchWishlist = async () => {
            // We can fetch from API again to get full product objects
            // OR we could try to filter from a product store if we had one.
            // Fetching is safer.
            try {
                const res = await fetch('/api/wishlist');
                const data = await res.json();
                if (data.items) {
                    // Extract products from the pivot table response
                    const mappedProducts = data.items.map((item: any) => item.product);
                    setProducts(mappedProducts);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [user, wishlist.length]);
    // Re-fetch if wishlist length changes (removed/added item elsewhere).
    // Note: If we remove from *this* page via ProductCard which updates Context, 
    // the context `wishlist` updates, triggering this effect, which re-fetches.
    // This provides the "disappear" effect (or at least update).

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] pt-32 pb-20 container mx-auto px-6 text-center">
                <h1 className="text-3xl font-serif text-gray-900 mb-4">Your Wishlist</h1>
                <p className="text-gray-600 mb-8">Please log in to view your wishlist.</p>
                <Link href="/login" className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition-colors">
                    Login
                </Link>
            </div>
        );
    }

    const hasItems = products.length > 0;
    // We also need to filter `products` by current `wishlist` items just to be sure 
    // if re-fetch hasn't finished or if we want instant UI update.
    // Actually, `useWishlist` is the source of truth for "is in wishlist".
    // If we rely on re-fetch, there might be a delay.
    // Let's filter the local `products` state by `wishlist` IDs from context. 
    // This gives instant removal UI.
    const displayedProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <main className="min-h-screen bg-gray-50 pt-32 pb-20">
            <div className="container mx-auto px-6">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Your Wishlist</h1>
                </div>

                {displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {displayedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-pink-50 rounded-full">
                                <Heart className="w-12 h-12 text-pink-300" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-serif text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            How about taking a look at the flowers we've picked just for you?
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            Go to Shop
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
