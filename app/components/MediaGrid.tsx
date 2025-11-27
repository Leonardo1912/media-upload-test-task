"use client";

import React from "react";
import type { MediaFile } from "@/lib/mediaTypes";

type Props = {
  files: MediaFile[];
  onDelete: (key: string) => void;
};

export const MediaGrid: React.FC<Props> = ({ files, onDelete }) => {
  if (files.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-gray-400">
        No media yet. Upload some images to see them here.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.key}
          className="relative group rounded-lg overflow-hidden border border-gray-700/70 bg-gray-900/60"
        >
          <img
            src={file.url}
            alt={file.key}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
          />
          <button
            type="button"
            onClick={() => onDelete(file.key)}
            className="absolute top-2 right-2 bg-black/70 text-xs text-red-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
