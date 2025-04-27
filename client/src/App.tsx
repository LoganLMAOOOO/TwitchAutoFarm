import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/lib/ThemeProvider";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Accounts from "@/pages/accounts";
import Channels from "@/pages/channels";
import Predictions from "@/pages/predictions";
import Logs from "@/pages/logs";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "./lib/queryClient";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically redirect to dashboard if on login page
  useEffect(() => {
    if (location.pathname === "/login") {
      navigate("/");
    }
  }, [navigate, location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="dark">
            <Routes>
              <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
