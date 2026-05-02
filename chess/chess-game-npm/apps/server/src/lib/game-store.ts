import { Chess, type Move } from "chess.js";
import { USERS, type ChessColor } from "./users.js";
import { getActiveUsernames } from "./sessions.js";

export interface MoveRecord {
  from: string;
  to: string;
  san: string;
  color: ChessColor;
  promotion?: string;
}

export interface TimeControl {
  initialSeconds: number;
  incrementSeconds: number;
}

interface GameStateData {
  chess: Chess;
  moves: MoveRecord[];
  capturedByWhite: string[];
  capturedByBlack: string[];
  lastMoveAt: Date | null;
  version: number;
  // Clock state
  timeControl: TimeControl | null;
  whiteTimeMs: number;
  blackTimeMs: number;
  tickingSince: Date | null;
  timedOut: ChessColor | null;
}

function newGameData(timeControl: TimeControl | null = null): GameStateData {
  const initialMs = timeControl ? timeControl.initialSeconds * 1000 : 0;
  return {
    chess: new Chess(),
    moves: [],
    capturedByWhite: [],
    capturedByBlack: [],
    lastMoveAt: null,
    version: 1,
    timeControl,
    whiteTimeMs: initialMs,
    blackTimeMs: initialMs,
    tickingSince: null,
    timedOut: null,
  };
}

let game: GameStateData = newGameData();

function chessTurnToColor(turn: "w" | "b"): ChessColor {
  return turn === "w" ? "white" : "black";
}

function moveColor(color: "w" | "b"): ChessColor {
  return color === "w" ? "white" : "black";
}

function bothPlayersConnected(): boolean {
  const active = getActiveUsernames();
  const whiteUser = USERS.find((u) => u.color === "white");
  const blackUser = USERS.find((u) => u.color === "black");
  return Boolean(
    whiteUser &&
      blackUser &&
      active.has(whiteUser.username) &&
      active.has(blackUser.username),
  );
}

function isGameLive(): boolean {
  if (game.timedOut) return false;
  if (game.chess.isGameOver()) return false;
  return true;
}

function shouldClockRun(): boolean {
  return Boolean(
    game.timeControl && isGameLive() && bothPlayersConnected(),
  );
}

/**
 * Recalculate clocks given the current wall-clock time.
 * - If the clock was ticking, deduct elapsed time from the side whose turn it is.
 * - If a side hits 0, mark them as timed out.
 * - Re-anchor `tickingSince` (or clear it) based on whether the clock should run.
 */
function tick(now: Date = new Date()): void {
  if (game.tickingSince) {
    const elapsed = now.getTime() - game.tickingSince.getTime();
    if (elapsed > 0) {
      const side = chessTurnToColor(game.chess.turn());
      if (side === "white") {
        game.whiteTimeMs = Math.max(0, game.whiteTimeMs - elapsed);
        if (game.whiteTimeMs <= 0 && !game.timedOut) {
          game.timedOut = "white";
          game.version += 1;
        }
      } else {
        game.blackTimeMs = Math.max(0, game.blackTimeMs - elapsed);
        if (game.blackTimeMs <= 0 && !game.timedOut) {
          game.timedOut = "black";
          game.version += 1;
        }
      }
    }
    game.tickingSince = null;
  }

  if (shouldClockRun()) {
    game.tickingSince = now;
  }
}

function computeStatus(chess: Chess): {
  status: "active" | "check" | "checkmate" | "stalemate" | "draw";
  winner: ChessColor | "draw" | null;
} {
  if (chess.isCheckmate()) {
    const loser = chessTurnToColor(chess.turn());
    const winner: ChessColor = loser === "white" ? "black" : "white";
    return { status: "checkmate", winner };
  }
  if (chess.isStalemate()) {
    return { status: "stalemate", winner: "draw" };
  }
  if (chess.isDraw() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition()) {
    return { status: "draw", winner: "draw" };
  }
  if (chess.inCheck()) {
    return { status: "check", winner: null };
  }
  return { status: "active", winner: null };
}

export interface PublicPlayer {
  username: string;
  color: ChessColor;
  connected: boolean;
}

