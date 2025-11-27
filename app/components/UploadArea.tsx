"use client";

import React, { DragEvent, ChangeEvent, useCallback, useState } from "react";
import { MAX_FILES_PER_BATCH } from "@/lib/mediaTypes";

type Props = {
  onFilesSelected: (files: File[]) => void;
};

export const UploadArea: React.FC<Props> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      if (fileArray.length > MAX_FILES_PER_BATCH) {
        setError(`You can upload up to ${MAX_FILES_PER_BATCH} files at once`);
        return;
      }

      setError(null);
      onFilesSelected(fileArray);
    },
    [onFilesSelected],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition
        ${
          isDragging
            ? "border-blue-500 bg-blue-50/40"
            : "border-dashed border-gray-500/40 bg-gray-900/30"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <p className="text-sm text-gray-300 mb-2">
          Drag & drop images here, or click to select
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Up to {MAX_FILES_PER_BATCH} files per batch
        </p>
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-blue-600 text-sm text-white hover:bg-blue-500"
          onClick={() => {
            const input = document.getElementById(
              "file-input",
            ) as HTMLInputElement | null;
            input?.click();
          }}
        >
          Select files
        </button>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onInputChange}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
};
