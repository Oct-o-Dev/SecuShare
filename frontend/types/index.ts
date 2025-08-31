// frontend/types/index.ts
export interface FileType {
  _id: string;
  originalName: string;
  fileSize: number;
  createdAt: string;
  shareSettings?: {
    isShared: boolean;
    shareId?: string;
    downloadLimit?: number;
  };
}