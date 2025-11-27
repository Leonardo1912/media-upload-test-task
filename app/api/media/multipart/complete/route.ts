import { NextRequest, NextResponse } from "next/server";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client";
import { SERVER_CONFIG, ENABLE_MULTIPART } from "@/lib/serverConfig";
import { MultipartCompletePart } from "@/lib/mediaTypes";

type CompleteBody = {
  key: string;
  uploadId: string;
  parts: MultipartCompletePart[];
};

export async function POST(req: NextRequest) {
  if (!ENABLE_MULTIPART) {
    return NextResponse.json(
      { message: "Multipart upload is disabled" },
      { status: 400 },
    );
  }

  try {
    const { key, uploadId, parts } = (await req.json()) as CompleteBody;

    if (!key || !uploadId || !parts?.length) {
      return NextResponse.json(
        { message: "key, uploadId and parts are required" },
        { status: 400 },
      );
    }

    const command = new CompleteMultipartUploadCommand({
      Bucket: SERVER_CONFIG.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p) => ({
          ETag: p.etag,
          PartNumber: p.partNumber,
        })),
      },
    });

    await s3Client.send(command);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("multipart complete error", error);
    return NextResponse.json(
      { message: "Failed to complete multipart upload" },
      { status: 500 },
    );
  }
}
