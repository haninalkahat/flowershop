'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCookies, CookiesProvider } from 'react-cookie';

export type Currency = 'USD' | 'TRY' | 'SAR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (price: number) => string;
    convertPrice: (price: number) => number;
    rates: Record<string, number>;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const RATES_API = 'https://api.exchangerate-api.com/v4/latest/USD';

// Fallback rates in case API fails
const FALLBACK_RATES = {
    USD: 1,
    TRY: 35.0, // Approximate
    SAR: 3.75,
};

const CurrencyProviderContent = ({ children }: { children: ReactNode }) => {
    const [cookies, setCookie] = useCookies(['currency']);
    const [currency, setCurrencyState] = useState<Currency>('USD');
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);

    // Initialize currency from cookie on mount ONLY
    useEffect(() => {
        const initCurrency = async () => {
            // 1. Check Cookie
            if (cookies.currency && ['USD', 'TRY', 'SAR'].includes(cookies.currency)) {
                setCurrencyState(cookies.currency as Currency);
                setLoading(false);
                return;
            }

            // 2. Detect via IP if no cookie
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                const country = data.country_code; // e.g., 'TR', 'SA', 'US'

                let detected: Currency = 'USD';
                if (country === 'TR') detected = 'TRY';
                else if (['SA', 'AE', 'KW', 'QA', 'BH', 'OM'].includes(country)) detected = 'SAR';
                else detected = 'USD';

                setCurrencyState(detected);
                // Save to cookie for future sessions
                setCookie('currency', detected, { path: '/', maxAge: 31536000 }); // 1 year
            } catch (error) {
                console.error('Failed to detect location:', error);
                setCurrencyState('USD'); // Default fallback
            } finally {
                setLoading(false);
            }
        };

        // Only run once on mount
        initCurrency();
    }, []); // Empty dependency array to prevent loops or re-runs

    // Fetch Exchange Rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch(RATES_API);
                if (res.ok) {
                    const data = await res.json();
                    setRates(data.rates);
                } else {
                    console.warn('Failed to fetch rates, using fallback');
                }
            } catch (error) {
                console.warn('Error fetching rates:', error);
            }
        };

        fetchRates();
        // Refresh rates every hour
        const interval = setInterval(fetchRates, 3600000);
        return () => clearInterval(interval);
    }, []);

    const setCurrency = (newCurrency: Currency) => {
        // Update state immediately for UI responsiveness
        setCurrencyState(newCurrency);
        // Persist to cookie
        setCookie('currency', newCurrency, { path: '/', maxAge: 31536000 });
    };

    const convertPrice = (price: number) => {
        const rate = rates[currency] || 1;
        return price * rate;
    };

    const formatPrice = (price: number) => {
        const converted = convertPrice(price);

        // Custom formatting for specific requirements
        if (currency === 'TRY') {
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(converted);
        } else if (currency === 'SAR') {
            const formatted = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(converted);
            // Sometimes browsers format SAR as 'SAR 150', user asked for '١٥٠ ر.س'
            // Let's try to match user preference if standard Intl isn't exact
            return formatted.replace('SAR', 'ر.س');
        } else {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted);
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, rates, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    return (
        <CookiesProvider>
            <CurrencyProviderContent>{children}</CurrencyProviderContent>
        </CookiesProvider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

