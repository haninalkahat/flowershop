'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface WishlistContextType {
    wishlist: string[]; // List of Product IDs
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<string[]>([]);

    useEffect(() => {
        if (!user) {
            setWishlist([]);
            return;
        }

        // Fetch wishlist from API
        fetch('/api/wishlist')
            .then(res => res.json())
            .then(data => {
                if (data.items) {
                    setWishlist(data.items.map((item: any) => item.productId));
                }
            })
            .catch(err => console.error('Failed to load wishlist', err));
    }, [user]);

    const addToWishlist = async (productId: string) => {
        if (!user) {
            toast.error('Please login to use wishlist');
            return;
        }
        // Optimistic update
        if (wishlist.includes(productId)) return;

        setWishlist(prev => [...prev, productId]);
        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });
            if (!res.ok) throw new Error('Failed');
            toast.success('Added to favorites');
        } catch (err) {
            setWishlist(prev => prev.filter(id => id !== productId));
            toast.error('Failed to add to favorites');
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (!user) return;
        setWishlist(prev => prev.filter(id => id !== productId));
        try {
            const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            toast.success('Removed from favorites');
        } catch (err) {
            setWishlist(prev => [...prev, productId]);
            toast.error('Failed to remove from favorites');
        }
    };

    const isInWishlist = (productId: string) => wishlist.includes(productId);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
};
