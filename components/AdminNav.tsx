'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, MessageCircle } from 'lucide-react';

export default function AdminNav() {
    const t = useTranslations('Admin');
    const pathname = usePathname();

    const tabs = [
        { key: 'orders', href: '/admin/orders', icon: ShoppingBag },
        { key: 'products', href: '/admin/products', icon: Package },
        { key: 'productQuestions', href: '/admin/questions', icon: MessageCircle },
    ];

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <div className="bg-white shadow-sm border-b mb-6">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">{t('title')}</h1>
                    <Link href="/" className="text-sm text-gray-500 hover:text-pink-600 font-medium">
                        ← {t('backToShop')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.key}
                                href={tab.href}
                                className={`
                                    flex items-center gap-4 p-4 rounded-xl border transition-all
                                    ${active
                                        ? 'bg-pink-50 border-pink-200 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-pink-100 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className={`p-3 rounded-lg ${active ? 'bg-pink-100 text-pink-700' : 'bg-gray-50 text-gray-500'}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="font-medium text-lg text-gray-900">
                                    {t(tab.key)}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
