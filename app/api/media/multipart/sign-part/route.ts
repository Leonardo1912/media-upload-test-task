import { NextRequest, NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3Client";
import { SERVER_CONFIG, ENABLE_MULTIPART } from "@/lib/serverConfig";
import { MultipartSignPartResponse } from "@/lib/mediaTypes";

export async function POST(req: NextRequest) {
  if (!ENABLE_MULTIPART) {
    return NextResponse.json(
      { message: "Multipart upload is disabled" },
      { status: 400 },
    );
  }

  try {
    const { key, uploadId, partNumber } = await req.json();

    if (!key || !uploadId || !partNumber) {
      return NextResponse.json(
        { message: "key, uploadId and partNumber are required" },
        { status: 400 },
      );
    }

    const command = new UploadPartCommand({
      Bucket: SERVER_CONFIG.bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 10,
    });

    const response: MultipartSignPartResponse = { url };

    return NextResponse.json(response);
  } catch (error) {
    console.error("sign-part error", error);
    return NextResponse.json(
      { message: "Failed to sign part" },
      { status: 500 },
    );
  }
}
