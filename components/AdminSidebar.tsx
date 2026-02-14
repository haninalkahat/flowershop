'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, MessageCircle, ArrowLeft } from 'lucide-react';

import { useState, useEffect } from 'react';

export default function AdminSidebar() {
    const t = useTranslations('Admin');
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    const [stats, setStats] = useState({ newOrdersCount: 0, unreadMessagesCount: 0, unreadQuestionsCount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats', { cache: 'no-store', next: { revalidate: 0 } });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch admin stats');
            }
        };

        fetchStats();
        // Listener for real-time updates
        const handleStatsUpdate = () => {
            console.log('Admin stats update event received');
            fetchStats();
        };

        window.addEventListener('admin-stats-updated', handleStatsUpdate);
        const interval = setInterval(fetchStats, 30000); // Poll every 30s

        return () => {
            clearInterval(interval);
            window.removeEventListener('admin-stats-updated', handleStatsUpdate);
        };
    }, []);

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white shadow-md min-h-screen sticky top-0 h-screen border-r border-gray-100">
            <div className="p-6 border-b shrink-0">
                <h2 className="text-2xl font-serif text-pink-700 font-bold">{t('title')}</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <Link
                    href="/admin/orders"
                    onClick={() => {
                        if (isActive('/admin/orders')) {
                            window.location.reload();
                        }
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/orders') ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={20} />
                        {t('orders')}
                    </div>
                    <div className="flex items-center gap-1">
                        {stats.unreadMessagesCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full" title={t('unreadMessages')}>
                                {stats.unreadMessagesCount}
                            </span>
                        )}
                        {stats.newOrdersCount > 0 && (
                            <span className="bg-pink-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full" title={t('newOrders')}>
                                {stats.newOrdersCount}
                            </span>
                        )}
                    </div>
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
                    className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/questions') ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <MessageCircle size={20} />
                        {t('productQuestions')}
                        {stats.unreadQuestionsCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ml-auto" title={t('unreadQuestions')}>
                                {stats.unreadQuestionsCount}
                            </span>
                        )}
                    </div>
                    {/* User requested 'unreadMessagesCount' for Orders tab or similar, but typically MessageCircle is for direct messages/questions. 
                        Wait, the user said: "New Messages: The 'Orders' tab badge should also include (or show separately) the total count of unread messages from all customers."
                        This implies messages are tied to orders. So the orders tab badge should show unread messages too? 
                        Let's combine them on the Orders tab badge or show two badges. Since the space is small, let's sum them or show just one if prominent.
                        Or maybe add a separate badge for messages on the Orders tab row.
                        
                        Re-reading: "New Messages: The 'Orders' tab badge should also include (or show separately) the total count of unread messages from all customers."
                        Also "New Orders: Add a notification badge... on the 'Orders' tab showing the count of orders...".
                        
                        If I put both on the Orders tab, it might be confusing. 
                        Let's try to show ordered Badges if space permits.
                        Actually, let's sum them for the main badge, or prioritize messages if critical.
                        Let's just show the new orders count on the Orders tab for now as primarily requested, 
                        and maybe if there are unread messages, show a distinct dot or just add to the count?
                        
                        "The 'Orders' tab badge should also include... total count of unread messages".
                        So Total Notification = New Orders + Unread Messages.
                    */}
                </Link>
                <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/settings') ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {t('settings')}
                    </div>
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
