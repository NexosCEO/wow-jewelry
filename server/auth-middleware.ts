import { Request, Response, NextFunction } from "express";

// Simple admin authentication middleware
// TODO: Replace with proper authentication system (JWT, session, etc.)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers.authorization?.replace("Bearer ", "");
  
  // Check if admin key matches environment variable
  const expectedAdminKey = process.env.ADMIN_ACCESS_KEY;
  
  if (!expectedAdminKey) {
    return res.status(503).json({
      message: "Admin access not configured. Please set ADMIN_ACCESS_KEY in secrets.",
    });
  }
  
  if (adminKey !== expectedAdminKey) {
    return res.status(401).json({
      message: "Unauthorized: Invalid admin access key",
    });
  }
  
  next();
}
