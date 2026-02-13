'use client';

import { useTranslations } from 'next-intl';
import { useCurrency } from '@/context/CurrencyContext';
import { Link } from '@/i18n/navigation';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
    id: string;
    product: {
        id: string;
        name: string;
        name_tr?: string | null;
        name_en?: string | null;
        name_ar?: string | null;
        imageUrl: string;
    };
    quantity: number;
    price: number | string; // Ensure string handled too
    selectedColor?: string | null;
}

interface Order {
    id: string;
    totalAmount: number | string;
    items: OrderItem[];
    status: string;
}

interface SuccessClientProps {
    order: Order;
    locale: string;
}

export default function SuccessClient({ order, locale }: SuccessClientProps) {
    const t = useTranslations('Success');
    const { formatPrice } = useCurrency();

    // Helper to get localized name
    const getProductName = (item: OrderItem) => {
        if (locale === 'tr') return item.product.name_tr || item.product.name_en || item.product.name;
        if (locale === 'ar') return item.product.name_ar || item.product.name_en || item.product.name;
        return item.product.name_en || item.product.name;
    };

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
                {/* Header */}
                <div className="bg-green-50 p-8 text-center border-b border-green-100">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-serif text-green-800 font-bold mb-2">{t('title')}</h1>
                    <p className="text-green-700 max-w-md mx-auto">{t('subtitle')}</p>
                </div>

                {/* Order Details */}
                <div className="p-8 space-y-6">
                    {/* ID & Status */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4 border-b border-gray-100">
                        <div className="text-center md:text-left rtl:text-right">
                            <span className="text-gray-500 text-sm uppercase tracking-wide block mb-1">{t('orderId')}</span>
                            <span className="font-mono font-medium text-lg text-gray-900">#{order.id.slice(0, 8)}</span>
                        </div>
                        <div className="text-center md:text-right rtl:text-left">
                            <span className="text-gray-500 text-sm uppercase tracking-wide block mb-1">{t('status')}</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                                {t('awaitingPayment')}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('items')}</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-2">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                        <Image
                                            src={item.product.imageUrl || '/placeholder.jpg'}
                                            alt={getProductName(item)}
                                            fill
                                            className="object-contain p-1"
                                            sizes="64px"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">{getProductName(item)}</h4>
                                        <div className="text-sm text-gray-500">
                                            {item.selectedColor && (
                                                <span className="mr-2 rtl:ml-2">Color: {item.selectedColor}</span>
                                            )}
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {formatPrice(Number(item.price) * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">{t('total')}</span>
                        <span className="text-2xl font-bold text-pink-600 font-serif">
                            {formatPrice(Number(order.totalAmount))}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/profile?tab=orders"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-100 hover:text-pink-600 transition-colors shadow-sm"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {t('viewAllOrders')}
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        {t('backToShop')}
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
