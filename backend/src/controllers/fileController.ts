// src/controllers/fileController.ts

import { Request, Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import File, { IFile } from '../models/fileModel';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

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


export const getSharedFileMetadata = async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    const file = await File.findOne<IFile>({ 'shareSettings.shareId': shareId });

    if (!file || !file.shareSettings?.isShared) {
      return res.status(404).json({ message: 'File not found or not shared' });
    }

    if (file.shareSettings.passwordHash) {
      // Don't send file details, just indicate password is required
      return res.status(200).json({ passwordRequired: true });
    }

    // ✅ ADD THIS EXPIRATION CHECK
    if (file.shareSettings.expiresAt && new Date() > file.shareSettings.expiresAt) {
      return res.status(410).json({ message: 'This link has expired.' }); // 410 Gone
    }

    res.status(200).json({
      originalName: file.originalName,
      fileSize: file.fileSize,
      passwordRequired: false,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// src/controllers/fileController.ts

// src/controllers/fileController.ts

export const generateDownloadUrl = async (req: Request, res: Response) => {
    try {
        const { shareId } = req.params;
        const { password } = req.body;
        const file = await File.findOne<IFile>({ 'shareSettings.shareId': shareId });

        if (!file || !file.shareSettings?.isShared) {
            return res.status(404).send('File not found or not shared');
        }

        if (file.shareSettings.passwordHash) {
            if (!password) {
                return res.status(401).json({ message: 'Password is required' });
            }
            const isMatch = await bcrypt.compare(password, file.shareSettings.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        }

        if (file.shareSettings.expiresAt && new Date() > file.shareSettings.expiresAt) {
            return res.status(410).send('This link has expired.');
        }
        
        // ✅ ADD THIS DOWNLOAD LIMIT CHECK
        if (file.shareSettings.downloadLimit && file.downloadCount >= file.shareSettings.downloadLimit) {
            return res.status(410).send('This link has reached its download limit.');
        }
        
        // Increment download count only if all checks pass
        file.downloadCount += 1;
        await file.save();
        
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.storageKey,
            ResponseContentDisposition: `attachment; filename="${file.originalName}"`
        });

        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        res.status(200).json({ downloadUrl });

    } catch (error) {
        console.error('Error generating download URL:', error);
        res.status(500).send('Server error');
    }
};



// src/controllers/fileController.ts

export const createShareLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fileId } = req.params;
    const { expiresIn, downloadLimit, password } = req.body;

    const file = await File.findById<IFile>(fileId);

    // FIX #1: This block handles the "'file' is possibly 'null'" error.
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to share this file' });
    }

    // --- After these checks, TypeScript knows 'file' is not null ---

    // FIX #2: This block declares and calculates the 'expiresAt' variable.
    let expiresAt: Date | undefined = undefined;
    if (expiresIn) {
      const now = new Date();
      if (expiresIn === '1_hour') expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
      if (expiresIn === '1_day') expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (expiresIn === '7_days') expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // Hash the password if one is provided
    let passwordHash: string | undefined = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }
    
    // Update or create the shareSettings
    if (!file.shareSettings?.shareId) {
      file.shareSettings = {
        isShared: true,
        shareId: nanoid(10),
        expiresAt: expiresAt,
        downloadLimit: downloadLimit,
        passwordHash: passwordHash,
      };
    } else {
      file.shareSettings.isShared = true;
      file.shareSettings.expiresAt = expiresAt;
      file.shareSettings.downloadLimit = downloadLimit;
      file.shareSettings.passwordHash = passwordHash;
    }

    await file.save();
    
    const shareLink = `${process.env.FRONTEND_URL}/download/${file.shareSettings.shareId}`;
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

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // 1. Security Check: Verify the user owns the file
    if (file.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // 2. Delete the file from MinIO/S3 storage
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.storageKey,
    });
    await s3Client.send(deleteCommand);

    // 3. Delete the file record from the database
    await File.findByIdAndDelete(fileId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
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

