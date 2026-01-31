'use client';

import { useState, useEffect } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import ProductList from '@/components/admin/ProductList';
import { Product } from '../../generated/prisma';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    // In a real application, you would fetch from your API route
    // For now, we'll use a placeholder or local storage
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(storedProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSubmit = (newProduct: Product) => {
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-forest mb-8">Manage Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-rosebud-700 mb-6">Add New Product</h2>
          <ProductForm onSubmit={handleProductSubmit} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-rosebud-700 mb-6">Existing Products</h2>
          <ProductList products={products} />
        </div>
      </div>
    </div>
  );
}
