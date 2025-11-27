import { NextRequest, NextResponse } from "next/server";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client";
import { SERVER_CONFIG, ENABLE_MULTIPART } from "@/lib/serverConfig";

export async function POST(req: NextRequest) {
  if (!ENABLE_MULTIPART) {
    return NextResponse.json(
      { message: "Multipart upload is disabled" },
      { status: 400 },
    );
  }

  try {
    const { key, uploadId } = await req.json();

    if (!key || !uploadId) {
      return NextResponse.json(
        { message: "key and uploadId are required" },
        { status: 400 },
      );
    }

    await s3Client.send(
      new AbortMultipartUploadCommand({
        Bucket: SERVER_CONFIG.bucketName,
        Key: key,
        UploadId: uploadId,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("multipart abort error", error);
    return NextResponse.json(
      { message: "Failed to abort multipart upload" },
      { status: 500 },
    );
  }
}
