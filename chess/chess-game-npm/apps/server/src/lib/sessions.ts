import { randomBytes } from "node:crypto";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface SessionRecord {
  username: string;
  createdAt: number;
  lastSeen: number;
}

const sessions = new Map<string, SessionRecord>();

export function createSession(username: string): string {
  const token = randomBytes(24).toString("hex");
  const now = Date.now();
  sessions.set(token, { username, createdAt: now, lastSeen: now });
  return token;
}

export function getSession(token: string | undefined): string | null {
  if (!token) return null;
  const record = sessions.get(token);
  if (!record) return null;
  if (Date.now() - record.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  record.lastSeen = Date.now();
  return record.username;
}

export function destroySession(token: string | undefined): void {
  if (!token) return;
  sessions.delete(token);
}

export function getActiveUsernames(maxIdleMs = 5000): Set<string> {
  const now = Date.now();
  const active = new Set<string>();
  for (const record of sessions.values()) {
    if (now - record.lastSeen <= maxIdleMs) {
      active.add(record.username);
    }
  }
  return active;
}
