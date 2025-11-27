# Resumable Media Vault — README

---

## 🚀 Setup Instructions (How to Run Locally)

### 1. Install Dependencies

```bash
yarn install
```

### 2. Create `.env.local` File

Create a file in the root directory named:

```
.env.local
```

Add the required environment variables (see the next section).

### 3. Run the Development Server

```bash
yarn dev
```

Your app will be available at:

```
http://localhost:3000
```

---

## 🔐 Environment Variable Configuration

The application uses AWS S3 for direct uploads.  
You must configure an IAM user with programmatic access and provide the credentials in `.env.local`.

Here is the required configuration:

```env
# AWS Region
AWS_REGION=eu-central-1

# AWS IAM Credentials
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY

# Bucket Configuration
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_PUBLIC_BASE_URL=https://your-bucket-name.s3.eu-central-1.amazonaws.com
AWS_S3_OBJECT_PREFIX=media/

# Enable multipart upload for large files (50MB+)
ENABLE_MULTIPART_UPLOAD=true
NEXT_PUBLIC_ENABLE_MULTIPART=true
```

### Required S3 CORS Settings

In S3 → Bucket → Permissions → CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Required Bucket Policy (for displaying images publicly)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Also ensure all **Block Public Access** options are disabled for the bucket.

---

## 🧠 Architecture Decision

This project implements the **Direct-to-Storage** pattern, where file binaries are **never sent through the Next.js server**.  
Instead, the server issues **presigned URLs**, and the browser uploads directly to S3.

### Why `putObject` (presigned PUT) instead of `createPresignedPost`?

- **Simpler implementation**  
  PUT allows sending the file directly as the request body—no multipart/form-data wrapper needed.

- **Better progress support**  
  Axios provides stable `onUploadProgress` events with PUT uploads.

- **Lower overhead**  
  No need for extra POST policies or multipart fields.

### Why Multipart Upload for Large Files?

Files larger than ~50MB may fail or hang during single-request uploads.  
Multipart upload:
- splits the file into chunks,
- uploads each chunk independently,
- retries only failed chunks,
- and then assembles the final file on S3.

This ensures maximum reliability for large media files.

### Security Considerations

- AWS credentials exist **only on the server**.
- Presigned URLs have:
    - short expiration time,
    - a fixed object key,
    - restricted HTTP method,
    - restricted content-type.

This prevents unauthorized uploads or overwriting other objects.

---

## ✔️ Project Ready

You now have everything needed to run and present the assignment:
- local setup instructions,
- environment configuration,
- and a clear architecture explanation.

