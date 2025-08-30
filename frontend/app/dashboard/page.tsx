// app/dashboard/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect runs when the component mounts and when `loading` or `token` changes.
    // It protects the route from unauthenticated users.
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  // While loading, we can show a spinner or a blank screen to prevent content flicker
  if (loading || !token) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  // Once loading is false and we have a token, we can render the dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-navy-blue p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-soft-beige mb-4">
          Welcome to your Dashboard
        </h1>
        <p className="text-lg text-light-blue mb-6">
          This is your secure area. Here you can upload and manage your encrypted files.
        </p>

        {/* Placeholder for future functionality */}
        <div className="border-2 border-dashed border-light-blue/50 rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-soft-beige">File Uploader Coming Soon</h2>
            <p className="text-light-blue mt-2">Get ready to share files securely!</p>
        </div>

        <div className="mt-8 max-w-xs">
            <Button onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}