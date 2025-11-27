import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3Client";
import { SERVER_CONFIG } from "@/lib/serverConfig";
import { PresignUploadResponse, MAX_FILE_SIZE_BYTES } from "@/lib/mediaTypes";

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType || typeof fileSize !== "number") {
      return NextResponse.json(
        { message: "fileName, fileType and fileSize are required" },
        { status: 400 },
      );
    }

    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 },
      );
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          message: `File size exceeds max limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        },
        { status: 400 },
      );
    }

    const extension = fileName.split(".").pop() || "bin";
    const key = `${SERVER_CONFIG.objectPrefix}${Date.now()}-${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: SERVER_CONFIG.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 5,
    });

    const response: PresignUploadResponse = {
      key,
      uploadUrl,
      publicUrl: `${SERVER_CONFIG.publicBaseUrl}/${key}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("presign error", error);
    return NextResponse.json(
      { message: "Failed to generate presigned URL" },
      { status: 500 },
    );
  }
}
