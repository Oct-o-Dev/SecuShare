// src/routes/fileRoutes.ts

import express from 'express';
import { 
  generatePresignedUrl, 
  completeUpload, 
  getUserFiles, 
  createShareLink // Import the new function
} from '../controllers/fileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getUserFiles);
router.post('/presign-upload', protect, generatePresignedUrl);
router.post('/complete-upload', protect, completeUpload);

// Add this new route for sharing
router.post('/:fileId/share', protect, createShareLink);

export default router;