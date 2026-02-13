
'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Plus, Edit, Trash, Star } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function AdminProductsPage() {
  const t = useTranslations('Admin');
  const tTypes = useTranslations('FlowerTypes');
  const locale = useLocale();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product: any) => {
    if (!product) return 'Unknown Product';
    if (locale === 'tr') return product.name_tr || product.name_en || product.name;
    if (locale === 'ar') return product.name_ar || product.name_en || product.name;
    return product.name_en || product.name;
  };

  if (loading) return <div>{t('loadingProducts')}</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">{t('productManagement')}</h1>
        <Link
          href="/admin/products/new"
          className="w-full md:w-auto bg-pink-600 text-white px-4 py-3 md:py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-pink-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          {t('addNewProduct')}
        </Link>
      </div>

      {/* Mobile Grid */}
      <div className="md:hidden grid grid-cols-1 gap-4 mb-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">{getProductName(product)}</h3>
              <p className="text-gray-500 text-sm mt-1">{/* @ts-ignore */}{product.flowerType ? tTypes(product.flowerType.toLowerCase()) : product.flowerType}</p>
              <div className="mt-2 font-medium text-pink-600">${Number(product.originalPrice).toFixed(2)}</div>
            </div>
            <Link href={`/admin/products/${product.id}/edit`} className="p-2 bg-gray-50 rounded-lg text-blue-600 hover:bg-blue-50">
              <Edit size={20} />
            </Link>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 text-left rtl:text-right">{t('productsTable.name')}</th>
              <th className="p-4 text-left rtl:text-right">{t('productsTable.price')}</th>
              <th className="p-4 text-left rtl:text-right">{t('productsTable.type')}</th>
              <th className="p-4 text-right rtl:text-left">{t('productsTable.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900 text-left rtl:text-right">{getProductName(product)}</td>
                <td className="p-4 text-gray-600 text-left rtl:text-right">${Number(product.originalPrice).toFixed(2)}</td>
                <td className="p-4 text-gray-500 text-left rtl:text-right">
                  {/* @ts-ignore */}
                  {product.flowerType ? tTypes(product.flowerType.toLowerCase()) : product.flowerType}
                </td>
                <td className="p-4 text-right rtl:text-left">
                  {/* Edit - Placeholder as we focus on Create first */}
                  <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-800 mx-2 inline-block">
                    <Edit size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  {t('noProducts')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
