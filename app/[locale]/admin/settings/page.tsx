
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
    const t = useTranslations('Admin');
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    // Announcement Bar State
    const [announcementSettings, setAnnouncementSettings] = useState({
        enabled: false,
        textTr: '',
        textEn: '',
        textAr: '',
        bgColor: '#FFC0CB', // Default pink
        textColor: '#831843' // Default dark pink
    });

    useEffect(() => {
        // Fetch setting status
        Promise.all([
            fetch('/api/settings/whatsapp').then(res => res.json()),
            fetch('/api/settings/announcement').then(res => res.json())
        ]).then(([whatsappData, announcementData]) => {
            setWhatsappEnabled(whatsappData.enabled);
            setAnnouncementSettings(announcementData);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const updateAnnouncementSettings = async (newSettings?: Partial<typeof announcementSettings>) => {
        const settingsToUpdate = { ...announcementSettings, ...newSettings };
        setAnnouncementSettings(settingsToUpdate); // Optimistic

        try {
            const res = await fetch('/api/settings/announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsToUpdate)
            });

            if (!res.ok) throw new Error('Failed to update');
            toast.success(t('settingsUpdated'));
        } catch (error) {
            // Revert would be complex without previous state tracking, simplified for now
            toast.error(t('settingsUpdateFailed'));
        }
    };

    const toggleWhatsApp = async () => {
        const newValue = !whatsappEnabled;
        setWhatsappEnabled(newValue); // Optimistic UI update

        try {
            const res = await fetch('/api/settings/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: newValue })
            });

            if (!res.ok) throw new Error('Failed to update');
            toast.success(t('settingsUpdated'));
        } catch (error) {
            setWhatsappEnabled(!newValue); // Revert on failure
            toast.error(t('settingsUpdateFailed'));
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8">{t('loading')}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">{t('settings')}</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-0.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    {t('whatsappButtonTitle')}
                </h2>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-700">{t('showFloatingButton')}</p>
                        <p className="text-sm text-gray-500">{t('whatsappDesc')}</p>
                    </div>

                    <button
                        onClick={toggleWhatsApp}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${whatsappEnabled ? 'bg-pink-600' : 'bg-gray-200'}`}
                    >
                        <span className="sr-only">Toggle WhatsApp Button</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${whatsappEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
            </div>

            {/* Announcement Bar Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-pink-600">📢</span>
                    {t('announcement.title')}
                </h2>

                <div className="space-y-6">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-700">{t('announcement.enable')}</p>
                            <p className="text-sm text-gray-500">{t('announcement.enableDesc')}</p>
                        </div>
                        <button
                            onClick={() => updateAnnouncementSettings({ enabled: !announcementSettings.enabled })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${announcementSettings.enabled ? 'bg-pink-600' : 'bg-gray-200'}`}
                        >
                            <span className="sr-only">Toggle Announcement Bar</span>
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${announcementSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>

                    {/* Text Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('announcement.textTr')}</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={announcementSettings.textTr}
                                onChange={(e) => setAnnouncementSettings(prev => ({ ...prev, textTr: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('announcement.textEn')}</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={announcementSettings.textEn}
                                onChange={(e) => setAnnouncementSettings(prev => ({ ...prev, textEn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('announcement.textAr')}</label>
                            <input
                                type="text"
                                dir="rtl"
                                value={announcementSettings.textAr}
                                onChange={(e) => setAnnouncementSettings(prev => ({ ...prev, textAr: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Color Pickers */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('announcement.bgColor')}</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={announcementSettings.bgColor}
                                    onChange={(e) => setAnnouncementSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                                />
                                <span className="text-sm font-mono text-gray-500">{announcementSettings.bgColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('announcement.textColor')}</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={announcementSettings.textColor}
                                    onChange={(e) => setAnnouncementSettings(prev => ({ ...prev, textColor: e.target.value }))}
                                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                                />
                                <span className="text-sm font-mono text-gray-500">{announcementSettings.textColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={() => updateAnnouncementSettings()}
                        className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        {t('announcement.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
