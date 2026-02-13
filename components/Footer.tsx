'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-pink-100 p-8 mt-8 shadow-inner border-t border-pink-200 transition-colors duration-300">
      <div className="container mx-auto text-center text-pink-600">
        <p>&copy; {new Date().getFullYear()} Flowershop. {t('rightsReserved')}</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="hover:text-pink-800 transition-colors duration-200">{t('privacyPolicy')}</a>
          <a href="#" className="hover:text-pink-800 transition-colors duration-200">{t('termsOfService')}</a>
        </div>
      </div>
    </footer>
  );
}
