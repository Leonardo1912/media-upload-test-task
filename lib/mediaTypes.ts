export type MediaFile = {
  key: string;
  url: string;
  size: number;
  lastModified?: string;
};

export type PresignUploadResponse = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
};

export type MultipartInitResponse = {
  key: string;
  uploadId: string;
  publicUrl: string;
};

export type MultipartSignPartResponse = {
  url: string;
};

export type MultipartCompletePart = {
  partNumber: number;
  etag: string;
};

export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

export const MULTIPART_THRESHOLD_BYTES = 50 * 1024 * 1024;

export const MAX_FILES_PER_BATCH = 5;

export type UploadStatus = "idle" | "uploading" | "completed" | "error";

export type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number; // 0–100
  status: UploadStatus;
  error?: string;
  isMultipart: boolean;

  key?: string;
  publicUrl?: string;
};
