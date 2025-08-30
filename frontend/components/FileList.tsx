// components/FileList.tsx
"use client";

import { useState } from 'react';
import { File as FileIcon, Share2, Trash2 } from 'lucide-react';
import { ShareModal } from './ShareModal';

// A helper function to format file sizes
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const FileList = ({ files }: { files: any[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  const handleShareClick = (file: any) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  if (files.length === 0) {
    return (
      <div className="bg-navy-blue p-8 rounded-xl text-center">
        <p className="text-light-blue">You haven't uploaded any files yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-navy-blue p-6 rounded-xl space-y-4">
        {files.map((file) => (
          <div key={file._id} className="flex items-center justify-between bg-dark-blue p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <FileIcon className="text-light-blue" size={24} />
              <div>
                <p className="font-semibold text-soft-beige">{file.originalName}</p>
                <p className="text-sm text-light-blue/70">
                  {formatBytes(file.fileSize)} ・ {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleShareClick(file)}
                className="text-light-blue hover:text-white transition-colors p-2 rounded-full hover:bg-navy-blue"
              >
                <Share2 size={18} />
              </button>
              <button className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-navy-blue">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedFile && (
        <ShareModal file={selectedFile} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};