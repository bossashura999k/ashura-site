import { Router, type IRouter } from "express";
import { MakeMoveBody, ResetGameBody } from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../middlewares/auth.js";
import {
  applyMove,
  getPublicGameState,
  MoveError,
  resetGame,
} from "../lib/game-store.js";

const router: IRouter = Router();

router.get("/game", requireAuth, (_req, res) => {
  res.json(getPublicGameState());
});

router.post("/game/move", requireAuth, (req, res) => {
  const parsed = MakeMoveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid move request" });
    return;
  }
  const { from, to, promotion } = parsed.data;
  try {
    const state = applyMove(
      (req as AuthedRequest).username,
      from,
      to,
      promotion,
    );
    res.json(state);
  } catch (err) {
    if (err instanceof MoveError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    req.log.error({ err }, "Unexpected move error");
    res.status(500).json({ error: "Internal error applying move" });
  }
});

router.post("/game/reset", requireAuth, (req, res) => {
  const body = req.body ?? {};
  const parsed = ResetGameBody.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid time control" });
    return;
  }
  const tc = parsed.data.timeControl ?? null;
  // Sanity caps so a malicious client can't request absurd clocks.
  if (tc) {
    if (tc.initialSeconds < 0 || tc.initialSeconds > 60 * 60 * 6) {
      res.status(400).json({ error: "Initial time must be 0-21600 seconds" });
      return;
    }
    if (tc.incrementSeconds < 0 || tc.incrementSeconds > 120) {
      res.status(400).json({ error: "Increment must be 0-120 seconds" });
      return;
    }
  }
  res.json(resetGame(tc));
});

export default router;
