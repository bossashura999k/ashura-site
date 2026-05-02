import { useState, useEffect, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { GameState, useMakeMove, getGetGameQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Piece from "./piece";

export default function Board({ game, userColor }: { game: GameState, userColor: "white" | "black" }) {
  const queryClient = useQueryClient();
  const makeMoveMutation = useMakeMove();
  
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [promotionSquare, setPromotionSquare] = useState<string | null>(null);
  const [promotionSource, setPromotionSource] = useState<string | null>(null);
  
  const chess = useMemo(() => {
    const c = new Chess();
    try {
      c.load(game.fen);
    } catch (e) {
      console.error("Invalid FEN", e);
    }
    return c;
  }, [game.fen]);

  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPromotionSquare(null);
  }, [game.fen]);

  const isMyTurn = game.status === "active" && game.turn === userColor;
  const board = chess.board();
  
  // Flip board for black
  const displayBoard = userColor === "black" 
    ? [...board].reverse().map(row => [...row].reverse())
    : board;

  const handleSquareClick = (square: string) => {
    if (!isMyTurn) return;

    // If clicking a promotion target, ignore board clicks
    if (promotionSquare) return;

    // If a square is selected, check if we are making a move
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const moveStr = selectedSquare + square;
      const isLegal = legalMoves.includes(moveStr);
      const isPromotion = legalMoves.includes(moveStr + 'q');

      if (isPromotion) {
        setPromotionSource(selectedSquare);
        setPromotionSquare(square);
        return;
      }

      if (isLegal) {
        executeMove(selectedSquare, square);
        return;
      }
    }

    // Otherwise, try to select the piece
    const piece = chess.get(square as Square);
    if (piece && piece.color === (userColor === "white" ? "w" : "b")) {
      setSelectedSquare(square as Square);
      const moves = chess.moves({ square: square as Square, verbose: true });
      setLegalMoves(moves.map(m => m.from + m.to + (m.promotion || '')));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const executeMove = (from: string, to: string, promotion?: "q" | "r" | "b" | "n") => {
    makeMoveMutation.mutate({ data: { from, to, promotion } }, {
      onSuccess: (newGameState) => {
        queryClient.setQueryData(getGetGameQueryKey(), newGameState);
      }
    });
    setSelectedSquare(null);
    setLegalMoves([]);
    setPromotionSquare(null);
    setPromotionSource(null);
  };

  const getSquareColor = (r: number, c: number) => {
    const isLight = (r + c) % 2 === 0;
    return isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
  };

  const getAlgebraic = (r: number, c: number): string => {
    const file = userColor === "white" ? String.fromCharCode(97 + c) : String.fromCharCode(104 - c);
    const rank = userColor === "white" ? 8 - r : r + 1;
    return `${file}${rank}`;
  };

  const lastMove = game.moves[game.moves.length - 1];

  return (
    <div className="relative aspect-square w-full">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayBoard.map((row, r) => (
          row.map((piece, c) => {
            const sq = getAlgebraic(r, c);
            const isSelected = selectedSquare === sq;
            const isLegalTarget = legalMoves.some(m => m.startsWith(selectedSquare + sq));
            const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);
            const isKingInCheck = game.status === "check" && piece?.type === 'k' && piece?.color === (game.turn === 'white' ? 'w' : 'b');
            
            return (
              <div 
                key={sq}
                onClick={() => handleSquareClick(sq)}
                className={`
                  relative flex items-center justify-center
                  ${getSquareColor(r, c)}
                  ${isSelected ? 'after:absolute after:inset-0 after:bg-primary/30' : ''}
                  ${isLastMove ? 'after:absolute after:inset-0 after:bg-yellow-400/30' : ''}
                  ${isKingInCheck ? 'after:absolute after:inset-0 after:bg-destructive/50 after:animate-pulse' : ''}
                  ${isMyTurn ? 'cursor-pointer' : ''}
                `}
              >
                {/* Coordinates (optional, standard bottom/left edges) */}
                {c === 0 && <span className={`absolute top-1 left-1 text-[10px] font-bold opacity-50 ${getSquareColor(r, c).includes('light') ? 'text-black' : 'text-white'}`}>{userColor === "white" ? 8 - r : r + 1}</span>}
                {r === 7 && <span className={`absolute bottom-0.5 right-1 text-[10px] font-bold opacity-50 ${getSquareColor(r, c).includes('light') ? 'text-black' : 'text-white'}`}>{userColor === "white" ? String.fromCharCode(97 + c) : String.fromCharCode(104 - c)}</span>}

                {/* Legal move indicator */}
                {isLegalTarget && (
                  <div className={`absolute z-10 ${piece ? 'w-full h-full border-4 border-black/20 rounded-full' : 'w-1/3 h-1/3 bg-black/20 rounded-full'}`} />
                )}

                {/* Piece */}
                {piece && (() => {
                  const isLanding = lastMove?.to === sq;
                  const isPieceSelected = selectedSquare === sq;
                  const isHoverable = isMyTurn && piece.color === (userColor === "white" ? "w" : "b");
                  return (
                    <div
                      key={isLanding ? `${sq}-${game.moves.length}` : sq}
                      className={[
                        "w-full h-full flex items-center justify-center z-20 relative drop-shadow-md",
                        isLanding     ? "piece-land"     : "",
                        isPieceSelected ? "piece-select"   : "",
                        isHoverable && !isPieceSelected ? "piece-hoverable" : "",
                      ].join(" ")}
                    >
                      <Piece type={piece.type} color={piece.color} />
                    </div>
                  );
                })()}

                {/* Promotion Picker */}
                {promotionSquare === sq && (
                  <div className="absolute z-50 bg-card rounded shadow-xl border overflow-hidden flex flex-col -top-4 w-[120%]">
                    {(['q', 'n', 'r', 'b'] as const).map(p => (
                      <div 
                        key={p} 
                        className="p-2 hover:bg-muted cursor-pointer flex items-center justify-center aspect-square"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (promotionSource) executeMove(promotionSource, sq, p);
                        }}
                      >
                        <Piece type={p} color={userColor === "white" ? "w" : "b"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}
