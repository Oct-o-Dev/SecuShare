// src/controllers/fileController.ts

import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import File from '../models/fileModel';

// Initialize the S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * @desc    Generate a presigned URL to upload a file to S3
 * @route   POST /api/files/presign-upload
 * @access  Private
 */
export const generatePresignedUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id; // From 'protect' middleware
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({ message: 'Missing file details' });
    }

    // Generate a unique key for the file in S3
    const storageKey = `${userId}/${uuidv4()}-${fileName}`;

    // Create a new file record in the database with 'pending' status
    const file = await File.create({
      owner: userId,
      originalName: fileName,
      storageKey: storageKey,
      mimeType: fileType,
      fileSize: fileSize,
      uploadStatus: 'pending',
    });

    // Create the command for a PutObject operation
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: storageKey,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    // Generate the presigned URL (valid for 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    res.status(200).json({
      uploadUrl,
      storageKey, // Send the key back to the client
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * @desc    Confirm file upload is complete and update its status
 * @route   POST /api/files/complete-upload
 * @access  Private
 */
export const completeUpload = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { storageKey } = req.body;

        if (!storageKey) {
            return res.status(400).json({ message: 'Storage key is required' });
        }

        const file = await File.findOne({ storageKey });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Security check: ensure the user completing the upload is the owner
        if (String(file.owner) !== String(userId)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Update the file status to 'completed'
        file.uploadStatus = 'completed';
        await file.save();

        res.status(200).json({ message: 'File upload confirmed successfully', file });

    } catch (error) {
        console.error('Error completing upload:', error);
        res.status(500).json({ message: 'Server error' });
    }
};