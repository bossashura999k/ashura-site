import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock as ClockIcon, Infinity as InfinityIcon } from "lucide-react";
import type { TimeControl } from "@workspace/api-client-react";

export interface NewGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (timeControl: TimeControl | null) => void;
  isPending?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

interface Preset {
  key: string;
  label: string;
  sub: string;
  value: TimeControl | null;
}

const PRESETS: Preset[] = [
  { key: "unlimited", label: "Unlimited", sub: "No clock", value: null },
  { key: "1+0", label: "1 + 0", sub: "Bullet", value: { initialSeconds: 60, incrementSeconds: 0 } },
  { key: "3+0", label: "3 + 0", sub: "Blitz", value: { initialSeconds: 180, incrementSeconds: 0 } },
  { key: "3+2", label: "3 + 2", sub: "Blitz", value: { initialSeconds: 180, incrementSeconds: 2 } },
  { key: "5+0", label: "5 + 0", sub: "Blitz", value: { initialSeconds: 300, incrementSeconds: 0 } },
  { key: "5+3", label: "5 + 3", sub: "Blitz", value: { initialSeconds: 300, incrementSeconds: 3 } },
  { key: "10+0", label: "10 + 0", sub: "Rapid", value: { initialSeconds: 600, incrementSeconds: 0 } },
  { key: "15+10", label: "15 + 10", sub: "Rapid", value: { initialSeconds: 900, incrementSeconds: 10 } },
];

export default function NewGameDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  title = "Start a new game",
  description = "Choose a time control. Increment is added to your clock after every move.",
  confirmLabel = "Start game",
}: NewGameDialogProps) {
  const [selectedKey, setSelectedKey] = useState<string>("5+3");
  const [showCustom, setShowCustom] = useState(false);
  const [customMin, setCustomMin] = useState("5");
  const [customInc, setCustomInc] = useState("0");

  const resolveTimeControl = (): TimeControl | null => {
    if (showCustom) {
      const min = Math.max(0, Math.min(360, Number(customMin) || 0));
      const inc = Math.max(0, Math.min(120, Number(customInc) || 0));
      if (min === 0 && inc === 0) return null;
      return { initialSeconds: min * 60, incrementSeconds: inc };
    }
    const preset = PRESETS.find((p) => p.key === selectedKey);
    return preset ? preset.value : null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2">
          {PRESETS.map((p) => {
            const active = !showCustom && selectedKey === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setShowCustom(false);
                  setSelectedKey(p.key);
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-md border p-3 text-center transition-colors hover-elevate ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
                data-testid={`preset-${p.key}`}
              >
                <div className="flex items-center gap-1 font-bold">
                  {p.value === null ? (
                    <InfinityIcon className="w-4 h-4" />
                  ) : (
                    <ClockIcon className="w-4 h-4" />
                  )}
                  <span>{p.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{p.sub}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="text-sm text-muted-foreground hover:text-foreground self-start underline-offset-4 hover:underline"
          data-testid="toggle-custom"
        >
          {showCustom ? "Use a preset instead" : "Set a custom time control"}
        </button>

        {showCustom && (
          <div className="grid grid-cols-2 gap-3 mt-2 p-3 rounded-md border border-border bg-muted/20">
            <div className="space-y-1">
              <Label htmlFor="custom-min">Minutes per side</Label>
              <Input
                id="custom-min"
                type="number"
                min={0}
                max={360}
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                data-testid="input-custom-min"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="custom-inc">Increment (sec)</Label>
              <Input
                id="custom-inc"
                type="number"
                min={0}
                max={120}
                value={customInc}
                onChange={(e) => setCustomInc(e.target.value)}
                data-testid="input-custom-inc"
              />
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              Tip: set both to 0 for an unlimited game.
            </p>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(resolveTimeControl())}
            disabled={isPending}
            data-testid="confirm-new-game"
          >
            {isPending ? "Starting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
