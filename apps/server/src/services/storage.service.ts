import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://garage:3900';
const S3_REGION = process.env.S3_REGION || 'garage';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'poscocina';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || '';

export class StorageService {
  private s3Client: S3Client | null = null;

  constructor() {
    if (S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        endpoint: S3_ENDPOINT,
        region: S3_REGION,
        credentials: {
          accessKeyId: S3_ACCESS_KEY_ID,
          secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true, // Requerido para Garage S3 / MinIO
      });
      console.log(`[StorageService] Initialized S3 Client with endpoint: ${S3_ENDPOINT}, bucket: ${S3_BUCKET_NAME}`);
    } else {
      console.log('[StorageService] No S3 credentials provided. Using local uploads directory fallback.');
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder = 'images'
  ): Promise<string> {
    const ext = path.extname(originalFilename) || (mimeType.includes('glb') ? '.glb' : '.webp');
    const randomName = `${crypto.randomUUID()}${ext}`;
    const key = `${folder}/${randomName}`;

    // 1. Try Garage S3 if configured
    if (this.s3Client) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
          })
        );

        if (S3_PUBLIC_URL) {
          return `${S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
        }
        return `${S3_ENDPOINT.replace(/\/$/, '')}/${S3_BUCKET_NAME}/${key}`;
      } catch (err) {
        console.error('[StorageService] Error uploading to S3, falling back to local filesystem:', err);
      }
    }

    // 2. Local filesystem fallback
    const localDir = path.resolve(process.cwd(), 'uploads', folder);
    await fs.mkdir(localDir, { recursive: true });
    const localPath = path.join(localDir, randomName);
    await fs.writeFile(localPath, buffer);
    return `/uploads/${folder}/${randomName}`;
  }
}

export const storageService = new StorageService();
