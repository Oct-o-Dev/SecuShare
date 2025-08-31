"use strict";
// src/controllers/fileController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFiles = exports.deleteFile = exports.completeUpload = exports.createShareLink = exports.generateDownloadUrl = exports.getSharedFileMetadata = exports.generatePresignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const fileModel_1 = __importDefault(require("../models/fileModel"));
const nanoid_1 = require("nanoid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Initialize the S3 Client
// Modify the S3 Client initialization
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT, // Add this line
    forcePathStyle: true, // Add this line
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
const generatePresignedUrl = async (req, res) => {
    try {
        const userId = req.user.id; // Get 'id' from the JWT payload
        const { fileName, fileType, fileSize } = req.body;
        if (!fileName || !fileType || !fileSize) {
            return res.status(400).json({ message: 'Missing file details' });
        }
        // Generate a unique key for the file in S3
        const storageKey = `${userId}/${(0, uuid_1.v4)()}-${fileName}`;
        // Create a new file record in the database with 'pending' status
        const file = await fileModel_1.default.create({
            owner: userId,
            originalName: fileName,
            storageKey: storageKey,
            mimeType: fileType,
            fileSize: fileSize,
            uploadStatus: 'pending',
        });
        // Create the command for a PutObject operation
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: storageKey,
            ContentType: fileType,
            ContentLength: fileSize,
        });
        // Generate the presigned URL (valid for 5 minutes)
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 300 });
        res.status(200).json({
            uploadUrl,
            storageKey, // Send the key back to the client
        });
    }
    catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.generatePresignedUrl = generatePresignedUrl;
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
const getSharedFileMetadata = async (req, res) => {
    try {
        const { shareId } = req.params;
        const file = await fileModel_1.default.findOne({ 'shareSettings.shareId': shareId });
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSharedFileMetadata = getSharedFileMetadata;
// src/controllers/fileController.ts
// src/controllers/fileController.ts
const generateDownloadUrl = async (req, res) => {
    try {
        const { shareId } = req.params;
        const { password } = req.body;
        const file = await fileModel_1.default.findOne({ 'shareSettings.shareId': shareId });
        if (!file || !file.shareSettings?.isShared) {
            return res.status(404).send('File not found or not shared');
        }
        if (file.shareSettings.passwordHash) {
            if (!password) {
                return res.status(401).json({ message: 'Password is required' });
            }
            const isMatch = await bcryptjs_1.default.compare(password, file.shareSettings.passwordHash);
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
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.storageKey,
            ResponseContentDisposition: `attachment; filename="${file.originalName}"`
        });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 60 });
        res.status(200).json({ downloadUrl });
    }
    catch (error) {
        console.error('Error generating download URL:', error);
        res.status(500).send('Server error');
    }
};
exports.generateDownloadUrl = generateDownloadUrl;
// src/controllers/fileController.ts
const createShareLink = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fileId } = req.params;
        const { expiresIn, downloadLimit, password } = req.body;
        const file = await fileModel_1.default.findById(fileId);
        // FIX #1: This block handles the "'file' is possibly 'null'" error.
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        if (file.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to share this file' });
        }
        // --- After these checks, TypeScript knows 'file' is not null ---
        // FIX #2: This block declares and calculates the 'expiresAt' variable.
        let expiresAt = undefined;
        if (expiresIn) {
            const now = new Date();
            if (expiresIn === '1_hour')
                expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
            if (expiresIn === '1_day')
                expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            if (expiresIn === '7_days')
                expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
        // Hash the password if one is provided
        let passwordHash = undefined;
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            passwordHash = await bcryptjs_1.default.hash(password, salt);
        }
        // Update or create the shareSettings
        if (!file.shareSettings?.shareId) {
            file.shareSettings = {
                isShared: true,
                shareId: (0, nanoid_1.nanoid)(10),
                expiresAt: expiresAt,
                downloadLimit: downloadLimit,
                passwordHash: passwordHash,
            };
        }
        else {
            file.shareSettings.isShared = true;
            file.shareSettings.expiresAt = expiresAt;
            file.shareSettings.downloadLimit = downloadLimit;
            file.shareSettings.passwordHash = passwordHash;
        }
        await file.save();
        const shareLink = `${process.env.FRONTEND_URL}/download/${file.shareSettings.shareId}`;
        res.status(200).json({ shareLink });
    }
    catch (error) {
        console.error('Error creating share link:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createShareLink = createShareLink;
const completeUpload = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storageKey } = req.body;
        if (!storageKey) {
            return res.status(400).json({ message: 'Storage key is required' });
        }
        // Explicitly type the `file` variable. This will now work correctly
        // because we updated the IFile interface in the model.
        const file = await fileModel_1.default.findOne({ storageKey });
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
    }
    catch (error) {
        console.error('Error completing upload:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.completeUpload = completeUpload;
const deleteFile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fileId } = req.params;
        const file = await fileModel_1.default.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        // 1. Security Check: Verify the user owns the file
        if (file.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this file' });
        }
        // 2. Delete the file from MinIO/S3 storage
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.storageKey,
        });
        await s3Client.send(deleteCommand);
        // 3. Delete the file record from the database
        await fileModel_1.default.findByIdAndDelete(fileId);
        res.status(200).json({ message: 'File deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteFile = deleteFile;
// src/controllers/fileController.ts
// ... (keep the other functions)
/**
 * @desc    Get all files for the logged-in user
 * @route   GET /api/files
 * @access  Private
 */
const getUserFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const files = await fileModel_1.default.find({ owner: userId }).sort({ createdAt: -1 });
        res.status(200).json(files);
    }
    catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserFiles = getUserFiles;
