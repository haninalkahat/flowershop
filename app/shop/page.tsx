'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, Flower } from 'lucide-react';
import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';

import { Product } from '@/context/CartContext';

// Dummy data for initial dev if DB is empty or needs refresh
// In a real app, this would come from an API or Prisma
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Royal Red Roses',
        description: 'Breathtaking long-stemmed red roses for your special someone.',
        imageUrl: '/flower-red.jpg',
        originalPrice: 89.99,
        discountPrice: 69.99,
        flowerType: 'Roses',
    },
    {
        id: '2',
        name: 'Pure White Lilies',
        description: 'Elegant white lilies that symbolize purity and grace.',
        imageUrl: '/flower-blue.jpg',
        originalPrice: 54.99,
        discountPrice: null,
        flowerType: 'Lilies',
    },
    {
        id: '3',
        name: 'Sunflower Happiness',
        description: 'Bright and cheerful sunflowers to light up any room.',
        imageUrl: '/flower-pink.jpg',
        originalPrice: 45.00,
        discountPrice: 39.99,
        flowerType: 'Sunflowers',
    },
    {
        id: '4',
        name: 'Midnight Tulips',
        description: 'Rare dark purple tulips for a touch of mystery.',
        imageUrl: '/flower-tulip.jpg',
        originalPrice: 65.00,
        discountPrice: null,
        flowerType: 'Tulips',
    },
    {
        id: '5',
        name: 'Pink Orchid Delight',
        description: 'Stunning pink orchids in a decorative pot.',
        imageUrl: '/flower-lilies.jpg',
        originalPrice: 120.00,
        discountPrice: 99.00,
        flowerType: 'Orchids',
    },
    {
        id: '6',
        name: 'Mixed Carnation Bouquet',
        description: 'A colorful mix of fresh carnations.',
        imageUrl: '/flower-red.jpg',
        originalPrice: 35.00,
        discountPrice: null,
        flowerType: 'Carnations',
    },
];

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [filters, setFilters] = useState({
        flowerTypes: [] as string[],
        priceRange: { min: 0, max: 1000 },
    });

    // Fetch real products from DB if possible
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        // Ensure prices are numbers (Prisma Decimals return as strings/objects)
                        const formattedData = data.map((item: any) => ({
                            ...item,
                            originalPrice: Number(item.originalPrice),
                            discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
                        }));
                        setProducts(formattedData);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch products:', err);
            }
        }
        fetchProducts();
    }, []);

    // Update filtered list in real-time
    useEffect(() => {
        let result = [...products];

        // Filter by Type
        if (filters.flowerTypes.length > 0) {
            result = result.filter((p) => filters.flowerTypes.includes(p.flowerType));
        }



        // Filter by Price
        result = result.filter((p) => {
            const price = p.discountPrice !== null ? Number(p.discountPrice) : Number(p.originalPrice);
            return price >= filters.priceRange.min && price <= filters.priceRange.max;
        });

        setFilteredProducts(result);
    }, [filters, products]);

    return (
        <main className="min-h-screen bg-gray-50 pt-12 pb-24">
            <div className="container mx-auto px-6">
                {/* Header Area */}
                {/* Header Area */}
                <div className="flex flex-col items-center text-center justify-center mb-10 bg-pink-50/50 rounded-3xl py-12 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>

                    <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 uppercase tracking-widest font-medium">
                        <a href="/" className="hover:text-pink-600 transition-colors">Home</a>
                        <span className="text-pink-300">/</span>
                        <span className="text-gray-900">Shop Cabinet</span>
                    </nav>

                    <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 tracking-tight mb-4">Our Collection</h1>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-pink-200"></div>
                        <Flower className="w-5 h-5 text-pink-400" />
                        <div className="h-px w-12 bg-pink-200"></div>
                    </div>

                    <p className="text-gray-600 max-w-2xl text-lg leading-relaxed font-light">
                        Discover our hand-picked selection of fresh blooms, curated for every moment and emotion.
                    </p>

                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="lg:hidden mt-6 flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-pink-100 font-bold text-gray-700 hover:bg-pink-50 active:scale-95 transition-all"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-pink-600" />
                        Filters
                    </button>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar */}
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={setFilters}
                        isMobileOpen={isMobileSidebarOpen}
                        onClose={() => setIsMobileSidebarOpen(false)}
                    />

                    {/* Grid Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                            <p className="text-gray-500 font-medium italic">
                                Showing <span className="text-gray-900 font-bold not-italic">{filteredProducts.length}</span> signature products
                            </p>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                                <div className="bg-pink-50 p-6 rounded-full mb-6">
                                    <SlidersHorizontal className="w-12 h-12 text-pink-300" />
                                </div>
                                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">No Blooms Found</h3>
                                <p className="text-gray-500 max-w-xs text-center">
                                    We couldn't find any flowers matching your current filters. Try adjusting your selection.
                                </p>
                                <button
                                    onClick={() => setFilters({ flowerTypes: [], priceRange: { min: 0, max: 1000 } })}
                                    className="mt-8 text-pink-600 font-bold uppercase tracking-widest text-sm hover:underline"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
