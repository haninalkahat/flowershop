
'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Question {
    id: string;
    question: string;
    answer?: string;
    user: { fullName: string };
    createdAt: string;
}

interface ProductQuestionsProps {
    productId: string;
}

export default function ProductQuestions({ productId }: ProductQuestionsProps) {
    const t = useTranslations('ProductQuestions');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [productId]);

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/questions`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setQuestions(data);
            }
        } catch (err) {
            console.error('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/${productId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: newQuestion })
            });

            if (res.ok) {
                alert(t('success'));
                setShowForm(false);
                setNewQuestion('');
                fetchQuestions();
            } else {
                const error = await res.json();
                alert(error.error || t('error'));
            }
        } catch (err) {
            alert(t('error'));
        } finally {
            setSubmitting(false);
        }
    };

    const formatName = (name: string) => {
        if (!name) return 'Anonymous';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0]} ${parts[parts.length - 1][0]}***`;
        }
        return name;
    };

    const displayedQuestions = showAll ? questions : questions.slice(0, 3);

    return (
        <div className="mt-12 border-t pt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold text-gray-800">{t('title')}</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition"
                >
                    {t('askQuestion')}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-8 animate-fade-in-up">
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">{t('placeholder')}</label>
                        <textarea
                            className="w-full border rounded p-3"
                            rows={3}
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            required
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedQuestions.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        {t('noQuestions')}
                    </div>
                ) : (
                    displayedQuestions.map((q) => (
                        <div key={q.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm text-gray-700">{formatName(q.user?.fullName)}</span>
                                <span className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Q: {q.question}</h4>
                            {q.answer ? (
                                <div className="mt-3 bg-gray-50 p-3 rounded text-sm border-l-4 border-pink-500">
                                    <span className="font-bold block text-pink-700 mb-1">{t('reply')}:</span>
                                    <p className="text-gray-700">{q.answer}</p>
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-gray-400 italic">
                                    Waiting for answer...
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {!showAll && questions.length > 3 && (
                <div className="text-center mt-6">
                    <button
                        onClick={() => setShowAll(true)}
                        className="text-pink-600 font-medium hover:underline"
                    >
                        {t('seeAll')}
                    </button>
                </div>
            )}

            {showAll && (
                <div className="text-center mt-6">
                    <button
                        onClick={() => setShowAll(false)}
                        className="text-gray-500 font-medium hover:underline"
                    >
                        Show Less
                    </button>
                </div>
            )}
        </div>
    );
}
