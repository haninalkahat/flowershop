'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function SignupPage() {
    const t = useTranslations('Auth');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        city: '',
        birthYear: '',
        password: '',
    });
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phoneNumber: formData.phone,
                    address: formData.address,
                    country: formData.country,
                    city: formData.city,
                    birthYear: formData.birthYear,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user);
                router.push('/');
            } else {
                setError(data.error || t('errors.signupFailed'));
            }
        } catch (err) {
            setError(t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-serif">
                        {t('createAccountTitle')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t('or')}{' '}
                        <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
                            {t('signInLink')}
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-3">
                        {/* Full Name */}
                        <input
                            name="fullName"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-left rtl:text-right"
                            placeholder={t('fullNameLabel')}
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        {/* Email */}
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-left rtl:text-right"
                            placeholder={t('emailLabel')}
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {/* Phone */}
                        <input
                            name="phone"
                            type="tel"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-left rtl:text-right"
                            placeholder={t('phoneLabel')}
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {/* Address */}
                        <input
                            name="address"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-left rtl:text-right"
                            placeholder={t('addressLabel')}
                            value={formData.address}
                            onChange={handleChange}
                        />
                        {/* Country */}
                        <div className="relative">
                            <select
                                name="country"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm bg-white text-left rtl:text-right"
                                value={formData.country}
                                onChange={handleChange}
                            >
                                <option value="" disabled>{t('countryLabel')}</option>
                                <option value="USA">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                                <option value="Turkey">Turkey</option>
                                <option value="UAE">United Arab Emirates</option>
                                <option value="Saudi Arabia">Saudi Arabia</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {/* City */}
                        <input
                            name="city"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-left rtl:text-right"
                            placeholder={t('cityLabel')}
                            value={formData.city}
                            onChange={handleChange}
                        />
                        {/* Birth Year */}
                        <div className="relative">
                            <select
                                name="birthYear"
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm bg-white text-left rtl:text-right"
                                value={formData.birthYear}
                                onChange={handleChange}
                            >
                                <option value="">{t('birthYearLabel')}</option>
                                {Array.from({ length: 126 }, (_, i) => 2025 - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        {/* Password */}
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-left rtl:text-right"
                            placeholder={t('passwordLabel')}
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-70"
                        >
                            {loading ? t('signingUp') : t('signUpButton')}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">{t('continueWith')}</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => window.location.href = '/api/auth/google'}
                            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                            <svg className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.369 L -25.464 53.369 L -25.464 56.459 C -23.494 60.379 -19.424 63.239 -14.754 63.239 Z" />
                                    <path fill="#FBBC05" d="M -21.484 53.369 C -21.734 52.619 -21.874 51.819 -21.874 50.999 C -21.874 50.179 -21.734 49.379 -21.484 48.629 L -21.484 45.529 L -25.464 45.529 C -26.284 47.149 -26.754 48.999 -26.754 50.999 C -26.754 52.999 -26.284 54.849 -25.464 56.459 L -21.484 53.369 Z" />
                                    <path fill="#EA4335" d="M -14.754 43.509 C -12.984 43.509 -11.404 44.119 -10.154 45.319 L -6.734 41.899 C -8.804 39.969 -11.514 38.759 -14.754 38.759 C -19.424 38.759 -23.494 41.619 -25.464 45.529 L -21.484 48.629 C -20.534 45.629 -17.884 43.509 -14.754 43.509 Z" />
                                </g>
                            </svg>
                            {t('signUpGoogle')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
