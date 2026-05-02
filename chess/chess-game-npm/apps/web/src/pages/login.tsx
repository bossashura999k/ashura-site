import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isLoadingUser } = useGetMe();
  const loginMutation = useLogin();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (isLoadingUser) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetMeQueryKey(), data);
          setLocation("/");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-serif text-primary">♔</span>
          </div>
          <CardTitle className="text-3xl font-serif">The Study</CardTitle>
          <CardDescription className="text-base">
            A private two-player chess room. Each login plays a fixed color.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                autoFocus
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-background"
              />
            </div>
            {loginMutation.error && (
              <div className="text-sm text-destructive font-medium">
                {loginMutation.error.message || "Invalid credentials"}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full text-lg h-12 shadow-md hover-elevate"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Take your seat
            </Button>
          </form>

          <div className="mt-8 space-y-4 p-4 bg-secondary/50 rounded-lg border border-border/50 text-sm">
            <p className="font-medium text-foreground text-center mb-2">Available Credentials</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 p-3 bg-background rounded-md shadow-sm">
                <div className="font-serif font-bold text-center border-b pb-1 mb-2">White Player</div>
                <div className="flex justify-between"><span className="text-muted-foreground">User:</span> <span className="font-mono font-bold">white</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pass:</span> <span className="font-mono font-bold">white123</span></div>
              </div>
              <div className="space-y-1 p-3 bg-background rounded-md shadow-sm border-t-2 border-t-foreground">
                <div className="font-serif font-bold text-center border-b pb-1 mb-2">Black Player</div>
                <div className="flex justify-between"><span className="text-muted-foreground">User:</span> <span className="font-mono font-bold">black</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pass:</span> <span className="font-mono font-bold">black123</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
