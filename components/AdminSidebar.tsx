'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, MessageCircle, ArrowLeft } from 'lucide-react';

export default function AdminSidebar() {
    const t = useTranslations('Admin');
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white shadow-md min-h-screen sticky top-0 h-screen border-r border-gray-100">
            <div className="p-6 border-b shrink-0">
                <h2 className="text-2xl font-serif text-pink-700 font-bold">{t('title')}</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <Link
                    href="/admin/orders"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/orders') ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                    <ShoppingBag size={20} />
                    {t('orders')}
                </Link>
                <Link
                    href="/admin/products"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/products') ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                    <Package size={20} />
                    {t('products')}
                </Link>
                <Link
                    href="/admin/questions"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/questions') ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                    <MessageCircle size={20} />
                    {t('productQuestions')}
                </Link>

                <div className="pt-4 mt-4 border-t">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        {t('backToShop')}
                    </Link>
                </div>
            </nav>
        </aside>
    );
}
