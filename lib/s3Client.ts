import { S3Client } from "@aws-sdk/client-s3";
import { SERVER_CONFIG } from "./serverConfig";

export const s3Client = new S3Client({
  region: SERVER_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
