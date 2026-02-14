import '../globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cairo } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Flowershop',
  description: 'A full-stack flower e-commerce website',
  icons: {
    icon: '/icon.svg',
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['en', 'tr', 'ar'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  // Include all font variables to prevent "preloaded but not used" warning, but apply specific font class based on locale
  const fonts = `${cairo.variable} ${inter.variable} ${playfair.variable} ${locale === 'ar' ? cairo.className : 'font-sans'}`;

  return (
    <html lang={locale} dir={dir}>
      <body className={`${fonts} antialiased text-gray-800 bg-gray-50 transition-colors duration-300`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <CurrencyProvider>
                <WishlistProvider>
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#FDF2F8',
                        color: '#831843',
                        border: '1px solid #FBCFE8',
                        padding: '16px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      },
                      success: {
                        iconTheme: {
                          primary: '#DB2777',
                          secondary: '#FDF2F8',
                        },
                      },
                      error: {
                        style: {
                          background: '#FEF2F2',
                          color: '#991B1B',
                          border: '1px solid #FECACA',
                        },
                        iconTheme: {
                          primary: '#EF4444',
                          secondary: '#FEF2F2',
                        }
                      }
                    }}
                  />
                  <Navbar />
                  {children}
                  <Footer />
                </WishlistProvider>
              </CurrencyProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
