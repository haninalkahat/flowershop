
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import prisma from '@/lib/prisma';
import { Product } from '@/context/CartContext';

// Force dynamic if we want real-time updates without build
export const dynamic = 'force-dynamic';

export default async function Home() {
  let products: Product[] = [];

  try {
    // Fetch Featured Products
    const featuredDb = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { variants: true } // Include variants just in case needed or to prevent partial type issues
    });

    // Fallback if no featured products, get latest 3
    let productsToDisplay = featuredDb;

    if (productsToDisplay.length < 3) {
      const remaining = 3 - productsToDisplay.length;
      const additional = await prisma.product.findMany({
        where: {
          id: { notIn: productsToDisplay.map(p => p.id) }
        },
        take: remaining,
        orderBy: { createdAt: 'desc' },
        include: { variants: true }
      });
      productsToDisplay = [...productsToDisplay, ...additional];
    }

    // Transform for UI (Decimal to Number)
    products = productsToDisplay.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      images: p.images || [],
      imageUrl: p.images?.[0] || '', // Backwards compatibility
      originalPrice: Number(p.originalPrice),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      flowerType: p.flowerType,
      variants: p.variants.map(v => ({
        ...v,
        price: v.price ? Number(v.price) : null,
        images: v.images || []
      }))
    })).filter(p => p.images.length > 0 || p.imageUrl); // Optional: filter out invalids if desired

  } catch (error) {
    console.error("Failed to load home page products:", error);
    // Return empty product list on error to allow page to render with message
    products = [];
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[85vh] bg-cover bg-center flex items-center justify-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/hero-flowers.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-0"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-serif font-bold leading-tight mb-6 animate-fade-in-up drop-shadow-lg tracking-tight">
            Bloom Your Day
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Experience the elegance of fresh, hand-picked flowers delivered to your doorstep. Perfect for every occasion.
          </p>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 bg-white text-gray-900 border-2 border-white hover:bg-transparent hover:text-white font-medium py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-lg animate-fade-in-up animation-delay-300"
          >
            Shop Now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto py-20 px-6 max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-pink-700 mb-16 font-serif tracking-wide">Our Beautiful Blooms</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index === 0} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-lg">
            No floral arrangements currently available. Please check back soon!
          </div>
        )}
      </section>
    </main>
  );
}
