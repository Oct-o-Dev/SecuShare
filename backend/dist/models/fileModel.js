"use strict";
// src/models/fileModel.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const fileSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // This creates the reference to the User collection
    },
    originalName: {
        type: String,
        required: true,
    },
    storageKey: {
        type: String,
        required: true,
        unique: true, // Each file in storage must have a unique key
    },
    fileSize: {
        type: Number,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    uploadStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    shareSettings: {
        isShared: { type: Boolean, default: false },
        shareId: { type: String, unique: true, sparse: true }, // sparse allows multiple docs without this field
        expiresAt: { type: Date },
        downloadLimit: { type: Number },
        passwordHash: { type: String },
    },
    downloadCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
const File = mongoose_1.default.model("File", fileSchema);
exports.default = File;
