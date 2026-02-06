'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Lock, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
    const t = useTranslations('Auth');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage(t('passwordsDoNotMatch'));
            return;
        }

        if (!token) {
            setStatus('error');
            setMessage(t('invalidToken'));
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(t('passwordResetSuccess'));
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || t('errors.generic'));
            }
        } catch (err) {
            setStatus('error');
            setMessage(t('errors.networkError'));
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">{t('invalidLink')}</h2>
                <p className="text-gray-600 mb-6">{t('invalidLinkDesc')}</p>
                <Link href="/forgot-password" className="text-pink-600 hover:underline">
                    {t('requestNewLink')}
                </Link>
            </div>
        );
    }

    return (
        <>
            <div>
                <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 rtl:flex-row-reverse">
                    <ArrowLeft className="w-4 h-4 mr-1 rtl:hidden" />
                    <ArrowRight className="w-4 h-4 ml-1 hidden rtl:block" />
                    {t('backToLogin')}
                </Link>
                <div className="mx-auto h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-pink-600" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900 font-serif">
                    {t('setNewPassword')}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {t('newPasswordDesc')}
                </p>
            </div>

            {status === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mt-8">
                    <p className="text-green-800 font-bold text-lg mb-2">{t('success')}</p>
                    <p className="text-green-700">{message}</p>
                </div>
            ) : (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('newPasswordLabel')}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-left rtl:text-right"
                                placeholder={t('enterNewPassword')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1 text-left rtl:text-right">{t('confirmNewPasswordLabel')}</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-left rtl:text-right"
                                placeholder={t('confirmNewPassword')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {status === 'loading' ? t('resettingPassword') : t('setNewPassword')}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
