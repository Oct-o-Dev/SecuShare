"use strict";
// src/routes/fileRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = require("../controllers/fileController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// --- PUBLIC ROUTES ---
router.get('/shared/:shareId', fileController_1.getSharedFileMetadata);
router.post('/download/:shareId', fileController_1.generateDownloadUrl);
// --- PRIVATE ROUTES ---
router.get('/', authMiddleware_1.protect, fileController_1.getUserFiles);
router.post('/presign-upload', authMiddleware_1.protect, fileController_1.generatePresignedUrl);
router.post('/complete-upload', authMiddleware_1.protect, fileController_1.completeUpload);
router.post('/:fileId/share', authMiddleware_1.protect, fileController_1.createShareLink);
// Add this new route for deleting
router.delete('/:fileId', authMiddleware_1.protect, fileController_1.deleteFile);
exports.default = router;
