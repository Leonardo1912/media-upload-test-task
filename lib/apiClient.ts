import type {
  MediaFile,
  PresignUploadResponse,
  MultipartInitResponse,
  MultipartCompletePart,
} from "./mediaTypes";

export async function listMedia(): Promise<MediaFile[]> {
  const res = await fetch("/api/media/list");
  if (!res.ok) throw new Error("Failed to load media");
  return res.json();
}

export async function deleteMedia(key: string): Promise<void> {
  const res = await fetch(`/api/media/delete?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete");
}

export async function presignUpload(input: {
  fileName: string;
  fileType: string;
  fileSize: number;
}): Promise<PresignUploadResponse> {
  const res = await fetch("/api/media/presign", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Failed to presign");
  }
  return res.json();
}

export async function initMultipart(input: {
  fileName: string;
  fileType: string;
}): Promise<MultipartInitResponse> {
  const res = await fetch("/api/media/multipart/init", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Failed to init multipart");
  }
  return res.json();
}

export async function signMultipartPart(input: {
  key: string;
  uploadId: string;
  partNumber: number;
}): Promise<{ url: string }> {
  const res = await fetch("/api/media/multipart/sign-part", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Failed to sign part");
  }
  return res.json();
}

export async function completeMultipart(input: {
  key: string;
  uploadId: string;
  parts: MultipartCompletePart[];
}): Promise<void> {
  const res = await fetch("/api/media/multipart/complete", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Failed to complete multipart");
  }
}
