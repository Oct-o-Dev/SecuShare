// components/FileList.tsx
"use client";

import { useState } from 'react';
import { File as FileIcon, Share2, Trash2 } from 'lucide-react';
import { ShareModal } from './ShareModal';
import { ConfirmationModal } from './ConfirmationModal'; // Import the new modal
import { FileType } from '@/types';
import api from '@/lib/api';

// A helper function to format file sizes
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const FileList = ({ files, onFileDeleted }: { files: any[], onFileDeleted: () => void }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  const handleShareClick = (file: FileType) => {
    setSelectedFile(file);
    setIsShareModalOpen(true);
  };
  
  const handleDeleteClick = (file: FileType) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFile) return;
    try {
      await api.delete(`/files/${selectedFile._id}`);
      onFileDeleted(); // This calls `fetchFiles` in the parent to refresh the list
      setIsDeleteModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  if (files.length === 0) {
    // ... (return "You haven't uploaded any files yet.")
  }


  return (
    <>
      <div className="bg-navy-blue p-6 rounded-xl space-y-4">
        {files.map((file) => (
          <div key={file._id} className="flex items-center justify-between bg-dark-blue p-4 rounded-lg">
            {/* ... (file details are the same) */}
            <div className="flex items-center gap-4">
              <FileIcon className="text-light-blue" size={24} />
              <div>
                <p className="font-semibold text-soft-beige">{file.originalName}</p>
                <div className="flex items-center gap-2 text-sm text-light-blue/70">
                  <span>{formatBytes(file.fileSize)}</span>
                  <span>・</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  {/* ✅ ADD THIS BADGE */}
                  {file.shareSettings?.isShared && (
                    <>
                      <span>・</span>
                      <span className="text-green-400 font-semibold">Shared</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => handleShareClick(file)} className="...">
                <Share2 size={18} />
              </button>
              <button 
                onClick={() => handleDeleteClick(file)} // Add this onClick handler
                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-navy-blue"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isShareModalOpen && selectedFile && (
        <ShareModal file={selectedFile} onClose={() => setIsShareModalOpen(false)} />
      )}

      {isDeleteModalOpen && selectedFile && (
        <ConfirmationModal
          title="Delete File"
          message={`Are you sure you want to permanently delete "${selectedFile.originalName}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          confirmText="Yes, Delete"
        />
      )}
    </>
  );
};