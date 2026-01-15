import type { Express, Request, Response } from "express";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";
import { randomUUID } from "crypto";

/**
 * Register object storage routes for file uploads.
 *
 * This provides routes for server-side file uploads:
 * 1. POST /api/uploads/upload - Upload file directly to server, which forwards to GCS
 *
 * IMPORTANT: These are example routes. Customize based on your use case:
 * - Add authentication middleware for protected uploads
 * - Add file metadata storage (save to database after upload)
 * - Add ACL policies for access control
 */
export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  /**
   * Direct file upload endpoint (server-side upload to avoid CORS issues).
   * 
   * This endpoint receives the raw file body and uploads it to GCS server-side.
   * Content-Type header should match the file being uploaded.
   */
  app.post("/api/uploads/upload", async (req: Request, res: Response) => {
    try {
      const contentType = req.headers["content-type"] || "application/octet-stream";
      
      // Get the private object directory
      const privateObjectDir = objectStorageService.getPrivateObjectDir();
      const objectId = randomUUID();
      const fullPath = `${privateObjectDir}/uploads/${objectId}`;
      
      // Parse bucket and object name
      const pathParts = fullPath.startsWith("/") ? fullPath.slice(1).split("/") : fullPath.split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      
      // Create a write stream to GCS
      const writeStream = file.createWriteStream({
        metadata: {
          contentType: contentType,
        },
        resumable: false,
      });
      
      // Collect chunks from the request body
      const chunks: Buffer[] = [];
      
      req.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      req.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          writeStream.end(buffer);
          
          writeStream.on("finish", () => {
            const objectPath = `/objects/uploads/${objectId}`;
            res.json({
              objectPath,
              success: true,
            });
          });
          
          writeStream.on("error", (err) => {
            console.error("Error writing to GCS:", err);
            res.status(500).json({ error: "Failed to upload file to storage" });
          });
        } catch (err) {
          console.error("Error processing upload:", err);
          res.status(500).json({ error: "Failed to process upload" });
        }
      });
      
      req.on("error", (err) => {
        console.error("Request error:", err);
        res.status(500).json({ error: "Upload request failed" });
      });
      
    } catch (error) {
      console.error("Error in upload endpoint:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  /**
   * Legacy endpoint for presigned URL (kept for compatibility).
   * Note: Direct browser uploads to GCS may fail due to CORS in production.
   */
  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();

      // Extract object path from the presigned URL for later reference
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        // Echo back the metadata for client convenience
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  /**
   * Serve uploaded objects.
   *
   * GET /objects/:objectPath(*)
   *
   * This serves files from object storage. For public files, no auth needed.
   * For protected files, add authentication middleware and ACL checks.
   */
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}

