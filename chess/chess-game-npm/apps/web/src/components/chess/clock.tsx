import { useEffect, useRef, useState } from "react";

interface ClockProps {
  timeMs: number;
  isTicking: boolean;
  isMyClock?: boolean;
  hasTimeControl: boolean;
}

function formatTime(ms: number): string {
  const safe = Math.max(0, ms);
  const totalSec = Math.floor(safe / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (safe < 10_000) {
    const tenths = Math.floor((safe % 1000) / 100);
    return `${totalSec}.${tenths}`;
  }
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export default function Clock({ timeMs, isTicking, isMyClock = false, hasTimeControl }: ClockProps) {
  const [, force] = useState(0);
  const fetchedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    fetchedAtRef.current = Date.now();
    force((t) => t + 1);
  }, [timeMs, isTicking]);

  useEffect(() => {
    if (!isTicking) return;
    const id = window.setInterval(() => force((t) => t + 1), 200);
    return () => window.clearInterval(id);
  }, [isTicking]);

  if (!hasTimeControl) {
    return (
      <div
        className={`px-3 py-1.5 rounded-md font-mono text-sm tracking-tight bg-muted/40 text-muted-foreground border border-border/40`}
        title="No time control"
        data-testid="clock-no-tc"
      >
        ∞
      </div>
    );
  }

  const elapsed = isTicking ? Date.now() - fetchedAtRef.current : 0;
  const remaining = Math.max(0, timeMs - elapsed);
  const isLow = remaining < 30_000;
  const isCritical = remaining < 10_000;

  return (
    <div
      className={`px-3 py-1.5 rounded-md font-mono text-base tabular-nums tracking-tight border transition-colors ${
        isCritical
          ? "bg-destructive text-destructive-foreground border-destructive animate-pulse"
          : isLow
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
            : isTicking
              ? "bg-primary/10 text-primary border-primary/40"
              : "bg-muted/40 text-foreground/70 border-border/40"
      } ${isMyClock && isTicking ? "ring-2 ring-primary/30" : ""}`}
      data-testid={`clock-${isMyClock ? "self" : "opponent"}`}
    >
      {formatTime(remaining)}
    </div>
  );
}
