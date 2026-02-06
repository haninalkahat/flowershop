import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import AdminNav from '@/components/AdminNav';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await isAdmin();
    const t = await getTranslations('Admin');

    if (!admin) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="md:hidden">
                    <AdminNav />
                </div>
                <main className="flex-1 p-4 md:p-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
