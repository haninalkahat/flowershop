
'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

interface Review {
    id: string;
    rating: number;
    comment: string;
    user: { fullName: string };
    createdAt: string;
}

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const t = useTranslations('Reviews');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [average, setAverage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/reviews`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
                if (data.length > 0) {
                    const sum = data.reduce((acc, r) => acc + r.rating, 0);
                    setAverage(sum / data.length);
                } else {
                    setAverage(0);
                }
            }
        } catch (err) {
            console.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: newRating, comment: newComment })
            });

            if (res.ok) {
                toast.success(t('success'));
                setShowForm(false);
                setNewComment('');
                setNewRating(5);
                fetchReviews();
            } else {
                const error = await res.json();
                toast.error(error.error || t('error'));
            }
        } catch (err) {
            toast.error(t('error'));
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-lg">
                        {star <= Math.round(rating) ? '★' : <span className="text-gray-300">★</span>}
                    </span>
                ))}
            </div>
        );
    };

    const formatName = (name: string) => {
        if (!name) return 'Anonymous';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0]} ${parts[parts.length - 1][0]}***`;
        }
        return name;
    };

    return (
        <div className="mt-12 border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-serif font-bold text-pink-700">{t('title')}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-800">{average.toFixed(1)}</span>
                        <div className="flex flex-col">
                            {renderStars(average)}
                            <span className="text-sm text-gray-500">{reviews.length} {t('totalReviews')}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition"
                >
                    {t('writeReview')}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-8 animate-fade-in-up">
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">{t('rating')}</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className={`text-2xl ${star <= newRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">{t('comment')}</label>
                        <textarea
                            className="w-full border rounded p-3"
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                        {submitting ? '...' : t('submit')}
                    </button>
                </form>
            )}

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">{t('noReviews')}</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                            <div className="flex justify-between mb-2">
                                <div className="font-bold">{formatName(review.user?.fullName)}</div>
                                <div className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="mb-2">{renderStars(review.rating)}</div>
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
