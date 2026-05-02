import {
  useGetMe,
  useGetGame,
  useResetGame,
  getGetGameQueryKey,
  type GameState,
  type TimeControl,
  type PlayerInfo,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/header";
import Board from "@/components/chess/board";
import History from "@/components/chess/history";
import Clock from "@/components/chess/clock";
import NewGameDialog from "@/components/chess/new-game-dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function Game() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingUser } = useGetMe();
  const { data: game, isLoading: isLoadingGame } = useGetGame({
    query: { refetchInterval: 1500, queryKey: getGetGameQueryKey() },
  });
  const resetGameMutation = useResetGame();
  const queryClient = useQueryClient();
  const [newGameOpen, setNewGameOpen] = useState(false);

  if (isLoadingUser || isLoadingGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error loading game.
      </div>
    );
  }

  const handleStartGame = (timeControl: TimeControl | null) => {
    resetGameMutation.mutate(
      { data: { timeControl } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGameQueryKey() });
          setNewGameOpen(false);
        },
      },
    );
  };

  const opponent = user.color === "white" ? game.black : game.white;
  const me = user.color === "white" ? game.white : game.black;

  const myTimeMs = user.color === "white" ? game.whiteTimeMs : game.blackTimeMs;
  const oppTimeMs = user.color === "white" ? game.blackTimeMs : game.whiteTimeMs;
  const myTicking = game.tickingFor === user.color;
  const oppTicking = !!game.tickingFor && game.tickingFor !== user.color;
  const hasTimeControl = !!game.timeControl;

  const isLive = game.status === "active" || game.status === "check" || game.status === "waiting";

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} opponent={opponent} status={game.status} turn={game.turn} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
        <div className="w-full max-w-2xl flex-shrink-0">
          <div className="mb-4 flex justify-between items-end gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <PlayerPlate info={opponent} />
              <CaptureList
                captures={user.color === "white" ? game.capturedByBlack : game.capturedByWhite}
              />
            </div>
            <Clock
              timeMs={oppTimeMs}
              isTicking={oppTicking}
              hasTimeControl={hasTimeControl}
            />
          </div>

          <div className="relative shadow-2xl rounded-sm overflow-hidden border-8 border-border">
            <Board game={game} userColor={user.color} />

            {!isLive && (
              <EndGameOverlay game={game} onNewGame={() => setNewGameOpen(true)} />
            )}
          </div>

          <div className="mt-4 flex justify-between items-start gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <PlayerPlate info={me} />
              <CaptureList
                captures={user.color === "white" ? game.capturedByWhite : game.capturedByBlack}
              />
            </div>
            <Clock
              timeMs={myTimeMs}
              isTicking={myTicking}
              isMyClock
              hasTimeControl={hasTimeControl}
            />
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-card border shadow-sm rounded-lg overflow-hidden flex flex-col h-[400px] lg:h-[600px]">
            <div className="p-4 border-b bg-muted/30 font-serif font-bold text-lg flex justify-between items-center">
              <span>Match History</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewGameOpen(true)}
                data-testid="open-new-game"
              >
                {isLive && game.moves.length > 0 ? "Resign / New" : "New Game"}
              </Button>
            </div>
            {hasTimeControl && (
              <div className="px-4 py-2 border-b bg-muted/10 text-xs text-muted-foreground flex items-center justify-between">
                <span>Time control</span>
                <span className="font-mono font-medium text-foreground">
                  {Math.floor((game.timeControl?.initialSeconds ?? 0) / 60)}+
                  {game.timeControl?.incrementSeconds ?? 0}
                </span>
              </div>
            )}
            <History moves={game.moves} />
          </div>
        </div>
      </main>

      <NewGameDialog
        open={newGameOpen}
        onOpenChange={setNewGameOpen}
        onConfirm={handleStartGame}
        isPending={resetGameMutation.isPending}
        title={isLive && game.moves.length > 0 ? "End match and start new?" : "Start a new game"}
        description={
          isLive && game.moves.length > 0
            ? "This ends the current game. Pick a time control for the new one."
            : "Choose a time control. Increment is added to your clock after every move."
        }
        confirmLabel={isLive && game.moves.length > 0 ? "End & start new" : "Start game"}
      />
    </div>
  );
}

function EndGameOverlay({
  game,
  onNewGame,
}: {
  game: GameState;
  onNewGame: () => void;
}) {
  let heading = "Draw";
  let subtext = "The game ends in a draw.";
  if (game.status === "checkmate") {
    heading = "Checkmate";
    subtext = game.winner ? `${capitalize(game.winner)} wins the match.` : "";
  } else if (game.status === "stalemate") {
    heading = "Stalemate";
    subtext = "Neither side can move. The game is drawn.";
  } else if (game.status === "draw") {
    heading = "Draw";
    subtext = "The game ends in a draw.";
  } else if (game.status === "timeout") {
    heading = "Time's up";
    subtext = game.winner
      ? `${capitalize(game.winner)} wins on time.`
      : "Game over on time.";
  }

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-card p-8 rounded-xl shadow-2xl text-center border border-border max-w-sm w-full mx-4">
        <h2 className="text-4xl font-serif font-bold mb-2">{heading}</h2>
        <p className="text-muted-foreground text-lg mb-8">{subtext}</p>
        <Button
          size="lg"
          className="w-full text-lg h-14"
          onClick={onNewGame}
          data-testid="overlay-new-game"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PlayerPlate({ info }: { info: PlayerInfo | null | undefined }) {
  if (!info) {
    return (
      <div className="flex items-center gap-3 opacity-50">
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">?</div>
        <div>
          <div className="font-bold">Waiting...</div>
          <div className="text-xs text-muted-foreground">Opponent hasn't joined</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${!info.connected ? "opacity-50" : ""}`}>
      <div
        className={`w-10 h-10 rounded flex items-center justify-center font-serif text-xl border-2 ${
          info.color === "white"
            ? "bg-white text-black border-gray-300"
            : "bg-black text-white border-gray-800"
        }`}
      >
        {info.color === "white" ? "♔" : "♚"}
      </div>
      <div>
        <div className="font-bold flex items-center gap-2">
          {info.username}
          {info.connected ? (
            <span className="w-2 h-2 rounded-full bg-green-500" title="Online" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-gray-400" title="Offline" />
          )}
        </div>
        <div className="text-xs text-muted-foreground capitalize">{info.color}</div>
      </div>
    </div>
  );
}

function CaptureList({ captures }: { captures: string[] }) {
  if (!captures || captures.length === 0) return <div className="h-6" />;

  const pieceMap: Record<string, string> = {
    p: "♙",
    n: "♘",
    b: "♗",
    r: "♖",
    q: "♕",
    P: "♟",
    N: "♞",
    B: "♝",
    R: "♜",
    Q: "♛",
  };

  return (
    <div className="flex flex-wrap gap-0.5 text-xl font-serif leading-none">
      {captures.map((c, i) => (
        <span
          key={i}
          className={c === c.toLowerCase() ? "text-gray-800" : "text-gray-200 drop-shadow-md"}
        >
          {pieceMap[c] || c}
        </span>
      ))}
    </div>
  );
}
