// components/ShareModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { FileType } from '@/types';
import api from '@/lib/api';

export const ShareModal = ({ file, onClose }: { file: FileType; onClose: () => void; }) => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expiresIn, setExpiresIn] = useState('never');
  const [isOneTimeDownload, setIsOneTimeDownload] = useState(true);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (file.shareSettings?.shareId) {
      const existingLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/download/${file.shareSettings.shareId}`;
      setShareLink(existingLink);
    }
  }, [file]);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/files/${file._id}/share`, { 
        expiresIn: expiresIn === 'never' ? null : expiresIn,
        downloadLimit: isOneTimeDownload ? 1 : null, // ✅ SEND THE DOWNLOAD LIMIT
        password: password || null, // ✅ SEND THE PASSWORD
      });
      setShareLink(data.shareLink);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } 
    finally { setIsLoading(false); }
  };

  
  
  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-navy-blue p-8 rounded-xl shadow-lg w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-light-blue hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-soft-beige mb-4">Share File</h2>
        <p className="text-light-blue mb-6 truncate">{file.originalName}</p>
        
        {shareLink ? (
          <div className="space-y-4">
            <p className="text-sm text-light-blue">Anyone with this link can view the file.</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={shareLink}
                className="w-full bg-dark-blue border border-light-blue/50 text-soft-beige px-4 py-2 rounded-lg"
              />
              <button 
                onClick={copyToClipboard} 
                className="bg-light-blue text-dark-blue p-2 rounded-lg shrink-0 hover:bg-opacity-90 transition-all"
              >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-light-blue mb-2">
                Link Expiration
              </label>
              <select
                id="expiry"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full bg-dark-blue border border-light-blue/50 text-soft-beige px-4 py-2 rounded-lg"
              >
                <option value="never">Never</option>
                <option value="1_hour">1 Hour</option>
                <option value="1_day">1 Day</option>
                <option value="7_days">7 Days</option>
              </select>
            </div>
            {/* password section */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-blue mb-2">
                Password (optional)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Protect your link with a password"
                className="w-full bg-dark-blue border border-light-blue/50 text-soft-beige px-4 py-2 rounded-lg"
              />
            </div>
            {/* checkbox for the one time */}
            <div className="flex items-center gap-2">
              <input
                id="one-time"
                type="checkbox"
                checked={isOneTimeDownload}
                onChange={(e) => setIsOneTimeDownload(e.target.checked)}
                className="h-4 w-4 rounded bg-dark-blue border-light-blue/50 text-light-blue focus:ring-light-blue"
              />
              <label htmlFor="one-time" className="text-sm text-light-blue">
                One-time download (link will expire after first use)
              </label>
            </div>
            <button
              onClick={handleGenerateLink}
              disabled={isLoading}
              className="w-full bg-light-blue text-dark-blue font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-light-blue/50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Secure Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};