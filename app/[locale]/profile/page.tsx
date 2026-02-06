'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { User, Lock, ShoppingBag, Truck, MessageCircle, Send, X, Package, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const { user, checkAuth, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders' | 'questions'>('profile');

    // Profile State
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: ''
    });
    const [profileStatus, setProfileStatus] = useState('');

    // Security State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityStatus, setSecurityStatus] = useState('');

    // Orders State
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
    const [questions, setQuestions] = useState<any[]>([]);
    const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
    const [messageOrder, setMessageOrder] = useState<any | null>(null);
    const [messageContent, setMessageContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                // @ts-ignore
                address: user.address || '',
                // @ts-ignore
                city: user.city || ''
            });

            // Fetch data for badge counts
            fetchOrders();
            fetchQuestions();
        }
    }, [user, authLoading, router]);

    // Calculate unread count whenever orders or questions change
    useEffect(() => {
        let count = 0;
        // Count unread order messages (from Admin, not readByUser)
        orders.forEach(order => {
            if (order.messages) {
                // @ts-ignore
                const unread = order.messages.filter(m => m.isAdmin && !m.isRead).length;
                count += unread;
            }
        });

        // Count unread question answers
        questions.forEach(q => {
            if (q.answer && !q.isAnswerRead) {
                count++;
            }
        });

        setUnreadCount(count);
    }, [orders, questions]);

    // Polling for real-time updates and notifications
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            fetchOrders(true);
            fetchQuestions();
        }, 15000); // 15s polling

        return () => clearInterval(interval);
    }, [user]);

    // Auto-mark messages as read when modal opens
    useEffect(() => {
        if (messageOrder) {
            markOrderAsRead(messageOrder);
        }
    }, [messageOrder]);

    const markOrderAsRead = async (order: any) => {
        // If there are unread admin messages, mark them
        const hasUnread = order.messages?.some((m: any) => m.isAdmin && !m.isRead);
        if (!hasUnread) return;

        try {
            await fetch(`/api/orders/${order.id}/read`, { method: 'POST' });
            // Update local state to reflect read status
            setOrders(prev => prev.map(o => {
                if (o.id === order.id && o.messages) {
                    return {
                        ...o,
                        messages: o.messages.map((m: any) => m.isAdmin ? { ...m, isRead: true } : m)
                    };
                }
                return o;
            }));
            // Also update messageOrder if it's the same one
            if (messageOrder?.id === order.id) {
                setMessageOrder((prev: any) => ({
                    ...prev,
                    messages: prev.messages?.map((m: any) => m.isAdmin ? { ...m, isRead: true } : m)
                }));
            }
        } catch (e) {
            console.error("Failed to mark read");
        }
    };

    const fetchOrders = async (silent = false) => {
        if (!silent) setOrdersLoading(true);
        try {
            const res = await fetch('/api/orders', { cache: 'no-store' });
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
        } catch (error) {
            console.error('Failed to fetch orders');
        } finally {
            if (!silent) setOrdersLoading(false);
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await fetch('/api/user/questions', { cache: 'no-store' });
            const data = await res.json();
            if (data.questions) setQuestions(data.questions);
        } catch (error) {
            console.error('Failed to fetch questions');
        }
    };

    const toggleOrder = (orderId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const openMessageModal = (order: any) => {
        setMessageOrder(order);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileStatus('Saving...');
        try {
            const res = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            if (res.ok) {
                setProfileStatus('Profile updated successfully!');
                await checkAuth(); // Refresh context
                setTimeout(() => setProfileStatus(''), 3000);
            } else {
                setProfileStatus('Failed to update profile.');
            }
        } catch (error) {
            setProfileStatus('Error saving profile.');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setSecurityStatus('New passwords do not match');
            return;
        }
        setSecurityStatus('Updating...');
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setSecurityStatus('Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setSecurityStatus(''), 3000);
            } else {
                setSecurityStatus(data.error || 'Failed to change password');
            }
        } catch (error) {
            setSecurityStatus('Error updating password');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageContent.trim() || !messageOrder) return;
        setSendingMessage(true);

        try {
            const res = await fetch(`/api/orders/${messageOrder.id}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: messageContent })
            });
            if (res.ok) {
                const data = await res.json();
                // Optimistically update the message list in the modal
                setMessageOrder({
                    ...messageOrder,
                    messages: [...(messageOrder.messages || []), data.message]
                });
                setMessageContent('');
                // Also update the main orders list
                setOrders(orders.map(o => o.id === messageOrder.id ? { ...o, messages: [...(o.messages || []), data.message] } : o));
            } else {
                alert('Failed to send message');
            }
        } catch (err) {
            alert('Error sending message');
        } finally {
            setSendingMessage(false);
        }
    };



    if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar Tabs */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeTab === 'profile' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <User className="w-5 h-5" />
                                    {t('profileDetails')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeTab === 'orders' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    {t('myOrders')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('questions')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left justify-between ${activeTab === 'questions' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="w-5 h-5" />
                                        {t('myQuestions')}
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeTab === 'security' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Lock className="w-5 h-5" />
                                    {t('security')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h1 className="text-2xl font-bold font-serif text-gray-900 mb-6">{t('profileDetails')}</h1>
                                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
                                        <input
                                            type="tel"
                                            value={profileData.phoneNumber}
                                            onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
                                        <input
                                            type="text"
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                            placeholder={t('address')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                                        <input
                                            type="text"
                                            value={profileData.city}
                                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                            placeholder={t('city')}
                                        />
                                    </div>
                                    {profileStatus && (
                                        <p className={`text-sm ${profileStatus.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{profileStatus}</p>
                                    )}
                                    <button
                                        type="submit"
                                        className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg"
                                    >
                                        {t('saveChanges')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h1 className="text-2xl font-bold font-serif text-gray-900 mb-6">{t('security')}</h1>
                                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('oldPassword')}</label>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmNewPassword')}</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50"
                                            required
                                        />
                                    </div>
                                    {securityStatus && (
                                        <p className={`text-sm ${securityStatus.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{securityStatus}</p>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg"
                                        >
                                            {t('updatePassword')}
                                        </button>
                                        <Link href="/forgot-password" className="text-sm text-pink-600 hover:underline">
                                            {t('forgotPassword')}
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'questions' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h1 className="text-2xl font-bold font-serif text-gray-900 mb-6">{t('myQuestions')}</h1>
                                {orders.filter(o => o.messages && o.messages.length > 0).length === 0 && questions.length === 0 ? (
                                    <p className="text-gray-500">You haven't asked any questions yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {[
                                            ...orders.filter(o => o.messages && o.messages.length > 0).map(o => ({
                                                type: 'order',
                                                data: o,
                                                date: o.messages[o.messages.length - 1].createdAt
                                            })),
                                            ...questions.map(q => ({
                                                type: 'question',
                                                data: q,
                                                date: q.answeredAt || q.createdAt
                                            }))
                                        ]
                                            // @ts-ignore
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((item: any) => {
                                                if (item.type === 'order') {
                                                    const order = item.data;
                                                    const lastMsg = order.messages[order.messages.length - 1];
                                                    const hasUnread = order.messages.some((m: any) => m.isAdmin && !m.isRead);

                                                    return (
                                                        <div
                                                            key={`order-${order.id}`}
                                                            onClick={() => openMessageModal(order)}
                                                            className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group ${hasUnread ? 'bg-pink-50 border-pink-200' : 'bg-white border-gray-200'}`}
                                                        >
                                                            <div className="flex gap-4 items-center">
                                                                {/* Show first product image or placeholder */}
                                                                <img
                                                                    src={order.items?.[0]?.product?.images?.[0] || order.items?.[0]?.product?.imageUrl || '/placeholder.png'}
                                                                    alt="Order Product"
                                                                    className="w-16 h-16 rounded-lg object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <p className="font-bold text-gray-900 text-sm truncate">
                                                                            {t('order')} #{order.id.slice(0, 8)}
                                                                            <span className="text-gray-500 font-normal ml-2 text-xs">
                                                                                ({order.items.length} items)
                                                                            </span>
                                                                        </p>
                                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                                            {new Date(lastMsg.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {hasUnread && (
                                                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide bg-pink-600 text-white animate-pulse">
                                                                                New Message
                                                                            </span>
                                                                        )}
                                                                        <p className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                                            {lastMsg.content}
                                                                        </p>
                                                                    </div>

                                                                </div>
                                                                <div className="text-gray-300 group-hover:text-pink-600">
                                                                    <MessageCircle className="w-5 h-5" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    const q = item.data;
                                                    const hasUnread = q.answer && !q.isAnswerRead;
                                                    return (
                                                        <div key={`question-${q.id}`} className={`border rounded-xl p-6 hover:shadow-md transition-all ${hasUnread ? 'bg-pink-50 border-pink-200' : 'bg-white border-gray-200'}`}>
                                                            <div className="flex gap-4 items-start">
                                                                <img src={q.product.images[0]} alt={q.product.name} className="w-16 h-16 rounded-lg object-cover" />
                                                                <div className="flex-1">
                                                                    <Link href={`/shop/${q.product.id}`} className="font-bold text-gray-900 hover:text-pink-600 text-sm">
                                                                        {q.product.name}
                                                                    </Link>
                                                                    <p className="mt-2 text-gray-700 font-medium text-sm">Q: {q.question}</p>
                                                                    {q.answer ? (
                                                                        <div className="mt-3 bg-white/50 p-3 rounded-lg border border-pink-100">
                                                                            <div className="flex justify-between items-start">
                                                                                <p className="text-sm font-bold text-pink-700 mb-1">Admin Response:</p>
                                                                                {hasUnread && <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full">New</span>}
                                                                            </div>
                                                                            <p className="text-sm text-gray-700">{q.answer}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="mt-2 text-xs text-gray-500 italic">Waiting for response...</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h1 className="text-2xl font-bold font-serif text-gray-900 mb-6">{t('myOrders')}</h1>
                                {ordersLoading ? (
                                    <p>{t('loading')}</p>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">{t('noOrders')}</p>
                                        <Link href="/shop" className="text-pink-600 font-bold hover:underline">{t('startShopping')}</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order) => {
                                            const isExpanded = expandedOrders.has(order.id);
                                            return (
                                                <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                                                    {/* Order Header - Always Visible */}
                                                    <div className="p-6">
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                            <div onClick={() => toggleOrder(order.id)} className="cursor-pointer flex items-center gap-3">
                                                                <div className={`p-1 rounded-full bg-gray-100 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-400 font-medium">{t('order')}</span>
                                                                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md text-gray-900 font-bold text-sm font-mono">
                                                                            #{order.id.slice(0, 8).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-400 mt-1">{t('placedOn')} {new Date(order.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                                    order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                                                        order.status === 'PREPARING' ? 'bg-purple-100 text-purple-700' :
                                                                            order.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                                                                                'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {order.status.replace('_', ' ')}
                                                                </span>
                                                                <button
                                                                    onClick={() => setTrackingOrder(order)}
                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium hover:bg-gray-800"
                                                                >
                                                                    <Truck className="w-3 h-3" />
                                                                    {t('track')}
                                                                </button>
                                                                <button
                                                                    onClick={() => setMessageOrder(order)}
                                                                    className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50 rounded-full text-xs font-medium hover:bg-blue-100"
                                                                >
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    {t('message')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expandable Details */}
                                                    {isExpanded && (
                                                        <div className="border-t border-gray-100 bg-gray-50 p-6 animate-fade-in">
                                                            <div className="space-y-4">
                                                                {order.items.map((item: any) => (
                                                                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                                                        <div className="flex items-center gap-4">
                                                                            <img src={item.product?.images?.[0] || item.product?.imageUrl} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                                                                            <div>
                                                                                <p className="font-bold text-gray-900 text-sm">{item.product.name}</p>
                                                                                <p className="text-xs text-gray-500">{t('qty')}: {item.quantity} {item.selectedColor && `• ${t('color')}: ${item.selectedColor}`}</p>
                                                                            </div>
                                                                        </div>
                                                                        <p className="font-medium text-gray-900 text-sm">${Number(item.price).toFixed(2)}</p>
                                                                    </div>
                                                                ))}
                                                                <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-4">
                                                                    <span className="font-bold text-gray-700">{t('totalOrderAmount')}</span>
                                                                    <span className="font-bold text-xl text-gray-900">${Number(order.totalAmount).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tracking Modal */}
                {trackingOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative">
                            <button onClick={() => setTrackingOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2">
                                <Package className="w-6 h-6 text-pink-600" />
                                {t('track')} {t('order')} #{trackingOrder.id.slice(0, 8)}
                            </h2>
                            <div className="space-y-8">
                                {/* Simple Status Steps */}
                                <div className="relative flex justify-between">
                                    {['AWAITING_PAYMENT', 'PAID', 'PREPARING', 'DELIVERED'].map((step, idx) => {
                                        const steps = ['AWAITING_PAYMENT', 'PAID', 'PREPARING', 'DELIVERED'];
                                        const currentIdx = steps.indexOf(trackingOrder.status);
                                        const isCompleted = idx <= currentIdx;

                                        return (
                                            <div key={idx} className="flex flex-col items-center relative z-10 w-1/4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${isCompleted ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                    {idx + 1}
                                                </div>
                                                <span className={`text-xs font-bold text-center ${isCompleted ? 'text-pink-600' : 'text-gray-400'}`}>
                                                    {step.replace('_', ' ')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {/* Progress Bar Line */}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-0">
                                        <div
                                            className="h-full bg-pink-600 transition-all duration-500"
                                            style={{
                                                width: `${Math.max(0, ['AWAITING_PAYMENT', 'PAID', 'PREPARING', 'DELIVERED'].indexOf(trackingOrder.status)) * 33}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="font-bold text-gray-900 mb-1">{t('currentStatus')}:</p>
                                    <p className="text-pink-600 text-lg font-medium">{trackingOrder.status.replace('_', ' ')}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {trackingOrder.status === 'PREPARING' ? t('preparingDesc') :
                                            trackingOrder.status === 'DELIVERED' ? t('deliveredDesc') :
                                                t('processingDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message Modal */}
                {messageOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative h-[500px] flex flex-col">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                                <div>
                                    <h2 className="text-xl font-bold font-serif">{t('messageSeller')}</h2>
                                    <p className="text-xs text-gray-500">{t('order')} #{messageOrder.id.slice(0, 8)}</p>
                                </div>
                                <button onClick={() => setMessageOrder(null)} className="text-gray-400 hover:text-gray-900">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Chat Scroll Area */}
                            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                                {messageOrder.messages && messageOrder.messages.length > 0 ? (
                                    messageOrder.messages.map((msg: any) => (
                                        <div key={msg.id} className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.isAdmin ? 'bg-gray-100 text-gray-800 rounded-bl-none' : 'bg-pink-600 text-white rounded-br-none'}`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {msg.isAdmin ? t('support') : t('me')} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                        No messages yet. Start the conversation!
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="border-t pt-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-gray-50 text-sm"
                                        placeholder={t('typeMessage')}
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendingMessage}
                                        className="absolute right-1 top-1 p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
