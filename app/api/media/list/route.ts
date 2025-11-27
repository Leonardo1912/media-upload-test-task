import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client";
import { SERVER_CONFIG } from "@/lib/serverConfig";
import { MediaFile } from "@/lib/mediaTypes";

export async function GET(_req: NextRequest) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: SERVER_CONFIG.bucketName,
      Prefix: SERVER_CONFIG.objectPrefix,
    });

    const result = await s3Client.send(command);

    const files: MediaFile[] =
      result.Contents?.map((obj) => {
        const key = obj.Key!;
        return {
          key,
          url: `${SERVER_CONFIG.publicBaseUrl}/${key}`,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified?.toISOString(),
        };
      }) ?? [];

    files.sort((a, b) =>
      (b.lastModified ?? "").localeCompare(a.lastModified ?? ""),
    );

    return NextResponse.json(files);
  } catch (error) {
    console.error("list error", error);
    return NextResponse.json(
      { message: "Failed to list media files" },
      { status: 500 },
    );
  }
}
