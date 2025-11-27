import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client";
import { SERVER_CONFIG, ENABLE_MULTIPART } from "@/lib/serverConfig";
import { MultipartInitResponse } from "@/lib/mediaTypes";

export async function POST(req: NextRequest) {
  if (!ENABLE_MULTIPART) {
    return NextResponse.json(
      { message: "Multipart upload is disabled" },
      { status: 400 },
    );
  }

  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { message: "fileName and fileType are required" },
        { status: 400 },
      );
    }

    const extension = fileName.split(".").pop() || "bin";
    const key = `${SERVER_CONFIG.objectPrefix}${Date.now()}-${randomUUID()}.${extension}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: SERVER_CONFIG.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const result = await s3Client.send(command);

    if (!result.UploadId) {
      return NextResponse.json(
        { message: "Failed to init multipart upload" },
        { status: 500 },
      );
    }

    const response: MultipartInitResponse = {
      key,
      uploadId: result.UploadId,
      publicUrl: `${SERVER_CONFIG.publicBaseUrl}/${key}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("multipart init error", error);
    return NextResponse.json(
      { message: "Failed to init multipart upload" },
      { status: 500 },
    );
  }
}
