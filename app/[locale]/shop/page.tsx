'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { SlidersHorizontal, Flower } from 'lucide-react';
import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import { useRouter, useSearchParams } from 'next/navigation';

import { Product } from '@/context/CartContext';
import { Link } from '@/i18n/navigation'; // Use localized Link
import { useTranslations } from 'next-intl';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

function ShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('Shop');
    const tNav = useTranslations('Navigation');
    const tCommon = useTranslations('Common');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize filters from URL
    const [filters, setFilters] = useState({
        flowerTypes: searchParams.getAll('type'),
        priceRange: {
            min: Number(searchParams.get('minPrice')) || 0,
            max: Number(searchParams.get('maxPrice')) || 1000,
        },
    });

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Fetch real products from DB
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products?t=' + Date.now()); // bust cache
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        // Ensure prices are numbers
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
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Derive available options from products
    const options = useMemo(() => {
        const types = Array.from(new Set(products.map((p) => p.flowerType).filter((t): t is string => !!t)));
        return {
            flowerTypes: types,
        };
    }, [products]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        filters.flowerTypes.forEach((t) => params.append('type', t));

        if (filters.priceRange.min > 0) params.set('minPrice', filters.priceRange.min.toString());
        if (filters.priceRange.max < 1000) params.set('maxPrice', filters.priceRange.max.toString());

        // Construct new URL
        const newUrl = `?${params.toString()}`;

        // Only push if changed to avoid unnecessary history entries or loops
        if (newUrl !== window.location.search) {
            router.push(newUrl, { scroll: false });
        }

    }, [filters, router]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            // Filter by Type
            if (filters.flowerTypes.length > 0 && !filters.flowerTypes.includes(p.flowerType)) {
                return false;
            }

            // Filter by Price
            const price = p.discountPrice !== null ? Number(p.discountPrice) : Number(p.originalPrice);
            if (price < filters.priceRange.min || price > filters.priceRange.max) {
                return false;
            }

            return true;
        });
    }, [products, filters]);

    return (
        <main className="min-h-screen bg-gray-50 pt-12 pb-24">
            <div className="container mx-auto px-6">
                {/* Header Area */}
                <div className="flex flex-col items-center text-center justify-center mb-10 bg-pink-50/50 rounded-3xl py-12 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>

                    <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 uppercase tracking-widest font-medium">
                        <Link href="/" className="hover:text-pink-600 transition-colors">{tNav('home')}</Link>
                        <span className="text-pink-300">/</span>
                        <span className="text-gray-900">{tNav('shop')}</span>
                    </nav>


                    <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 tracking-tight mb-4">{t('mainHeading')}</h1>


                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-pink-200"></div>
                        <Flower className="w-5 h-5 text-pink-400" />
                        <div className="h-px w-12 bg-pink-200"></div>
                    </div>

                    <p className="text-gray-600 max-w-2xl text-lg leading-relaxed font-light">
                        {tNav('home') === 'Anasayfa' ? 'Her an ve duygu için özenle seçilmiş taze çiçek koleksiyonumuzu keşfedin.' :
                            tNav('home') === 'الرئيسية' ? 'اكتشف مجموعتنا المختارة بعناية من الزهور النضرة، المنسقة لكل لحظة وشعور.' :
                                'Discover our hand-picked selection of fresh blooms, curated for every moment and emotion.'}
                    </p>

                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="lg:hidden mt-6 flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-pink-100 font-bold text-gray-700 hover:bg-pink-50 active:scale-95 transition-all"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-pink-600" />
                        {t('filters')}
                    </button>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar */}
                    <FilterSidebar
                        filters={filters}
                        options={options}
                        onFilterChange={setFilters}
                        isMobileOpen={isMobileSidebarOpen}
                        onClose={() => setIsMobileSidebarOpen(false)}
                    />

                    {/* Grid Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                            <p className="text-gray-500 font-medium italic">
                                {tNav('home') === 'Anasayfa' ? 'Gösteriliyor' : (tNav('home') === 'الرئيسية' ? 'عرض' : 'Showing')} <span className="text-gray-900 font-bold not-italic">{filteredProducts.length}</span> {t('showResults')}
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse h-[400px]">
                                        <div className="bg-gray-200 h-64 w-full rounded-xl mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-10 bg-gray-200 rounded-full w-full mt-auto"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20 animate-fade-in-up">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                                <div className="bg-pink-50 p-6 rounded-full mb-6">
                                    <SlidersHorizontal className="w-12 h-12 text-pink-300" />
                                </div>
                                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">{t('noProducts')}</h3>
                                <p className="text-gray-500 max-w-xs text-center">
                                    {tNav('home') === 'الرئيسية' ? 'لم نتمكن من العثور على أي زهور تطابق فلترتك الحالية.' : 'We couldn\'t find any flowers matching your current filters. Try adjusting your selection.'}
                                </p>
                                <button
                                    onClick={() => setFilters({ flowerTypes: [], priceRange: { min: 0, max: 1000 } })}
                                    className="mt-8 text-pink-600 font-bold uppercase tracking-widest text-sm hover:underline"
                                >
                                    {tNav('home') === 'Anasayfa' ? 'Filtreleri Temizle' : (tNav('home') === 'الرئيسية' ? 'مسح الفلاتر' : 'Clear All Filters')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <ShopContent />
        </Suspense>
    );
}
