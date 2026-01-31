import Image from 'next/image';
import Link from 'next/link';
import { Award, Heart, Sprout, ArrowRight } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white font-sans text-gray-900">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden pb-10">
                <Image
                    src="/about-hero.png"
                    alt="Beautiful floral background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
                <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay for better text legibility */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif text-white drop-shadow-lg mb-6 tracking-tight">
                        Our Story
                    </h1>
                    <p className="text-xl md:text-2xl text-white font-medium tracking-wide max-w-2xl mx-auto drop-shadow-md">
                        Curating nature's finest moments with passion, elegance, and love.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 md:py-24 container mx-auto px-6 md:px-12 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative aspect-[4/5] w-full md:max-w-md mx-auto order-2 md:order-1">
                        <div className="absolute inset-0 bg-pink-200 rounded-3xl transform rotate-3 scale-[1.02] -z-10" />
                        <Image
                            src="/about-florist.png"
                            alt="Florist arranging a bouquet"
                            fill
                            className="object-cover rounded-3xl shadow-xl"
                        />
                    </div>

                    <div className="order-1 md:order-2 space-y-8">
                        <span className="text-pink-600 font-bold tracking-widest uppercase text-sm">
                            Our Mission
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                            Crafting Emotions Through Petals
                        </h2>
                        <div className="space-y-6 text-lg text-gray-600 font-light leading-relaxed">
                            <p>
                                At Flowershop, we believe that flowers are more than just decorations—they are a language of their own. For over a decade, we have dedicated ourselves to the art of floristry, sourcing only the freshest blooms from sustainable farms around the globe.
                            </p>
                            <p>
                                Our mission is simple: to bring joy, comfort, and beauty into your life. Whether it's a grand celebration or a quiet gesture of affection, every arrangement is handcrafted with meticulous attention to detail and a genuine love for the craft.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-pink-50/30">
                <div className="container mx-auto px-6 max-w-6xl text-center">
                    <span className="text-pink-600 font-bold tracking-widest uppercase text-sm mb-3 block">
                        Why Choose Us
                    </span>
                    <h2 className="text-4xl font-serif font-bold text-gray-900 mb-16">
                        Our Core Values
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {/* Card 1: Quality */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-pink-100/50 hover:shadow-md transition-shadow group">
                            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600 group-hover:scale-110 transition-transform">
                                <Award className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Unmatched Quality</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We hand-select every stem for perfection. Only the most vibrant, fragrant, and flawless flowers make it into our arrangements.
                            </p>
                        </div>

                        {/* Card 2: Sustainability */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-pink-100/50 hover:shadow-md transition-shadow group">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                                <Sprout className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Eco-Conscious</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We are committed to the planet. We use biodegradable packaging and partner with farms that prioritize sustainable practices.
                            </p>
                        </div>

                        {/* Card 3: Passion */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-pink-100/50 hover:shadow-md transition-shadow group">
                            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-6 text-rose-600 group-hover:scale-110 transition-transform">
                                <Heart className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Made with Love</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Every bouquet tells a story. Our florists pour their creativity and heart into every design, ensuring a personal touch.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gray-900 text-white text-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                        Ready to brighten someone's day?
                    </h2>
                    <p className="text-xl text-gray-300 font-light mb-10 max-w-2xl mx-auto">
                        Explore our latest collection of seasonal blooms and find the perfect gift for yourself or a loved one.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-pink-600 text-white font-bold py-4 px-10 rounded-full hover:bg-pink-700 transition-all hover:scale-105 shadow-lg shadow-pink-900/50"
                    >
                        Browse our Collection
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
