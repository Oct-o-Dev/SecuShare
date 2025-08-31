// app/download/[shareId]/page.tsx
"use client";

import { useEffect, useState, use } from 'react';
import { Download, KeyRound } from 'lucide-react';
import api from '@/lib/api';


interface FileDetails { originalName: string; fileSize: number; }

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function DownloadPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);
  const [file, setFile] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New states for password handling
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data } = await api.get(`/files/shared/${shareId}`);
        if (data.passwordRequired) {
          setPasswordRequired(true);
        } else {
          setFile(data);
        }
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || 'This link is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    if (shareId) { fetchMetadata(); }
  }, [shareId]);

  const handleDownload = async () => {
    try {
      setError(null);
      const { data } = await api.post(`/files/download/${shareId}`, {
        password: inputPassword, // Send the password
      });
      // Trigger download by redirecting the page to the presigned URL
      window.location.href = data.downloadUrl;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Download failed. Please try again.');
    }
  };

  if (isLoading) { /* ... return loading ... */ }
  
  // Render password form if required
  if (passwordRequired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-blue">
        <div className="w-full max-w-md bg-navy-blue p-8 rounded-xl shadow-lg text-center">
          <KeyRound className="mx-auto text-light-blue" size={48} />
          <h2 className="text-2xl font-bold text-soft-beige mt-4 mb-2">Password Required</h2>
          <p className="text-light-blue mb-6">This file is password protected. Please enter the password to proceed.</p>
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full text-center bg-dark-blue border border-light-blue/50 text-soft-beige px-4 py-2 rounded-lg mb-4"
          />
          <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-light-blue ...">
            Unlock & Download
          </button>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (error || !file) { /* ... return error state ... */ }

  // Render normal download page
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-blue">
      <div className="w-full max-w-md bg-navy-blue p-8 rounded-xl ...">
        {/* ... (File details are the same) */}
        <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-light-blue ...">
          <Download size={20} />
          Download File
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}