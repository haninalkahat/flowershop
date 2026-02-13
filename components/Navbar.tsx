'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Flower, ShoppingCart, User, ChevronDown, Heart, Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect, useTransition } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency, Currency } from '@/context/CurrencyContext'; // Added
import { useLocale, useTranslations } from 'next-intl';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false); // Added
  const [showMobileLangDropdown, setShowMobileLangDropdown] = useState(false);
  const [showMobileCurrencyDropdown, setShowMobileCurrencyDropdown] = useState(false); // Added
  const [mounted, setMounted] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const { cart, getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency(); // Added

  // i18n hooks
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  useEffect(() => {
    if (getTotalItems() > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cart]); // Animate when cart changes
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null); // Added
  const mobileLangDropdownRef = useRef<HTMLDivElement>(null);
  const mobileCurrencyDropdownRef = useRef<HTMLDivElement>(null); // Added

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
      if (mobileLangDropdownRef.current && !mobileLangDropdownRef.current.contains(event.target as Node)) {
        setShowMobileLangDropdown(false);
      }
      if (mobileCurrencyDropdownRef.current && !mobileCurrencyDropdownRef.current.contains(event.target as Node)) {
        setShowMobileCurrencyDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-pink-50 p-1.5 md:p-2 rounded-full group-hover:bg-pink-100 transition-colors duration-300">
            <Flower className="w-4 h-4 md:w-6 md:h-6 text-pink-600" />
          </div>
          <span className="font-serif text-lg md:text-2xl font-bold text-gray-900 tracking-wide">Flowershop</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <Link href="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            {t('home')}
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            {t('about')}
          </Link>
          <Link href="/shop" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            {t('shop')}
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            {t('contact')}
          </Link>

          {/* Language Switcher */}
          <div className="relative border-l pl-4 border-gray-200" ref={langDropdownRef}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <Globe className="w-5 h-5" />
            </button>

            {showLangDropdown && (
              <div className={`absolute mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in z-50 ${locale === 'ar' ? 'left-0' : 'right-0'}`}>
                <button
                  onClick={() => { switchLocale('tr'); setShowLangDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                >
                  <span>Türkçe</span>
                  {locale === 'tr' && <Check className="w-4 h-4 text-pink-600" />}
                </button>
                <button
                  onClick={() => { switchLocale('en'); setShowLangDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                >
                  <span>English</span>
                  {locale === 'en' && <Check className="w-4 h-4 text-pink-600" />}
                </button>
                <button
                  onClick={() => { switchLocale('ar'); setShowLangDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                >
                  <span>العربية</span>
                  {locale === 'ar' && <Check className="w-4 h-4 text-pink-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Currency Switcher */}
          <div className="relative border-l pl-4 border-gray-200" ref={currencyDropdownRef}>
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors p-1 rounded-full hover:bg-gray-100 font-medium text-sm"
            >
              {currency}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCurrencyDropdown && (
              <div className={`absolute mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in z-50 ${locale === 'ar' ? 'left-0' : 'right-0'}`}>
                {['USD', 'TRY', 'SAR'].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCurrency(c as Currency); setShowCurrencyDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                  >
                    <span>{c}</span>
                    {currency === c && <Check className="w-4 h-4 text-pink-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                {user.fullName.split(' ')[0]}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showUserDropdown && (
                <div className={`absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in ${locale === 'ar' ? 'left-0' : 'right-0'}`}>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  >
                    {t('profile')}
                  </Link>
                  {user.email === 'llaffashopstore@gmail.com' && (
                    <Link
                      href="/admin/orders"
                      onClick={() => setShowUserDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                    >
                      {t('adminPanel')}
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setShowUserDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2.5 rounded-full bg-pink-600 text-white font-medium hover:bg-pink-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 whitespace-nowrap">
              {t('signup')}
            </Link>
          )}


          <div className="border-l border-gray-200 pl-6 ml-2 flex items-center space-x-4">
            <Link
              href="/wishlist"
              className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
            >
              <Heart className="w-6 h-6" />
            </Link>

            <Link
              href="/cart"
              className={`relative text-gray-500 hover:text-pink-600 transition-all duration-300 transform ${animateCart ? 'scale-125 text-pink-700' : 'scale-100'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Currency Switcher */}
          <div className="relative" ref={mobileCurrencyDropdownRef}>
            <button
              onClick={() => setShowMobileCurrencyDropdown(!showMobileCurrencyDropdown)}
              className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors p-1 rounded-full hover:bg-gray-100 font-medium text-[10px]"
            >
              {currency}
            </button>

            {showMobileCurrencyDropdown && (
              <div className={`absolute mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in z-50 top-full ${locale === 'ar' ? 'left-0' : 'right-0'}`}>
                {['USD', 'TRY', 'SAR'].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCurrency(c as Currency); setShowMobileCurrencyDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                  >
                    <span>{c}</span>
                    {currency === c && <Check className="w-4 h-4 text-pink-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Lang Switcher */}
          <div className="relative" ref={mobileLangDropdownRef}>
            <button
              onClick={() => setShowMobileLangDropdown(!showMobileLangDropdown)}
              className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <Globe className="w-4 h-4" />
            </button>

            {showMobileLangDropdown && (
              <div className={`absolute mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in z-50 top-full ${locale === 'ar' ? 'left-0' : 'right-0'}`}>
                <button
                  onClick={() => { switchLocale('tr'); setShowMobileLangDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                >
                  <span>Türkçe</span>
                  {locale === 'tr' && <Check className="w-4 h-4 text-pink-600" />}
                </button>
                <button
                  onClick={() => { switchLocale('en'); setShowMobileLangDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                >
                  <span>English</span>
                  {locale === 'en' && <Check className="w-4 h-4 text-pink-600" />}
                </button>
                <button
                  onClick={() => { switchLocale('ar'); setShowMobileLangDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-between group"
                >
                  <span>العربية</span>
                  {locale === 'ar' && <Check className="w-4 h-4 text-pink-600" />}
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-pink-600 focus:outline-none">
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-3 shadow-lg absolute w-full left-0 animate-fade-in-up z-50">
          <Link href="/" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>{t('home')}</Link>
          <Link href="/shop" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>{t('shop')}</Link>
          <Link href="/about" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>{t('about')}</Link>
          <Link href="/contact" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>{t('contact')}</Link>
          <Link href="/wishlist" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>Wishlist</Link>
          <Link href="/cart" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>
            {t('cart')} ({getTotalItems()})
          </Link>
          {user ? (
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
              <span className="block text-gray-700 font-medium px-2">{user.fullName}</span>
              <Link href="/profile" className="block text-gray-600 hover:text-pink-600 py-2 px-2" onClick={() => setIsOpen(false)}>{t('profile')}</Link>
              {user.email === 'llaffashopstore@gmail.com' && (
                <Link href="/admin/orders" className="block text-gray-600 hover:text-pink-600 py-2 px-2" onClick={() => setIsOpen(false)}>{t('adminPanel')}</Link>
              )}
              <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left text-pink-600 font-medium py-2 px-2 hover:bg-pink-50 rounded">
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link href="/login" className="block text-center mt-4 w-full py-2.5 rounded-full bg-pink-600 text-white font-medium hover:bg-pink-700" onClick={() => setIsOpen(false)}>
              {t('signup')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
