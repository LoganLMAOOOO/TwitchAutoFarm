import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/user");
        const data = await res.json();
        
        if (data.user) {
          setIsAuthenticated(true);
          
          // If on login page, redirect to dashboard
          if (location.pathname === "/login") {
            navigate("/");
          }
        } else {
          setIsAuthenticated(false);
          
          // If not on login page, redirect to login
          if (location.pathname !== "/login") {
            navigate("/login");
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        
        // If not on login page, redirect to login
        if (location.pathname !== "/login") {
          navigate("/login");
        }
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname]);

  if (isAuthenticated === null) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen bg-[#18181B] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#9146FF] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
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
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
