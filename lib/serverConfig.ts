export const SERVER_CONFIG = {
  bucketName: process.env.AWS_S3_BUCKET_NAME!,
  region: process.env.AWS_REGION!,
  publicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL!,
  objectPrefix: process.env.AWS_S3_OBJECT_PREFIX ?? "media/",
};

export const ENABLE_MULTIPART = process.env.ENABLE_MULTIPART_UPLOAD === "true";
