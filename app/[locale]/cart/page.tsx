'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CartPage() {
  const { cart, updateCartItemQuantity, removeFromCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('Cart');

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-serif font-bold text-pink-700 mb-6">{t('title')}</h1>
        <p className="text-gray-600 mb-8 text-lg">{t('empty')}</p>
        <Link
          href="/"
          className="bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition-colors shadow-lg"
        >
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-12 pb-32 md:pb-12">
      <h1 className="text-4xl font-serif font-bold text-pink-700 mb-8 text-center">{t('title')}</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
        <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-pink-50 border-b border-pink-100 font-semibold text-pink-800">
          <div className="col-span-3">{t('image')}</div>
          <div className="text-center">{t('price')}</div>
          <div className="text-center">{t('quantity')}</div>
          <div className="text-center">{t('total')}</div>
        </div>

        {cart.map((item, index) => {
          const price = item.discountPrice !== null ? item.discountPrice : item.originalPrice;
          const key = `${item.id}-${item.selectedColor || 'default'}-${index}`; // Add index to ensure uniqueness if data is duplicated

          return (
            <div key={key} className="flex flex-col md:grid md:grid-cols-6 gap-4 p-4 md:p-6 border-b border-gray-100 items-start md:items-center">
              {/* Product Info */}
              <div className="col-span-3 flex w-full items-start space-x-4">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                  <Image
                    src={item.imageUrl || (item.images && item.images[0]) || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base md:text-lg text-gray-800 leading-tight mb-1">{item.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500 truncate max-w-xs mb-1">{item.description}</p>
                  {item.selectedColor && (
                    <p className="text-xs text-gray-500">Color: <span className="font-medium text-gray-700">{item.selectedColor}</span></p>
                  )}
                  {item.height && (
                    <p className="text-xs text-gray-500">Size: <span className="font-medium text-gray-700">{item.height}</span></p>
                  )}
                  {/* Mobile Only: Price inside this block for better vertical stacking */}
                  <div className="md:hidden mt-2 font-medium text-pink-700">
                    ${price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Price (Desktop) */}
              <div className="hidden md:block text-center text-gray-900">
                ${price.toFixed(2)}
              </div>

              {/* Quantity Controls - Row on Mobile between Image/Title and Total */}
              <div className="flex justify-between items-center w-full md:w-auto md:justify-center mt-2 md:mt-0">
                <span className="md:hidden text-sm font-medium text-gray-600">{t('quantity')}:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      const newQuantity = item.quantity - 1;
                      if (newQuantity <= 0) {
                        removeFromCart(item.id, item.selectedColor);
                      } else {
                        updateCartItemQuantity(item.id, newQuantity, item.selectedColor);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors font-bold touch-manipulation"
                  >
                    -
                  </button>
                  <span className="font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1, item.selectedColor)}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors font-bold touch-manipulation"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="w-full md:w-auto flex justify-between md:block text-center font-bold text-pink-600 mt-2 md:mt-0 border-t md:border-t-0 pt-2 md:pt-0 border-dashed">
                <span className="md:hidden font-semibold text-gray-600">{t('subtotal')}:</span>
                ${(price * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}

        {/* Cart Summary */}
        <div className="p-6 md:p-8 bg-pink-50 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <Link href="/" className="group flex items-center gap-2 text-pink-600 hover:text-pink-800 font-medium hover:underline order-2 md:order-1">
            <span className="inline-block transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1">←</span>
            {t('continueShopping')}
          </Link>
          <div className="flex flex-col items-center md:items-end w-full md:w-auto order-1 md:order-2">
            <span className="text-lg text-gray-600 mb-2 text-center md:text-right w-full block">{t('subtotal')}</span>
            <p className="text-3xl md:text-4xl font-bold text-pink-700 mb-6 text-center md:text-right w-full">${getTotalPrice().toFixed(2)}</p>
            <button
              onClick={handleCheckout}
              className="w-full md:w-auto bg-pink-600 text-white px-10 py-3 rounded-full font-bold hover:bg-pink-700 transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 flex justify-center items-center"
            >
              {t('checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
