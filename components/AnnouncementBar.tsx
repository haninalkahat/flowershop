'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnnouncementBar() {
    const [settings, setSettings] = useState({
        enabled: false,
        textTr: '',
        textEn: '',
        textAr: '',
        bgColor: '#FFC0CB',
        textColor: '#831843'
    });
    const pathname = usePathname();
    const locale = useLocale();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // We'll create an endpoint to fetch public settings
                const res = await fetch('/api/settings/announcement');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch announcement settings', error);
            }
        };

        fetchSettings();

        // Optional: Poll for updates or use a custom event listener if we want real-time without refresh
        // For now, simpler approach.
        const interval = setInterval(fetchSettings, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Don't show in admin panel
    if (pathname && pathname.includes('/admin')) return null;

    // Determine text based on locale
    let announcementText = '';
    if (locale === 'tr') announcementText = settings.textTr;
    else if (locale === 'ar') announcementText = settings.textAr;
    else announcementText = settings.textEn;

    // Fallback logic
    if (!announcementText) announcementText = settings.textEn || settings.textTr || settings.textAr || '';

    if (!settings.enabled || !announcementText) return null;

    return (
        <div
            style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
            className="w-full py-2 overflow-hidden relative z-40 transition-colors duration-300"
            dir="ltr"
        >
            <div className="whitespace-nowrap animate-marquee inline-block">
                <span className="mx-4 font-medium">{announcementText}</span>
                <span className="mx-4 font-medium">{announcementText}</span>
                <span className="mx-4 font-medium">{announcementText}</span>
                <span className="mx-4 font-medium">{announcementText}</span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="absolute top-2 whitespace-nowrap animate-marquee2 inline-block">
                <span className="mx-4 font-medium">{announcementText}</span>
                <span className="mx-4 font-medium">{announcementText}</span>
                <span className="mx-4 font-medium">{announcementText}</span>
                <span className="mx-4 font-medium">{announcementText}</span>
            </div>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                .animate-marquee2 {
                    animation: marquee2 25s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes marquee2 {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(0%); }
                }
            `}</style>
        </div>
    );
}
