// components/ShareModal.tsx
"use client";

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import api from '@/lib/api';

export const ShareModal = ({ file, onClose }: { file: any; onClose: () => void; }) => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/files/${file._id}/share`);
      setShareLink(data.shareLink);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
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
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareLink}
              className="w-full bg-dark-blue border border-light-blue/50 text-soft-beige px-4 py-2 rounded-lg"
            />
            <button 
              onClick={copyToClipboard} 
              className="bg-light-blue text-dark-blue p-2 rounded-lg shrink-0"
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateLink}
            disabled={isLoading}
            className="w-full bg-light-blue text-dark-blue font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-light-blue/50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Secure Link'}
          </button>
        )}
      </div>
    </div>
  );
};