"use client";

import React from "react";
import type { UploadItem } from "@/lib/mediaTypes";

type Props = {
  uploads: UploadItem[];
};

export const UploadList: React.FC<Props> = ({ uploads }) => {
  if (uploads.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 space-y-3">
      {uploads.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-3 bg-gray-900/60 border border-gray-700/60 rounded-lg p-3"
        >
          <img
            src={u.previewUrl}
            alt={u.file.name}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span className="truncate max-w-[60%]">{u.file.name}</span>
              <span>
                {u.progress.toFixed(0)}%{" "}
                {u.isMultipart && (
                  <span className="ml-1 text-[10px] text-purple-300">
                    multipart
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-2 transition-all ${
                  u.status === "error"
                    ? "bg-red-500"
                    : u.status === "completed"
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${u.progress}%` }}
              />
            </div>
            {u.error && (
              <p className="text-[10px] text-red-400 mt-1">{u.error}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
