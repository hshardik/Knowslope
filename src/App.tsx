import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import KnowSlope from "./pages/KnowSlope";
import NewDocWizard from "./pages/NewDocWizard";
import DocumentDetail from "./pages/DocumentDetail";
import DocumentEdit from "./pages/DocumentEdit";
import Settings from "./pages/Settings";
import SlackSetup from "./pages/SlackSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected app routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowslope"
              element={
                <ProtectedRoute>
                  <KnowSlope />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowslope/new"
              element={
                <ProtectedRoute>
                  <NewDocWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowslope/:id"
              element={
                <ProtectedRoute>
                  <DocumentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowslope/:id/edit"
              element={
                <ProtectedRoute>
                  <DocumentEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/slack-setup"
              element={
                <ProtectedRoute>
                  <SlackSetup />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
