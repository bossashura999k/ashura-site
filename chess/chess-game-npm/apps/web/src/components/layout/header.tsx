import { AuthSession } from "@workspace/api-client-react";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

interface HeaderProps {
  user: AuthSession;
  opponent?: { username: string, connected: boolean } | null;
  status: string;
  turn: string;
}

export default function Header({ user, opponent, status, turn }: HeaderProps) {
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
      }
    });
  };

  const getStatusText = () => {
    if (status === "waiting") return "Waiting for opponent...";
    if (status === "active" || status === "check") {
      if (turn === user.color) return <span className="text-primary font-bold">Your turn</span>;
      return <span>Opponent's turn</span>;
    }
    return "Game Over";
  };

  return (
    <header className="border-b bg-card text-card-foreground shadow-sm px-6 h-16 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary text-xl font-serif">
          ♔
        </div>
        <h1 className="font-serif font-bold text-xl hidden sm:block">The Study</h1>
        <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
        <div className="text-sm font-medium">
          {getStatusText()}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-muted-foreground">Playing as</span>
          <span className="font-bold capitalize flex items-center gap-1">
            {user.color === 'white' ? '♔' : '♚'} {user.color}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4 mr-2" />
          Leave
        </Button>
      </div>
    </header>
  );
}
