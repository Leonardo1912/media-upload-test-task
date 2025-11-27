import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client";
import { SERVER_CONFIG } from "@/lib/serverConfig";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ message: "key is required" }, { status: 400 });
    }

    if (!key.startsWith(SERVER_CONFIG.objectPrefix)) {
      return NextResponse.json({ message: "Invalid key" }, { status: 400 });
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: SERVER_CONFIG.bucketName,
        Key: key,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("delete error", error);
    return NextResponse.json(
      { message: "Failed to delete media file" },
      { status: 500 },
    );
  }
}
