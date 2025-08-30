// src/models/fileModel.ts

import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./userModel"; // Import the IUser interface

// Interface for the File document
export interface IFile extends Document {
  owner: Schema.Types.ObjectId | IUser; // Link to the User model
  originalName: string;
  storageKey: string; // The unique key in S3 or other storage
  fileSize: number; // Size in bytes
  mimeType: string;
  uploadStatus: 'pending' | 'completed' | 'failed';
  
  // Share settings (will be used later)
  shareSettings?: {
    isShared: boolean;
    shareId?: string; // A short, unique ID for the public link
    expiresAt?: Date;
    downloadLimit?: number;
  };
  
  downloadCount: number;
}

const fileSchema = new Schema<IFile>(
  {
    owner: {
      type: Schema.Types.ObjectId,
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
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const File = mongoose.model<IFile>("File", fileSchema);

export default File;