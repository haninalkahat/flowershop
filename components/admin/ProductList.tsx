'use client';

import Image from 'next/image';
import { Product } from '@prisma/client';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="space-y-6">
      {products.length === 0 ? (
        <p className="text-gray-600">No products added yet.</p>
      ) : (
        products.map((product) => (
          <div key={product.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg shadow-sm">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={80}
              height={80}
              className="rounded-md object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-forest">{product.name}</h3>
              <p className="text-gray-700 text-sm">{product.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-rosebud-600 font-bold">${product.originalPrice.toFixed(2)}</span>
                {product.discountPrice && (
                  <span className="text-gray-500 line-through text-sm">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
            {/* Add edit/delete buttons here */}
          </div>
        ))
      )}
    </div>
  );
}
