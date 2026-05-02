import { Router, type IRouter } from "express";
import { LoginBody } from "@workspace/api-zod";
import { findUser, findUserByName } from "../lib/users.js";
import { createSession, destroySession } from "../lib/sessions.js";
import { readSessionUser, SESSION_COOKIE } from "../middlewares/auth.js";

const router: IRouter = Router();

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

router.post("/auth/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { username, password } = parsed.data;
  const user = findUser(username, password);
  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  const token = createSession(user.username);
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  res.json({ username: user.username, color: user.color });
});

router.post("/auth/logout", (req, res) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];
  destroySession(token);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/auth/me", (req, res) => {
  const username = readSessionUser(req);
  if (!username) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = findUserByName(username);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ username: user.username, color: user.color });
});

export default router;
