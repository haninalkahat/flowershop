import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/context/CartContext';

const products: Product[] = [
  {
    id: '1',
    name: 'Romantic Roses',
    description: 'Classic elegance for your loved ones.',
    imageUrl: '/flower-red.jpg',
    originalPrice: 29.99,
    discountPrice: null,
    flowerType: 'Roses',
  },
  {
    id: '2',
    name: 'Sunny Sunflowers',
    description: 'Brighten any room with these cheerful blooms.',
    imageUrl: '/flower-blue.jpg',
    originalPrice: 24.99,
    discountPrice: null,
    flowerType: 'Sunflowers',
  },
  {
    id: '3',
    name: 'Elegant Lilies',
    description: 'Sophistication and grace in every petal.',
    imageUrl: '/flower-pink.jpg',
    originalPrice: 34.99,
    discountPrice: null,
    flowerType: 'Lilies',
  },
];

export default function Home() {
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
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-center text-pink-700 mb-12 font-serif">Our Beautiful Blooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
