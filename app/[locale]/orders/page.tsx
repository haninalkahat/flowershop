
'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';

interface Order {
    id: string;
    totalAmount: string; // Decimal is string in JSON
    status: string;
    items: any[];
    receipt?: { imageUrl: string };
    createdAt: string;
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (data.orders) {
                    setOrders(data.orders);
                }
            } catch (err) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleCancel = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELED' })
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELED' } : o));
            } else {
                alert('Failed to cancel order');
            }
        } catch (err) {
            alert('Error cancelling order');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;
    if (orders.length === 0) return (
        <div className="p-8 text-center h-screen flex flex-col justify-center items-center">
            <h1 className="text-2xl font-serif mb-4">You have no orders yet.</h1>
            <Link href="/" className="text-pink-600 underline">Start Shopping</Link>
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'AWAITING_PAYMENT': return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'CANCELED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif mb-8 text-center">My Orders</h1>

            <div className="space-y-6 max-w-4xl mx-auto">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <span className="font-semibold block text-sm text-gray-500">Order ID: {order.id.slice(0, 8)}...</span>
                                <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="p-4">
                            <ul className="space-y-2 mb-4">
                                {order.items.map((item: any) => (
                                    <li key={item.id} className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            {item.product && (
                                                <Link
                                                    href={`/shop/${item.product.id}`}
                                                    target="_blank"
                                                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                                >
                                                    {item.product.imageUrl && (
                                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-8 h-8 rounded object-cover" />
                                                    )}
                                                    <span>{item.product.name} {item.selectedColor && `(${item.selectedColor})`} x {item.quantity}</span>
                                                </Link>
                                            )}
                                        </div>
                                        <span>${Number(item.price).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-between items-center border-t pt-4">
                                <div className="font-bold">Total: ${Number(order.totalAmount).toFixed(2)}</div>

                                <div className="flex gap-2">
                                    {order.receipt?.imageUrl && (
                                        <a
                                            href={order.receipt.imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-sm underline px-2"
                                        >
                                            View Receipt
                                        </a>
                                    )}

                                    {order.status === 'AWAITING_PAYMENT' && (
                                        <button
                                            onClick={() => handleCancel(order.id)}
                                            className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors border border-red-200"
                                        >
                                            Request Cancellation
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
