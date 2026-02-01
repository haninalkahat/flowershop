
'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Copy, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cart, getTotalPrice, clearCart } = useCart();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [error, setError] = useState('');

    const bankDetails = {
        accountHolder: 'Hanin Alhussein Alkhahat',
        bankName: 'Ziraat Bankası',
        iban: 'TR96 0001 0090 1063 1679 1050 01'
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('IBAN copied to clipboard!');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptFile) {
            setError('Please upload a payment receipt.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Combine upload and order creation
            const formData = new FormData();
            formData.append('file', receiptFile);
            formData.append('items', JSON.stringify(cart)); // Send cart items as fallback

            // Note: We don't need to pass cart items manually if the backend fetches from DB cart.
            // But if we did, we'd JSON.stringify them into a field. 
            // The current backend fetches from DB based on userId.

            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                body: formData, // Sending FormData automatically sets Content-Type to multipart/form-data
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.error || 'Failed to place order');
            }

            const orderData = await orderRes.json();

            // Clear cart and redirect
            clearCart();
            setOrderPlaced(true);
            setTimeout(() => {
                router.push(`/orders`);
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setUploading(false);
        }
    };

    if (cart.length === 0 && !orderPlaced) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-serif mb-4">Your cart is empty</h1>
                <Link href="/" className="text-pink-600 hover:text-pink-700 underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-serif mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600">Redirecting to your orders...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-serif mb-8 text-center">Checkout & Payment</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                        {cart.map((item) => (
                            <div key={`${item.id}-${item.selectedColor}`} className="flex justify-between text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span>${(item.discountPrice || item.originalPrice).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-medium mb-4">Bank Transfer Details</h2>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div>
                            <span className="font-semibold block">Bank Name:</span>
                            {bankDetails.bankName}
                        </div>
                        <div>
                            <span className="font-semibold block">Account Holder:</span>
                            {bankDetails.accountHolder}
                        </div>
                        <div>
                            <span className="font-semibold block">IBAN:</span>
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                                <code className="text-xs break-all">{bankDetails.iban}</code>
                                <button
                                    onClick={() => copyToClipboard(bankDetails.iban)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="Copy IBAN"
                                >
                                    <Copy size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-medium mb-4">Upload Payment Receipt</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Please transfer the total amount to the IBAN above and upload a screenshot of the receipt.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-300 transition-colors">
                        <input
                            type="file"
                            id="receipt"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                                {receiptFile ? receiptFile.name : 'Click to select receipt image or PDF'}
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !receiptFile}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${uploading || !receiptFile
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-pink-600 hover:bg-pink-700'
                            }`}
                    >
                        {uploading ? 'Processing...' : 'Confirm Payment & Place Order'}
                    </button>
                </form>
            </div>
        </div>
    );
}
