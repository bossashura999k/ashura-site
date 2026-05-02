import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Game from "@/pages/game";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe({
    query: { retry: false, queryKey: getGetMeQueryKey() },
  });
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user && location !== "/login") {
        setLocation("/login");
      }
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return <>{children}</>;
}

function RedirectToRoot() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/");
  }, [setLocation]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/index.html" component={RedirectToRoot} />
      <Route path="/">
        <AuthGuard>
          <Game />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;