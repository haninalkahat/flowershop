'use client';

import Link from 'next/link';
import { Flower, ShoppingCart, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-pink-50 p-2 rounded-full group-hover:bg-pink-100 transition-colors duration-300">
            <Flower className="w-6 h-6 text-pink-600" />
          </div>
          <span className="font-serif text-2xl font-bold text-gray-900 tracking-wide">Flowershop</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            Home
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            About
          </Link>
          <Link href="/shop" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            Shop
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-pink-600 font-medium transition-colors duration-200">
            Contact
          </Link>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in">
                  <Link
                    href="/orders"
                    onClick={() => setShowUserDropdown(false)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setShowUserDropdown(false)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  >
                    Admin Panel
                  </Link>
                  <button
                    onClick={() => { logout(); setShowUserDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2.5 rounded-full bg-pink-600 text-white font-medium hover:bg-pink-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
              Sign In / Up
            </Link>
          )}

          <div className="border-l border-gray-200 pl-6 ml-2 flex items-center space-x-4">
            <Link href="/cart" className="relative text-gray-500 hover:text-pink-600 transition-colors duration-200">
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
        <div className="md:hidden">
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
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-3 shadow-lg absolute w-full left-0 animate-fade-in-up">
          <Link href="/" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/about" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>About</Link>
          <Link href="/contact" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>Contact</Link>
          <Link href="/cart" className="block text-gray-600 hover:text-pink-600 py-2" onClick={() => setIsOpen(false)}>
            Cart ({getTotalItems()})
          </Link>
          {user ? (
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
              <span className="block text-gray-700 font-medium px-2">{user.fullName}</span>
              <Link href="/orders" className="block text-gray-600 hover:text-pink-600 py-2 px-2" onClick={() => setIsOpen(false)}>My Orders</Link>
              <Link href="/admin/orders" className="block text-gray-600 hover:text-pink-600 py-2 px-2" onClick={() => setIsOpen(false)}>Admin Panel</Link>
              <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left text-pink-600 font-medium py-2 px-2 hover:bg-pink-50 rounded">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="block text-center mt-4 w-full py-2.5 rounded-full bg-pink-600 text-white font-medium hover:bg-pink-700" onClick={() => setIsOpen(false)}>
              Sign In / Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
