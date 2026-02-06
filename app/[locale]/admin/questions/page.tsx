
'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface ProductQuestion {
    id: string;
    question: string;
    answer?: string;

    user: { fullName: string; email: string };
    product: { id: string; name: string; images: string[] };
    createdAt: string;
    answeredAt?: string;
}

export default function AdminQuestionsPage() {
    const t = useTranslations('Admin'); // Fallback to 'Admin' or use a new namespace if needed. I appended keys to 'Admin' (productQuestions) but I might need more keys for the page itself.
    // I'll reuse 'viewReply', 'sendReply', etc. or add hardcoded labels if specific translation missing.
    // Actually I didn't add specific labels for "Delete Answer". I'll add simple text or icons.

    const [questions, setQuestions] = useState<ProductQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch('/api/admin/questions');
            const data = await res.json();
            if (data.questions) {
                setQuestions(data.questions);
            }
        } catch (err) {
            console.error('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (e: React.FormEvent, id: string) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/questions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: answerText })
            });
            if (res.ok) {
                const updated = await res.json();
                setQuestions(questions.map(q => q.id === id ? { ...q, answer: updated.answer, answeredAt: updated.answeredAt } : q));
                setReplyingTo(null);
                setAnswerText('');
                alert('Answer sent/updated!');
            } else {
                alert('Failed to send answer');
            }
        } catch (err) {
            alert('Error sending answer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAnswer = async (id: string) => {
        if (!confirm('Are you sure you want to delete this answer?')) return;
        try {
            const res = await fetch(`/api/admin/questions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: '' }) // Clear answer
            });
            if (res.ok) {
                setQuestions(questions.map(q => q.id === id ? { ...q, answer: undefined, answeredAt: undefined } : q));
                alert('Answer deleted');
            }
        } catch (err) {
            alert('Error deleting answer');
        }
    };

    // Optional: Delete entire question
    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setQuestions(questions.filter(q => q.id !== id));
                alert('Question deleted');
            }
        } catch (err) { alert('Error deleting question'); }
    };

    if (loading) return <div className="p-8 text-center">Loading questions...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif mb-8 text-pink-800 font-bold flex justify-between">
                Product Questions
                <button onClick={fetchQuestions} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-600 font-sans font-normal">Refresh</button>
            </h1>

            <div className="space-y-6">
                {questions.length === 0 ? (
                    <p className="text-center text-gray-500">No questions found.</p>
                ) : (
                    questions.map((q) => (
                        <div key={q.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                            {/* Product Info */}
                            <div className="w-full md:w-48 flex-shrink-0 flex flex-col gap-2">
                                <div className="relative aspect-square w-24 h-24 bg-gray-100 rounded-md overflow-hidden border">
                                    <Link href={`/shop/${q.product?.id || ''}`} target="_blank">
                                        <img
                                            src={q.product?.images?.[0] || '/placeholder.png'}
                                            alt={q.product?.name}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                        />
                                    </Link>
                                </div>
                                <span className="text-xs font-bold text-gray-700 truncate">{q.product?.name}</span>
                                <span className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                            </div>

                            {/* Question & Answer */}
                            <div className="flex-1">
                                <div className="mb-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{q.user?.fullName} <span className="font-normal text-gray-500 text-sm">asks:</span></h3>
                                    <p className="bg-gray-50 p-3 rounded-l-lg border-l-4 border-gray-300 italic text-gray-800">
                                        "{q.question}"
                                    </p>
                                </div>

                                {q.answer ? (
                                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-100 relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-pink-700 uppercase tracking-wide">Our Answer</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setReplyingTo(q.id); setAnswerText(q.answer || ''); }}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAnswer(q.id)}
                                                    className="text-xs text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-800">{q.answer}</p>
                                    </div>
                                ) : (
                                    !replyingTo && (
                                        <button
                                            onClick={() => { setReplyingTo(q.id); setAnswerText(''); }}
                                            className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition"
                                        >
                                            Reply
                                        </button>
                                    )
                                )}

                                {replyingTo === q.id && (
                                    <form onSubmit={(e) => handleSubmitAnswer(e, q.id)} className="mt-4 bg-white border p-4 rounded-lg shadow-sm animate-fade-in-up">
                                        <label className="block text-sm font-medium mb-2">Your Answer:</label>
                                        <textarea
                                            value={answerText}
                                            onChange={(e) => setAnswerText(e.target.value)}
                                            className="w-full border rounded p-2 mb-2 text-sm"
                                            rows={3}
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="bg-pink-600 text-white px-4 py-2 rounded text-sm hover:bg-pink-700 disabled:opacity-50"
                                            >
                                                {submitting ? 'Sending...' : 'Send Answer'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setReplyingTo(null); setAnswerText(''); }}
                                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="self-start text-gray-300 hover:text-red-500 transition-colors p-2"
                                title="Delete Question"
                            >
                                <span className="text-xl">×</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
