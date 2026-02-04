'use client';

import { useState } from 'react';
import type { Product } from '@prisma/client';

interface ProductFormProps {
  onSubmit: (product: Product) => void;
}

export default function ProductForm({ onSubmit }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      id: String(Date.now()), // Placeholder for UUID
      name,
      description,
      images: [imageUrl],
      originalPrice: originalPrice as any, // Cast to any to bypass Decimal type check for mock
      discountPrice: (discountPrice || null) as any,
      flowerType: 'Mixed', // Default value
      stemLength: null,
      origin: 'Holland',
      freshness: 'Guaranteed 7 Days',
      height: null,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;
    onSubmit(newProduct);
    // Clear form
    setName('');
    setDescription('');
    setImageUrl('');
    setOriginalPrice(0);
    setDiscountPrice(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-rosebud-500 focus:border-rosebud-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-rosebud-500 focus:border-rosebud-500"
        ></textarea>
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-rosebud-500 focus:border-rosebud-500"
          required
        />
      </div>
      <div>
        <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">Original Price</label>
        <input
          type="number"
          id="originalPrice"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(parseFloat(e.target.value))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-rosebud-500 focus:border-rosebud-500"
          required
        />
      </div>
      <div>
        <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">Discount Price (Optional)</label>
        <input
          type="number"
          id="discountPrice"
          value={discountPrice || ''}
          onChange={(e) => setDiscountPrice(parseFloat(e.target.value) || undefined)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-rosebud-500 focus:border-rosebud-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-rosebud-500 hover:bg-rosebud-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
      >
        Add Product
      </button>
    </form>
  );
}
