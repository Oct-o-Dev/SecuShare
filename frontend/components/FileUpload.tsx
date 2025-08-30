// components/FileUpload.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';
import { UploadCloud, File as FileIcon, CheckCircle, AlertCircle } from 'lucide-react';

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setMessage('Preparing to upload...');

      // 1. Get the presigned URL from our backend
      const { data } = await api.post('/files/presign-upload', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      const { uploadUrl, storageKey } = data;
      setMessage('Uploading...');

      // 2. Upload the file directly to S3 (MinIO) using the presigned URL
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1));
          setUploadProgress(percentCompleted);
        },
      });

      // 3. Confirm the upload with our backend
      setMessage('Finalizing...');
      await api.post('/files/complete-upload', { storageKey });

      setUploadStatus('success');
      setMessage('File uploaded successfully!');
      setFile(null);

    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setMessage('Upload failed. Please try again.');
    }
  };

  return (
    <div className="bg-navy-blue p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-soft-beige mb-4">Upload a File</h2>
      
      <div className="border-2 border-dashed border-light-blue/50 rounded-lg p-8 text-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <UploadCloud className="text-light-blue" size={48} />
          <p className="mt-2 text-soft-beige">
            {file ? 'File selected. ' : 'Drag & drop or '}
            <span className="font-semibold text-light-blue">
              {file ? file.name : 'click to browse'}
            </span>
          </p>
        </label>
      </div>

      {uploadStatus === 'uploading' && (
        <div className="w-full bg-dark-blue rounded-full h-2.5 mt-4">
          <div
            className="bg-light-blue h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {message && (
        <div className="mt-4 text-center flex items-center justify-center gap-2">
            {uploadStatus === 'success' && <CheckCircle className="text-green-400" size={20} />}
            {uploadStatus === 'error' && <AlertCircle className="text-red-400" size={20} />}
            <p>{message}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploadStatus === 'uploading'}
        className="w-full mt-6 bg-light-blue text-dark-blue font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-soft-beige disabled:bg-light-blue/50 disabled:cursor-not-allowed"
      >
        {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
};