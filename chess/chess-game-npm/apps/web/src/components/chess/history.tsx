import { MoveRecord } from "@workspace/api-client-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

export default function History({ moves }: { moves: MoveRecord[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Group moves into pairs (white, black)
  const groupedMoves: { w?: MoveRecord, b?: MoveRecord, num: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    groupedMoves.push({
      num: Math.floor(i / 2) + 1,
      w: moves[i],
      b: moves[i + 1]
    });
  }

  // Auto-scroll to bottom when new moves arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center italic">
        The game has not started yet.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 bg-card">
      <div className="p-4" ref={scrollRef}>
        <table className="w-full text-sm">
          <tbody>
            {groupedMoves.map((group, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-muted/30' : ''} hover:bg-muted/50 transition-colors`}>
                <td className="py-2 px-3 text-muted-foreground w-12 border-r">{group.num}.</td>
                <td className="py-2 px-4 font-mono font-medium">{group.w?.san}</td>
                <td className="py-2 px-4 font-mono font-medium">{group.b?.san}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
