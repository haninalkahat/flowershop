import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Instagram, Facebook, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-6 max-w-6xl text-center mb-16">
                <span className="text-pink-600 font-bold tracking-widest uppercase text-sm mb-3 block">
                    Get in Touch
                </span>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 relative inline-block">
                    Contact Us
                    <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-pink-200 rounded-full"></span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto mt-8 font-light leading-relaxed">
                    We'd love to hear from you. Whether you have a question about our bouquets, shipping, or just want to say hello.
                </p>
            </div>

            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-xl shadow-pink-50/50">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Send us a Message</h2>
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-gray-50/50"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-gray-50/50"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-gray-50/50 resize-none"
                                    placeholder="How can we help you?"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-pink-600 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-pink-200 flex items-center justify-center gap-2 group"
                            >
                                <span>Send Message</span>
                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="flex flex-col space-y-12">
                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <a
                                href="https://wa.me/905510611235"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center justify-center p-6 bg-green-50/50 rounded-2xl border border-green-100 hover:bg-green-100/50 transition-colors text-center"
                            >
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                                <p className="text-gray-600 text-sm break-all">+90 551 061 12 35</p>
                            </a>

                            <div className="group flex flex-col items-center justify-center p-6 bg-pink-50/50 rounded-2xl border border-pink-100 hover:bg-pink-100/50 transition-colors text-center">
                                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                                <p className="text-gray-600 text-sm break-all">haninalkahat@gmail.com</p>
                            </div>

                            <a
                                href="https://instagram.com/hanin__ll"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center justify-center p-6 bg-purple-50/50 rounded-2xl border border-purple-100 hover:bg-purple-100/50 transition-colors text-center"
                            >
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Instagram className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Instagram</h3>
                                <p className="text-gray-600 text-sm">@hanin__ll</p>
                            </a>

                            <a
                                href="#"
                                className="group flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100 hover:bg-blue-100/50 transition-colors text-center"
                            >
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Facebook className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Facebook</h3>
                                <p className="text-gray-600 text-sm">Flowershop Official</p>
                            </a>
                        </div>

                        {/* Map */}
                        <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-3xl overflow-hidden shadow-md border border-gray-200">
                            <Image
                                src="/map-placeholder.png"
                                alt="Location Map"
                                fill
                                className="object-cover"
                            />
                            {/* Overlay Card */}
                            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                                <div className="bg-pink-100 p-3 rounded-full text-pink-600">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Visit Our Studio</h4>
                                    <p className="text-sm text-gray-500">Central District, Flower Avenue 123</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
