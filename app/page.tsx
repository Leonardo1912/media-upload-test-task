"use client";

import React, { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { UploadArea } from "@/app/components/UploadArea";
import { UploadList } from "@/app/components/UploadList";
import { MediaGrid } from "@/app/components/MediaGrid";

import {
  completeMultipart,
  deleteMedia,
  initMultipart,
  listMedia,
  presignUpload,
  signMultipartPart,
} from "@/lib/apiClient";

import {
  MAX_FILE_SIZE_BYTES,
  MediaFile,
  MULTIPART_THRESHOLD_BYTES,
  UploadItem,
} from "@/lib/mediaTypes";

const ENABLE_MULTIPART_CLIENT =
  process.env.NEXT_PUBLIC_ENABLE_MULTIPART === "true";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunk

export default function HomePage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingList(true);
        const files = await listMedia();
        setMedia(files);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingList(false);
      }
    })();
  }, []);

  const patchUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const uploadSimple = useCallback(
    async (item: UploadItem) => {
      try {
        patchUpload(item.id, { status: "uploading", progress: 0 });

        const presign = await presignUpload({
          fileName: item.file.name,
          fileType: item.file.type,
          fileSize: item.file.size,
        });

        await axios
          .put(presign.uploadUrl, item.file, {
            headers: {
              "Content-Type": item.file.type,
            },
            onUploadProgress: (evt) => {
              if (!evt.total) return;
              const percent = (evt.loaded / evt.total) * 100;
              patchUpload(item.id, { progress: percent });
            },
          })
          .catch((e) => console.error(e));

        patchUpload(item.id, {
          status: "completed",
          progress: 100,
          key: presign.key,
          publicUrl: presign.publicUrl,
        });

        setMedia((prev) => [
          { key: presign.key, url: presign.publicUrl, size: item.file.size },
          ...prev,
        ]);
      } catch (error: any) {
        console.error("simple upload error", error);
        patchUpload(item.id, {
          status: "error",
          error: error?.message ?? "Upload failed",
        });
      }
    },
    [patchUpload],
  );

  const uploadMultipart = useCallback(
    async (item: UploadItem) => {
      if (!ENABLE_MULTIPART_CLIENT) {
        patchUpload(item.id, {
          status: "error",
          error: "Multipart upload is disabled on client",
        });
        return;
      }

      try {
        patchUpload(item.id, { status: "uploading", progress: 0 });

        const init = await initMultipart({
          fileName: item.file.name,
          fileType: item.file.type,
        });

        const fileSize = item.file.size;
        const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
        let uploadedBytes = 0;

        const parts: { partNumber: number; etag: string }[] = [];

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          const start = (partNumber - 1) * CHUNK_SIZE;
          const end = Math.min(partNumber * CHUNK_SIZE, fileSize);
          const chunk = item.file.slice(start, end);

          const { url } = await signMultipartPart({
            key: init.key,
            uploadId: init.uploadId,
            partNumber,
          });

          const response = await axios.put(url, chunk, {
            onUploadProgress: (evt) => {
              if (!evt.total) return;
              const currentChunkProgress = evt.loaded / chunk.size;
              const bytesFromCompletedParts = (partNumber - 1) * CHUNK_SIZE;
              const totalLoaded =
                bytesFromCompletedParts + currentChunkProgress * chunk.size;
              const percent = (totalLoaded / fileSize) * 100;
              patchUpload(item.id, { progress: percent });
            },
          });

          const etag = response.headers.etag || response.headers.ETag;
          if (!etag) {
            throw new Error("Missing ETag from part upload response");
          }

          uploadedBytes += chunk.size;

          parts.push({
            partNumber,
            etag: etag.replace(/"/g, ""),
          });
        }

        await completeMultipart({
          key: init.key,
          uploadId: init.uploadId,
          parts,
        });

        patchUpload(item.id, {
          status: "completed",
          progress: 100,
          key: init.key,
          publicUrl: init.publicUrl,
        });

        setMedia((prev) => [
          { key: init.key, url: init.publicUrl, size: item.file.size },
          ...prev,
        ]);
      } catch (error: any) {
        console.error("multipart upload error", error);
        patchUpload(item.id, {
          status: "error",
          error: error?.message ?? "Multipart upload failed",
        });
      }
    },
    [patchUpload],
  );

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newItems: UploadItem[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES && !ENABLE_MULTIPART_CLIENT) {
          console.warn(`File too large: ${file.name}`);
          continue;
        }

        const id = uuidv4();
        const previewUrl = URL.createObjectURL(file);

        newItems.push({
          id,
          file,
          previewUrl,
          progress: 0,
          status: "idle",
          isMultipart:
            ENABLE_MULTIPART_CLIENT && file.size > MULTIPART_THRESHOLD_BYTES,
        });
      }

      if (!newItems.length) return;

      setUploads((prev) => [...newItems, ...prev]);

      newItems.forEach((item) => {
        if (item.isMultipart) {
          uploadMultipart(item);
        } else {
          uploadSimple(item);
        }
      });
    },
    [uploadMultipart, uploadSimple],
  );

  const handleDeleteMedia = useCallback(async (key: string) => {
    try {
      await deleteMedia(key);
      setMedia((prev) => prev.filter((m) => m.key !== key));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    return () => {
      uploads.forEach((u) => URL.revokeObjectURL(u.previewUrl));
    };
  }, [uploads]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Resumable Media Vault
          </h1>
          <p className="text-sm text-gray-400">
            Drag & drop high-resolution images directly to S3 with live progress
            and a responsive gallery.
          </p>
        </header>

        <UploadArea onFilesSelected={handleFilesSelected} />
        <UploadList uploads={uploads} />

        <section className="mt-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Media Gallery</h2>
            {isLoadingList && (
              <span className="text-xs text-gray-400">Loading...</span>
            )}
          </div>
          <MediaGrid files={media} onDelete={handleDeleteMedia} />
        </section>
      </div>
    </main>
  );
}
