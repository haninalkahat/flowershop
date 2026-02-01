
import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-white shadow-md z-10 hidden md:block">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-serif text-pink-700 font-bold">Admin Panel</h2>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/admin/orders" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-700 font-medium transition-colors">
                        Orders
                    </Link>
                    <Link href="/admin/products" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-700 font-medium transition-colors">
                        Products
                    </Link>
                    <Link href="/" className="block px-4 py-3 rounded-lg text-gray-500 hover:text-gray-700 mt-8 border-t">
                        ← Back to Shop
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
