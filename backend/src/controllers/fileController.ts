// src/controllers/fileController.ts

import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import File, { IFile } from '../models/fileModel';
import { nanoid } from 'nanoid';

// Initialize the S3 Client
// Modify the S3 Client initialization
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT, // Add this line
  forcePathStyle: true, // Add this line
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// const s3Client = new S3Client({
//     region: 'us-east-1',
//     endpoint: 'http://localhost:9000',
//     forcePathStyle: true,
//     credentials: {
//         accessKeyId: 'minioadmin',
//         secretAccessKey: 'minioadmin',
//     },
// });

/**
 * @desc    Generate a presigned URL to upload a file to S3
 * @route   POST /api/files/presign-upload
 * @access  Private
 */
export const generatePresignedUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Get 'id' from the JWT payload
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
// The corrected completeUpload function

// src/controllers/fileController.ts

// ... (keep the top of your file the same)

// src/controllers/fileController.ts

// ... (keep the generatePresignedUrl function as is)

export const createShareLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Security check: Ensure the user owns the file they are trying to share
    if (file.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to share this file' });
    }

    // Generate a new unique share ID if it doesn't exist
    if (!file.shareSettings?.shareId) {
      file.shareSettings = {
        isShared: true,
        shareId: nanoid(10), // Generates a 10-character ID
      };
      await file.save();
    }

    // Construct the full shareable link
    const shareLink = `${req.protocol}://${req.get('host')}/download/${file.shareSettings.shareId}`;

    res.status(200).json({ shareLink });

  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const completeUpload = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { storageKey } = req.body;

        if (!storageKey) {
            return res.status(400).json({ message: 'Storage key is required' });
        }

        // Explicitly type the `file` variable. This will now work correctly
        // because we updated the IFile interface in the model.
        const file: IFile | null = await File.findOne({ storageKey });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Security check: TypeScript now understands `file.owner`
        if (file.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        file.uploadStatus = 'completed';
        await file.save();

        res.status(200).json({ message: 'File upload confirmed successfully', file });

    } catch (error) {
        console.error('Error completing upload:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// src/controllers/fileController.ts

// ... (keep the other functions)

/**
 * @desc    Get all files for the logged-in user
 * @route   GET /api/files
 * @access  Private
 */
export const getUserFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const files = await File.find({ owner: userId }).sort({ createdAt: -1 });

    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching user files:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

