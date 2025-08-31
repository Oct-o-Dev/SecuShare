// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList'; // Import the new component
import api from '@/lib/api';

export default function DashboardPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState([]);

  // Function to fetch files
  const fetchFiles = async () => {
    try {
      const { data } = await api.get('/files');
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
    if (token) {
      fetchFiles(); // Fetch files when the component mounts and user is authenticated
    }
  }, [token, loading, router]);
  
  if (loading || !token) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div>
        
        <h1 className="text-4xl font-bold text-soft-beige mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-light-blue">
          Securely upload and manage your files.
        </p>
      </div>

      <FileUpload onUploadComplete={fetchFiles} />

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-soft-beige mb-4">My Files 📁</h2>
        {/* Pass the fetchFiles function as the onFileDeleted prop */}
        <FileList files={files} onFileDeleted={fetchFiles} />
      </div>
    </div>
  );
}