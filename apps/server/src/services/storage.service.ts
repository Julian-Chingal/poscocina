import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

export class StorageService {
  private s3Client: S3Client | null = null;

  constructor() {
    this.initS3Client();
  }

  private getStorageConfig() {
    const endpoint =
      process.env.STORAGE_ENDPOINT ||
      process.env.GARAGE_S3_ENDPOINT ||
      process.env.S3_ENDPOINT ||
      'http://garage:3900';

    const region =
      process.env.STORAGE_REGION ||
      process.env.GARAGE_S3_REGION ||
      process.env.S3_REGION ||
      'garage';

    let bucket = (
      process.env.STORAGE_BUCKET ||
      process.env.GARAGE_S3_BUCKET ||
      process.env.S3_BUCKET_NAME ||
      ''
    ).trim();

    let storagePath = (
      process.env.STORAGE_PATH ||
      process.env.STORAGE_PREFIX ||
      process.env.MEDIA_STORAGE_PATH ||
      ''
    )
      .trim()
      .replace(/^\/+|\/+$/g, '');

    // Si el usuario especificó "catastrocol-cargues/gastropos" todo junto en STORAGE_PATH
    if (!bucket && storagePath.includes('/')) {
      const parts = storagePath.split('/');
      bucket = parts[0];
      storagePath = parts.slice(1).join('/');
    }

    // Default al bucket de Filestash mostrado por el usuario
    if (!bucket) {
      bucket = 'catastrocol-cargues';
    }

    // Default a 'gastropos' si no se especificó ruta
    if (!storagePath && process.env.STORAGE_PATH === undefined && process.env.STORAGE_PREFIX === undefined) {
      storagePath = 'gastropos';
    }

    // Evitar duplicar bucket si storagePath empieza con el nombre del bucket
    if (storagePath.startsWith(`${bucket}/`)) {
      storagePath = storagePath.slice(bucket.length + 1);
    } else if (storagePath === bucket) {
      storagePath = '';
    }

    const accessKeyId =
      process.env.STORAGE_ACCESS_KEY_ID ||
      process.env.GARAGE_ACCESS_KEY_ID ||
      process.env.S3_ACCESS_KEY_ID ||
      process.env.AWS_ACCESS_KEY_ID ||
      '';

    const secretAccessKey =
      process.env.STORAGE_SECRET_ACCESS_KEY ||
      process.env.GARAGE_SECRET_ACCESS_KEY ||
      process.env.S3_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      '';

    const publicUrl =
      process.env.PUBLIC_STORAGE_URL ||
      process.env.STORAGE_PUBLIC_URL ||
      process.env.S3_PUBLIC_URL ||
      '';

    return {
      endpoint,
      region,
      bucket,
      storagePath,
      accessKeyId,
      secretAccessKey,
      publicUrl,
    };
  }

  private initS3Client() {
    const { endpoint, region, bucket, storagePath, accessKeyId, secretAccessKey } = this.getStorageConfig();

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        endpoint,
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true, // S3 compatible (Garage, MinIO, Filestash backend)
      });
      console.log(
        `[StorageService] S3 habilitado -> Endpoint: ${endpoint}, Bucket: ${bucket}, Ruta: ${storagePath || '(raíz)'}`
      );
    } else {
      console.log(
        `[StorageService] Sin credenciales S3 (STORAGE_ACCESS_KEY_ID vacío). Usando almacenamiento local en ./uploads/${storagePath}`
      );
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder = 'images'
  ): Promise<string> {
    const { endpoint, bucket, storagePath, publicUrl } = this.getStorageConfig();

    const ext = path.extname(originalFilename) || (mimeType.includes('glb') ? '.glb' : '.webp');
    const randomName = `${crypto.randomUUID()}${ext}`;

    // Construir la clave / ruta relativa: [storagePath/][folder/]filename
    const pathParts: string[] = [];
    if (storagePath) pathParts.push(storagePath);
    if (folder) pathParts.push(folder);
    pathParts.push(randomName);

    const key = pathParts.join('/');

    // 1. Intentar S3 / Garage si está configurado
    if (this.s3Client) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
          })
        );

        if (publicUrl) {
          const cleanPublic = publicUrl.replace(/\/$/, '');
          if (cleanPublic.endsWith(bucket) || cleanPublic.includes(`/${bucket}/`)) {
            return `${cleanPublic}/${key}`;
          }
          return `${cleanPublic}/${bucket}/${key}`;
        }
        return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`;
      } catch (err) {
        console.error('[StorageService] Error subiendo a S3, recurriendo a disco local:', err);
      }
    }

    // 2. Almacenamiento local de respaldo (fallback)
    const localDir = path.resolve(
      process.cwd(),
      'uploads',
      ...(storagePath ? [storagePath] : []),
      ...(folder ? [folder] : [])
    );
    await fs.mkdir(localDir, { recursive: true });
    const localPath = path.join(localDir, randomName);
    await fs.writeFile(localPath, buffer);

    return `/uploads/${key}`;
  }
}

export const storageService = new StorageService();
