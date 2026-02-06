'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This is a placeholder for actual authentication logic.
    // In a real application, you would check for a valid session token, etc.
    const token = localStorage.getItem('admin_token'); // Example: check for a token
    if (token === 'my-secret-admin-token') { // Simple token check
      router.push('/admin/products'); // Redirect to products management page
      setIsAuthenticated(true);
    } else {
      // Redirect to a login page or show an access denied message
      router.push('/login'); // Assuming a login page exists
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-rosebud-800">Access Denied. Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-rosebud-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-forest mb-8">Admin Dashboard</h1>
        <p className="text-lg text-forest-700">Welcome, Admin! Here you can manage your flower products.</p>
        {/* Admin content will go here */}
      </div>
    </div>
  );
}
