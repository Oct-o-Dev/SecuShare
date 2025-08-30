// src/routes/fileRoutes.ts

import express from 'express';
import { generatePresignedUrl, completeUpload } from '../controllers/fileController';
import { protect } from '../middleware/authMiddleware'; // Assuming your middleware is named this

const router = express.Router();

// @route   POST /api/files/presign-upload
// @desc    Get a secure URL to upload a file
// @access  Private
router.post('/presign-upload', protect, generatePresignedUrl);


// @route   POST /api/files/complete-upload
// @desc    Confirm a file upload is complete
// @access  Private
router.post('/complete-upload', protect, completeUpload);


export default router;