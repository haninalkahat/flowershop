
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

    if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

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
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Receipt</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
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
                                    {order.receipt ? (
                                        <a
                                            href={order.receipt.imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs inline-flex items-center gap-1"
                                        >
                                            View Receipt
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 italic">None</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="border rounded px-2 py-1 text-xs"
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                    >
                                        <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                                        <option value="PAID">Mark as PAID</option>
                                        <option value="REJECTED">Reject</option>
                                        <option value="CANCELED">Cancel</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
