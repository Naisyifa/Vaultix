import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated, getAuthToken } from "@/lib/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SuratMasuk from "@/pages/SuratMasuk";
import SuratKeluar from "@/pages/SuratKeluar";
import Kategori from "@/pages/Kategori";
import Filter from "@/pages/Filter";
import Laporan from "@/pages/Laporan";
import Pengaturan from "@/pages/Pengaturan";
import Profil from "@/pages/Profil";
import NotFound from "@/pages/not-found";

// Wire up auth token for all generated API hooks
setAuthTokenGetter(() => getAuthToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => {
        if (isAuthenticated()) return <Redirect to="/dashboard" />;
        return <Redirect to="/login" />;
      }} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/surat-masuk" component={() => <ProtectedRoute component={SuratMasuk} />} />
      <Route path="/surat-keluar" component={() => <ProtectedRoute component={SuratKeluar} />} />
      <Route path="/kategori" component={() => <ProtectedRoute component={Kategori} />} />
      <Route path="/filter" component={() => <ProtectedRoute component={Filter} />} />
      <Route path="/laporan" component={() => <ProtectedRoute component={Laporan} />} />
      <Route path="/pengaturan" component={() => <ProtectedRoute component={Pengaturan} />} />
      <Route path="/profil" component={() => <ProtectedRoute component={Profil} />} />
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
