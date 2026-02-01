'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateCartItemQuantity, removeFromCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();

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
        <h1 className="text-4xl font-serif font-bold text-pink-700 mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added any flowers yet.</p>
        <Link
          href="/"
          className="bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition-colors shadow-lg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-pink-700 mb-8 text-center">Your Shopping Cart</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
        <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-pink-50 border-b border-pink-100 font-semibold text-pink-800">
          <div className="col-span-3">Product</div>
          <div className="text-center">Price</div>
          <div className="text-center">Quantity</div>
          <div className="text-center">Total</div>
        </div>

        {cart.map((item) => {
          const price = item.discountPrice !== null ? item.discountPrice : item.originalPrice;
          const key = `${item.id}-${item.selectedColor || 'default'}`;

          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-4 p-6 border-b border-gray-100 items-center">
              {/* Product Info */}
              <div className="col-span-3 flex items-center space-x-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500 truncate max-w-xs">{item.description}</p>
                  {item.selectedColor && (
                    <p className="text-xs text-gray-500 mt-1">Color: <span className="font-medium text-gray-700">{item.selectedColor}</span></p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-center text-gray-600 md:text-gray-900">
                <span className="md:hidden font-semibold mr-2">Price:</span>
                ${price.toFixed(2)}
              </div>

              {/* Quantity Controls */}
              <div className="flex justify-center items-center space-x-3">
                <button
                  onClick={() => {
                    const newQuantity = item.quantity - 1;
                    if (newQuantity <= 0) {
                      removeFromCart(item.id, item.selectedColor);
                    } else {
                      updateCartItemQuantity(item.id, newQuantity, item.selectedColor);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors font-bold"
                >
                  -
                </button>
                <span className="font-semibold w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1, item.selectedColor)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors font-bold"
                >
                  +
                </button>
              </div>

              {/* Total */}
              <div className="text-center font-bold text-pink-600">
                <span className="md:hidden font-semibold mr-2 text-gray-600">Total:</span>
                ${(price * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}

        {/* Cart Summary */}
        <div className="p-8 bg-pink-50 flex flex-col md:flex-row justify-between items-center md:items-end">
          <Link href="/" className="text-pink-600 hover:text-pink-800 font-medium mb-4 md:mb-0 hover:underline">
            ← Continue Shopping
          </Link>
          <div className="text-right">
            <p className="text-lg text-gray-600 mb-2">Subtotal</p>
            <p className="text-4xl font-bold text-pink-700 mb-6">${getTotalPrice().toFixed(2)}</p>
            <button
              onClick={handleCheckout}
              className="bg-pink-600 text-white px-10 py-3 rounded-full font-bold hover:bg-pink-700 transition-all shadow-lg transform hover:-translate-y-1"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
