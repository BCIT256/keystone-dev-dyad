import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNavigator from "./navigation/AppNavigator";
import { PageLoader } from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

const Index = lazy(() => import("./pages/Index"));
const SettingsScreen = lazy(() => import("./pages/SettingsScreen"));
const PurchaseScreen = lazy(() => import("./pages/PurchaseScreen"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<AppNavigator />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/settings" element={<SettingsScreen />} />
                </Route>
                <Route path="/purchase" element={<PurchaseScreen />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;