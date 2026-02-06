'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Mail, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
    const t = useTranslations('Auth');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(t('resetSuccess'));
            } else {
                setStatus('error');
                setMessage(data.error || t('errors.generic'));
            }
        } catch (err) {
            setStatus('error');
            setMessage(t('errors.networkError'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div>
                    <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 rtl:flex-row-reverse">
                        <ArrowLeft className="w-4 h-4 mr-1 rtl:hidden" />
                        <ArrowRight className="w-4 h-4 ml-1 hidden rtl:block" />
                        {t('backToLogin')}
                    </Link>
                    <div className="mx-auto h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-pink-600" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 font-serif">
                        {t('resetPasswordTitle')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t('resetDesc')}
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-green-800 font-medium">{message}</p>
                        <p className="text-xs text-gray-500 mt-2">(Check the application console for the link in Dev mode)</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-left rtl:text-right"
                                    placeholder={t('emailLabel')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{message}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gray-900 hover:bg-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-70 shadow-lg hover:shadow-pink-200"
                            >
                                {status === 'loading' ? t('sendingLink') : t('sendResetLink')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
