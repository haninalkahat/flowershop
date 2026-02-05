
'use client';

import React, { useEffect, useState } from 'react';

interface Order {
    id: string;
    totalAmount: string;
    status: string;
    items: any[];
    user: { fullName: string; email: string };
    receipt?: { imageUrl: string };
    createdAt: string;
    paymentMethod: string;
    messages: any[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (data.orders) {
                setOrders(data.orders);
            }
        } catch (err) {
            console.error('Failed to fetch admin orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);


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
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
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
                alert('Reply sent!');
                setReplyContent('');
                setMessageOrder(null);
                fetchOrders(); // Refresh to show new message count if we tracked it, or just refresh
            } else {
                alert('Failed to send reply');
            }
        } catch (err) {
            alert('Error sending reply');
        } finally {
            setSendingReply(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif mb-8 flex justify-between items-center">
                <span>Admin Order Management</span>
                <button onClick={fetchOrders} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">Refresh</button>
            </h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Order ID</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">User</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Total</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Messages</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{order.user.fullName}</div>
                                    <div className="text-gray-500 text-xs">{order.user.email}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">${Number(order.totalAmount).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => setMessageOrder(order)}
                                        className={`font-medium text-xs flex items-center gap-1 ${order.messages.some(m => !m.isAdmin) ? 'text-blue-600 font-bold animate-pulse' : 'text-pink-600 hover:text-pink-800'}`}
                                    >
                                        View/Reply
                                        {/* @ts-ignore */}
                                        {order.messages && order.messages.length > 0 && ` (${order.messages.length})`}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="border rounded px-2 py-1 text-xs"
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                    >
                                        <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                                        <option value="PAID">Mark as PAID</option>
                                        <option value="PREPARING">Preparing</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="REJECTED">Reject</option>
                                        <option value="CANCELED">Cancel</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Message Modal */}
            {messageOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Messages - Order #{messageOrder.id.slice(0, 8)}</h3>
                                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                    {messageOrder.items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-1.5 rounded border">
                                            <img src={item.product?.images?.[0] || '/placeholder.png'} alt={item.product?.name} className="w-8 h-8 rounded object-cover" />
                                            <span className="text-xs font-medium max-w-[100px] truncate">{item.product?.name}</span>
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
                                        <p className="font-semibold text-xs mb-1">{msg.isAdmin ? 'Admin' : msg.user?.fullName || 'User'}</p>
                                        <p>{msg.content}</p>
                                        <p className="text-[10px] text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm text-center">No messages yet.</p>
                            )}
                        </div>

                        <form onSubmit={handleSendReply}>
                            <textarea
                                className="w-full border rounded p-2 text-sm mb-2"
                                placeholder="Type a reply..."
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
                                {sendingReply ? 'Sending...' : 'Send Reply'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
