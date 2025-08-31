// src/routes/fileRoutes.ts

import express from 'express';
import { 
  // ... other functions
  createShareLink,
  getSharedFileMetadata, // Import new function
  generateDownloadUrl,   // Import new function
  getUserFiles,
  completeUpload,
  generatePresignedUrl,
  deleteFile
} from '../controllers/fileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/shared/:shareId', getSharedFileMetadata);
router.post('/download/:shareId', generateDownloadUrl);

// --- PRIVATE ROUTES ---
router.get('/', protect, getUserFiles);
router.post('/presign-upload', protect, generatePresignedUrl);
router.post('/complete-upload', protect, completeUpload);
router.post('/:fileId/share', protect, createShareLink);
// Add this new route for deleting
router.delete('/:fileId', protect, deleteFile);
export default router;