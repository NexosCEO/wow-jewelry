import { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";

const SESSION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

interface AdminSession {
  token: string;
  lastActivity: number;
}

const adminSessions = new Map<string, AdminSession>();

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

function cleanupExpiredSessions() {
  const now = Date.now();
  const entries = Array.from(adminSessions.entries());
  for (const [token, session] of entries) {
    if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
      adminSessions.delete(token);
    }
  }
}

export function createAdminSession(): string {
  cleanupExpiredSessions();
  const token = generateSessionToken();
  adminSessions.set(token, {
    token,
    lastActivity: Date.now(),
  });
  return token;
}

export function validateAdminSession(token: string): boolean {
  cleanupExpiredSessions();
  const session = adminSessions.get(token);
  if (!session) return false;
  
  const now = Date.now();
  if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
    adminSessions.delete(token);
    return false;
  }
  
  session.lastActivity = now;
  return true;
}

export function invalidateAdminSession(token: string): void {
  adminSessions.delete(token);
}

export function verifyAdminPassword(password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_ACCESS_KEY;
  if (!expectedPassword) return false;
  return password === expectedPassword;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No session token provided",
    });
  }
  
  if (!validateAdminSession(token)) {
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired session",
    });
  }
  
  next();
}
