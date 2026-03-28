// AWS S3 file upload service — replaces Replit GCS object storage
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import type { Express, Request, Response } from 'express';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET = process.env.S3_BUCKET || 'wow-jewelry-uploads';

export function registerUploadRoutes(app: Express): void {

  // Direct file upload — receives raw body, uploads to S3
  app.post('/api/uploads/upload', async (req: Request, res: Response) => {
    try {
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      const objectId = randomUUID();
      const key = `uploads/${objectId}`;

      const chunks: Buffer[] = [];

      req.on('data', (chunk: Buffer) => chunks.push(chunk));

      req.on('end', async () => {
        try {
          const body = Buffer.concat(chunks);

          await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
          }));

          res.json({
            objectPath: `/objects/${key}`,
            success: true,
          });
        } catch (err) {
          console.error('Error uploading to S3:', err);
          res.status(500).json({ error: 'Failed to upload file to storage' });
        }
      });

      req.on('error', (err) => {
        console.error('Request error:', err);
        res.status(500).json({ error: 'Upload request failed' });
      });
    } catch (error) {
      console.error('Error in upload endpoint:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Presigned URL endpoint (for client-side uploads)
  app.post('/api/uploads/request-url', async (req: Request, res: Response) => {
    try {
      const { name, size, contentType } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Missing required field: name' });
      }

      const objectId = randomUUID();
      const key = `uploads/${objectId}`;

      const uploadURL = await getSignedUrl(s3, new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType || 'application/octet-stream',
      }), { expiresIn: 900 });

      res.json({
        uploadURL,
        objectPath: `/objects/${key}`,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });

  // Serve uploaded objects from S3
  app.get('/objects/*', async (req: Request, res: Response) => {
    try {
      const key = req.path.replace('/objects/', '');

      const response = await s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }));

      res.set({
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Content-Length': response.ContentLength?.toString() || '',
        'Cache-Control': 'public, max-age=3600',
      });

      // Stream body to response
      const stream = response.Body as NodeJS.ReadableStream;
      stream.pipe(res);
    } catch (error: any) {
      if (error?.name === 'NoSuchKey') {
        return res.status(404).json({ error: 'Object not found' });
      }
      console.error('Error serving object:', error);
      res.status(500).json({ error: 'Failed to serve object' });
    }
  });
}
