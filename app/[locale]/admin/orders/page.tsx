
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';

interface Order {
    id: string;
    totalAmount: string;
    status: string;
    items: any[];
    user: { fullName: string; email: string };
    receipt?: { imageUrl: string };
    createdAt: string;
    messages: any[];
    isNewOrder: boolean;
}

export default function AdminOrdersPage() {
    const t = useTranslations('Admin');
    const locale = useLocale();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // State for notification
    const [lastOrderCount, setLastOrderCount] = useState(0);

    const fetchOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();

            if (data.orders) {
                // Check for new orders if we already have data
                if (lastOrderCount > 0 && data.orders.length > lastOrderCount) {
                    // Play sound or show toast
                    const audio = new Audio('/notification.mp3'); // Assuming file exists or fails gracefully
                    audio.play().catch(() => { });
                    toast.success(t('orderNotifications.newOrderReceived'));
                }
                setOrders(data.orders);
                setLastOrderCount(data.orders.length);
            }
        } catch (err) {
            console.error('Failed to fetch admin orders');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(true), 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);


    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const toggleRow = (orderId: string) => {
        setExpandedOrders(prev => {
            const next = new Set(prev);
            if (next.has(orderId)) next.delete(orderId);
            else next.add(orderId);
            return next;
        });
    };

    const [messageOrder, setMessageOrder] = useState<Order | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                // Optimistically update status AND remove 'NEW' tag
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, isNewOrder: false } : o));
                // Signal sidebar to refresh stats
                window.dispatchEvent(new Event('admin-stats-updated'));
            } else {
                toast.error(t('orderNotifications.statusUpdateFailed'));
            }
        } catch (err) {
            toast.error(t('orderNotifications.statusUpdateError'));
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !messageOrder) return;
        setSendingReply(true);

        try {
            const res = await fetch(`/api/orders/${messageOrder.id}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyContent })
            });
            if (res.ok) {
                toast.success(t('orderNotifications.replySent'));
                setReplyContent('');
                setMessageOrder(null);
                fetchOrders(); // Refresh to show new message count if we tracked it, or just refresh
            } else {
                toast.error(t('orderNotifications.replyFailed'));
            }
        } catch (err) {
            toast.error(t('orderNotifications.replyError'));
        } finally {
            setSendingReply(false);
        }
    };

    const handleOpenMessage = async (order: Order) => {
        setMessageOrder(order);

        // Optimistically clear 'NEW' tag and mark messages as read
        // We do this regardless of unread count because opening the modal is the "interaction" requested
        // Prompt says: "Set isNewOrder: false as soon as the Admin opens the messaging modal"

        // Mark as read if there are unread messages to the backend
        const unreadCount = order.messages.filter(m => !m.isAdmin && !m.isRead).length;

        // Always call read endpoint? The prompt says "Set isNewOrder: false as soon as the Admin opens...".
        // My backend update for isNewOrder is inside the 'read' endpoint. 
        // So I must call it even if unreadCount is 0 IF isNewOrder is true.
        // But the 'read' endpoint is specific to messages.
        // It might be better to ensure we call it if isNewOrder is true OR unreadCount > 0.

        if (unreadCount > 0 || order.isNewOrder) {
            try {
                await fetch(`/api/admin/orders/${order.id}/read`, { method: 'POST' });
                // Optimistically update local state
                setOrders(prev => prev.map(o => {
                    if (o.id === order.id) {
                        return {
                            ...o,
                            isNewOrder: false,
                            messages: o.messages.map(m => m.isAdmin ? m : { ...m, isRead: true })
                        };
                    }
                    return o;
                }));
                // Signal sidebar to refresh stats
                window.dispatchEvent(new Event('admin-stats-updated'));
            } catch (e) {
                console.error("Failed to mark as read");
            }
        } else {
            // No unread messages and not new order, just open modal (already done via setMessageOrder)
        }
    };


    // Filter Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Status Filter
            if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

            // Search Query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const idMatch = order.id.toLowerCase().includes(query);
                const userMatch = order.user?.fullName?.toLowerCase().includes(query) || order.user?.email?.toLowerCase().includes(query);

                // Product Search (recursive check in items)
                const productMatch = order.items.some((item: any) => {
                    const p = item.product || {};
                    const name = p.name || '';
                    const nameTr = p.name_tr || '';
                    const nameEn = p.name_en || '';
                    const nameAr = p.name_ar || '';

                    return name.toLowerCase().includes(query) ||
                        nameTr.toLowerCase().includes(query) ||
                        nameEn.toLowerCase().includes(query) ||
                        nameAr.toLowerCase().includes(query);
                });

                return idMatch || userMatch || productMatch;
            }

            return true;
        });
    }, [orders, searchQuery, statusFilter]);

    // Compute Counts
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: orders.length };
        orders.forEach(order => {
            counts[order.status] = (counts[order.status] || 0) + 1;
        });
        return counts;
    }, [orders]);

    if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'PREPARING': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-blue-100 text-blue-800';
            case 'AWAITING_PAYMENT': return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'CANCELED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        const key = status === 'AWAITING_PAYMENT' ? 'awaitingPayment' :
            status === 'PAID' ? 'paid' :
                status === 'markAsPaid' ? 'markAsPaid' : // Safety, though not a status
                    status === 'REJECTED' ? 'rejected' :
                        status === 'CANCELED' ? 'canceled' :
                            status === 'PREPARING' ? 'preparing' :
                                status === 'DELIVERED' ? 'delivered' : status.toLowerCase();
        // @ts-ignore
        return t(`status.${key}`);
    };

    const getProductName = (product: any) => {
        if (!product) return 'Unknown Product';
        if (locale === 'tr') return product.name_tr || product.name_en || product.name;
        if (locale === 'ar') return product.name_ar || product.name_en || product.name;
        return product.name_en || product.name;
    };

    return (
        <div>
            <h1 className="text-2xl font-serif mb-6 flex justify-between items-center">
                <span>{t('orderManagement')}</span>
                <button onClick={() => fetchOrders()} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">{t('refresh')}</button>
            </h1>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder') || "Search orders..."}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['ALL', 'AWAITING_PAYMENT', 'PAID', 'PREPARING', 'DELIVERED', 'REJECTED', 'CANCELED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === status
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'ALL' ? t('all') : getStatusLabel(status)}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === status ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {statusCounts[status] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mb-8">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed text-gray-500">
                        {t('noOrders')}
                    </div>
                ) : filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-xs font-mono text-gray-500 mb-1">#{order.id.slice(0, 8)}</div>
                                    <div className="font-medium">{order.user.fullName}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    {/* @ts-ignore */}
                                    {order.isNewOrder && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white animate-pulse">
                                            NEW
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                <span className="text-lg font-bold text-gray-900">${Number(order.totalAmount).toFixed(2)}</span>
                                <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={() => toggleRow(order.id)}
                                    className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    {expandedOrders.has(order.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    {t('products') || 'Items'} ({order.items.length})
                                </button>

                                <button
                                    onClick={() => handleOpenMessage(order)}
                                    className={`relative flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${order.messages.some(m => !m.isAdmin && !m.isRead) ? 'bg-pink-100 text-pink-700 font-bold border border-pink-200' : 'bg-gray-50 text-gray-700'}`}
                                >
                                    <MessageCircle size={16} />
                                    {t('table.messages')}
                                    {order.messages.filter(m => !m.isAdmin && !m.isRead).length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                            {order.messages.filter(m => !m.isAdmin && !m.isRead).length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <select
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 mb-1"
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                            >
                                <option value="AWAITING_PAYMENT">{t('status.awaitingPayment')}</option>
                                <option value="PAID">{t('status.markAsPaid')}</option>
                                <option value="PREPARING">{t('status.preparing')}</option>
                                <option value="DELIVERED">{t('status.delivered')}</option>
                                <option value="REJECTED">{t('status.reject')}</option>
                                <option value="CANCELED">{t('status.cancel')}</option>
                            </select>
                        </div>

                        {expandedOrders.has(order.id) && (
                            <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-3">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex gap-3 bg-white p-2 rounded border border-gray-200">
                                        <Link href={`/shop/${item.product?.id}`} target="_blank" className="shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                            <img src={item.product?.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover" />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{getProductName(item.product)}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <span>x{item.quantity}</span>
                                                {item.selectedColor && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full border border-gray-300 bg-gray-400" />
                                                        {item.selectedColor}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 w-10"></th>
                            <th className="px-6 py-3 text-left rtl:text-right font-medium text-gray-500">{t('table.orderId')}</th>
                            <th className="px-6 py-3 text-left rtl:text-right font-medium text-gray-500">{t('table.user')}</th>
                            <th className="px-6 py-3 text-left rtl:text-right font-medium text-gray-500">{t('table.total')}</th>
                            <th className="px-6 py-3 text-left rtl:text-right font-medium text-gray-500">{t('table.status')}</th>
                            <th className="px-6 py-3 text-left rtl:text-right font-medium text-gray-500">{t('table.messages')}</th>
                            <th className="px-6 py-3 text-left rtl:text-right font-medium text-gray-500">{t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    {t('noOrders')}
                                </td>
                            </tr>
                        ) : filteredOrders.map((order) => (
                            <React.Fragment key={order.id}>
                                <tr className="hover:bg-gray-50 border-b border-gray-100">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleRow(order.id)}
                                            className="relative p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                        >
                                            {expandedOrders.has(order.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            {order.messages.filter(m => !m.isAdmin && !m.isRead).length > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                                                    {order.messages.filter(m => !m.isAdmin && !m.isRead).length}
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-left rtl:text-right">
                                        <div className="flex items-center gap-2">
                                            {order.id.slice(0, 8)}...
                                            {/* @ts-ignore */}
                                            {order.isNewOrder && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500 text-white animate-pulse">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-left rtl:text-right">
                                        <div className="font-medium">{order.user.fullName}</div>
                                        <div className="text-gray-500 text-xs">{order.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 text-left rtl:text-right">${Number(order.totalAmount).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-left rtl:text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-left rtl:text-right">
                                        <button
                                            onClick={() => handleOpenMessage(order)}
                                            className={`relative font-medium text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${order.messages.some(m => !m.isAdmin && !m.isRead)
                                                ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 pr-4'
                                                : 'text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            <MessageCircle size={16} />
                                            {t('viewReply')}
                                            {order.messages.filter(m => !m.isAdmin && !m.isRead).length > 0 && ` (${order.messages.filter(m => !m.isAdmin && !m.isRead).length})`}
                                            {order.messages.filter(m => !m.isAdmin && !m.isRead).length > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                                                    {order.messages.filter(m => !m.isAdmin && !m.isRead).length}
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-left rtl:text-right">
                                        <select
                                            className="border rounded px-2 py-1 text-xs"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                        >
                                            <option value="AWAITING_PAYMENT">{t('status.awaitingPayment')}</option>
                                            <option value="PAID">{t('status.markAsPaid')}</option>
                                            <option value="PREPARING">{t('status.preparing')}</option>
                                            <option value="DELIVERED">{t('status.delivered')}</option>
                                            <option value="REJECTED">{t('status.reject')}</option>
                                            <option value="CANCELED">{t('status.cancel')}</option>
                                        </select>
                                    </td>
                                </tr>
                                {expandedOrders.has(order.id) && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={7} className="px-6 py-4 shadow-inner border-b border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {order.items.map((item: any) => (
                                                    <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                                        <Link
                                                            href={`/shop/${item.product?.id}`}
                                                            target="_blank"
                                                            className="block w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100 hover:border-pink-300 transition-colors"
                                                        >
                                                            <img
                                                                src={item.product?.images?.[0] || '/placeholder.png'}
                                                                alt={item.product?.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </Link>
                                                        <div className="flex-1 min-w-0">
                                                            <Link
                                                                href={`/shop/${item.product?.id}`}
                                                                target="_blank"
                                                                className="text-sm font-medium text-gray-900 hover:text-pink-600 truncate block transition-colors"
                                                            >
                                                                {getProductName(item.product)}
                                                            </Link>
                                                            <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-2">
                                                                <span>Qty: {item.quantity}</span>
                                                                {item.selectedColor && (
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="w-2 h-2 rounded-full border border-gray-300 bg-gray-400" />
                                                                        {item.selectedColor}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Message Modal */}
            {
                messageOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{t('table.messages')} - #{messageOrder.id.slice(0, 8)}</h3>
                                    <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                        {messageOrder.items.map((item: any) => (
                                            <div key={item.id} className="bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
                                                {item.product && (
                                                    <Link
                                                        href={`/shop/${item.product.id}`}
                                                        target="_blank"
                                                        className="flex items-center gap-2 p-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                                                    >
                                                        <img src={item.product?.images?.[0] || '/placeholder.png'} alt={item.product?.name} className="w-8 h-8 rounded object-cover" />
                                                        <span className="text-xs font-medium max-w-[100px] truncate">{getProductName(item.product)}</span>
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setMessageOrder(null)} className="text-gray-400 hover:text-gray-600">X</button>
                            </div>

                            <div className="max-h-60 overflow-y-auto mb-4 border rounded p-3 bg-gray-50 space-y-3">
                                {/* @ts-ignore */}
                                {messageOrder.messages && messageOrder.messages.length > 0 ? (
                                    // @ts-ignore
                                    messageOrder.messages.map((msg: any) => (
                                        <div key={msg.id} className={`p-2 rounded text-sm ${msg.isAdmin ? 'bg-pink-100 ml-auto max-w-[80%]' : 'bg-white border mr-auto max-w-[80%]'} shadow-sm`}>
                                            <p className="font-semibold text-xs mb-1">{msg.isAdmin ? t('admin') : msg.user?.fullName || t('user')}</p>
                                            <p>{msg.content}</p>
                                            <p className="text-[10px] text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm text-center">{t('noMessages')}</p>
                                )}
                            </div>

                            <form onSubmit={handleSendReply}>
                                <textarea
                                    className="w-full border rounded p-2 text-sm mb-2"
                                    placeholder={t('typeReply')}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows={3}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={sendingReply}
                                    className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {sendingReply ? t('sending') : t('sendReply')}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
