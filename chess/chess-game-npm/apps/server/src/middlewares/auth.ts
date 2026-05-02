import type { Request, Response, NextFunction } from "express";
import { getSession } from "../lib/sessions.js";

export const SESSION_COOKIE = "chess_session";

export interface AuthedRequest extends Request {
  username: string;
}

export function readSessionUser(req: Request): string | null {
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];
  return getSession(cookieToken);
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const username = readSessionUser(req);
  if (!username) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  (req as AuthedRequest).username = username;
  next();
}