export interface PublicGameState {
  fen: string;
  turn: ChessColor;
  status:
    | "waiting"
    | "active"
    | "check"
    | "checkmate"
    | "stalemate"
    | "draw"
    | "timeout";
  winner: ChessColor | "draw" | null;
  white: PublicPlayer | null;
  black: PublicPlayer | null;
  moves: MoveRecord[];
  capturedByWhite: string[];
  capturedByBlack: string[];
  lastMoveAt: string | null;
  version: number;
  timeControl: TimeControl | null;
  whiteTimeMs: number;
  blackTimeMs: number;
  tickingFor: ChessColor | null;
  serverNow: string;
}

export function getPublicGameState(): PublicGameState {
  tick();

  const active = getActiveUsernames();
  const whiteUser = USERS.find((u) => u.color === "white") ?? null;
  const blackUser = USERS.find((u) => u.color === "black") ?? null;

  const whiteConnected = whiteUser ? active.has(whiteUser.username) : false;
  const blackConnected = blackUser ? active.has(blackUser.username) : false;

  const baseStatus = computeStatus(game.chess);
  const bothConnected = whiteConnected && blackConnected;

  let status: PublicGameState["status"];
  let winner: PublicGameState["winner"];

  if (game.timedOut) {
    status = "timeout";
    winner = game.timedOut === "white" ? "black" : "white";
  } else if (game.moves.length === 0 && !bothConnected) {
    status = "waiting";
    winner = baseStatus.winner;
  } else {
    status = baseStatus.status;
    winner = baseStatus.winner;
  }

  return {
    fen: game.chess.fen(),
    turn: chessTurnToColor(game.chess.turn()),
    status,
    winner,
    white: whiteUser
      ? {
          username: whiteUser.username,
          color: "white",
          connected: whiteConnected,
        }
      : null,
    black: blackUser
      ? {
          username: blackUser.username,
          color: "black",
          connected: blackConnected,
        }
      : null,
    moves: game.moves,
    capturedByWhite: game.capturedByWhite,
    capturedByBlack: game.capturedByBlack,
    lastMoveAt: game.lastMoveAt ? game.lastMoveAt.toISOString() : null,
    version: game.version,
    timeControl: game.timeControl,
    whiteTimeMs: game.whiteTimeMs,
    blackTimeMs: game.blackTimeMs,
    tickingFor: game.tickingSince ? chessTurnToColor(game.chess.turn()) : null,
    serverNow: new Date().toISOString(),
  };
}

export class MoveError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function applyMove(
  username: string,
  from: string,
  to: string,
  promotion: string | undefined,
): PublicGameState {
  const user = USERS.find((u) => u.username === username);
  if (!user) {
    throw new MoveError("Unknown user", 401);
  }

  // Settle the clock first so any timeout is recognised before allowing the move.
  tick();

  if (game.timedOut) {
    throw new MoveError("The game ended on time. Start a new game.", 400);
  }

  const turnColor = chessTurnToColor(game.chess.turn());
  if (user.color !== turnColor) {
    throw new MoveError(
      user.color === "white" ? "It is Black's turn" : "It is White's turn",
      403,
    );
  }

  const baseStatus = computeStatus(game.chess);
  if (
    baseStatus.status === "checkmate" ||
    baseStatus.status === "stalemate" ||
    baseStatus.status === "draw"
  ) {
    throw new MoveError("The game is over. Start a new game.", 400);
  }

  let move: Move | null = null;
  try {
    move = game.chess.move({
      from,
      to,
      promotion: (promotion as "q" | "r" | "b" | "n" | undefined) ?? undefined,
    });
  } catch {
    throw new MoveError("Illegal move", 400);
  }
  if (!move) {
    throw new MoveError("Illegal move", 400);
  }

  // Apply Fischer increment to the player who just moved.
  if (game.timeControl && game.timeControl.incrementSeconds > 0) {
    const incMs = game.timeControl.incrementSeconds * 1000;
    if (move.color === "w") {
      game.whiteTimeMs += incMs;
    } else {
      game.blackTimeMs += incMs;
    }
  }

  if (move.captured) {
    if (move.color === "w") {
      game.capturedByWhite.push(move.captured);
    } else {
      game.capturedByBlack.push(move.captured.toUpperCase());
    }
  }

  const record: MoveRecord = {
    from: move.from,
    to: move.to,
    san: move.san,
    color: moveColor(move.color),
    ...(move.promotion ? { promotion: move.promotion } : {}),
  };
  game.moves.push(record);
  game.lastMoveAt = new Date();
  game.version += 1;

  return getPublicGameState();
}

export function resetGame(timeControl: TimeControl | null = null): PublicGameState {
  game = newGameData(timeControl);
  game.version = Date.now();
  return getPublicGameState();
}
