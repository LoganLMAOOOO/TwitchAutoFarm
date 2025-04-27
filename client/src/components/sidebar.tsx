import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  TwitchIcon, 
  LayoutDashboardIcon, 
  UsersIcon, 
  MonitorIcon, 
  TrendingUpIcon, 
  ListIcon, 
  SettingsIcon, 
  LogOutIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobile && isOpen && !(e.target as Element).closest('.sidebar')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMobile, isOpen]);
  
  // Close sidebar after navigation on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Navigation items
  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboardIcon className="w-5" /> },
    { path: "/accounts", label: "Accounts", icon: <UsersIcon className="w-5" /> },
    { path: "/channels", label: "Channels", icon: <MonitorIcon className="w-5" /> },
    { path: "/predictions", label: "Predictions", icon: <TrendingUpIcon className="w-5" /> },
    { path: "/logs", label: "Activity Logs", icon: <ListIcon className="w-5" /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon className="w-5" /> },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <span className="text-[#9146FF] text-2xl mr-2">
            <TwitchIcon size={24} />
          </span>
          <h1 className="font-bold text-xl bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent">TwitchFarm</h1>
        </div>
        <p className="text-muted-foreground text-xs mt-1">Automation Dashboard</p>
      </div>
      
      <nav className="flex-1 pt-4 pb-4">
        <ScrollArea className="h-[calc(100vh-140px)]">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md transition-colors duration-200",
                    location.pathname === item.path
                      ? "text-white bg-gradient-to-r from-[#9146FF] to-[#772CE8] font-medium"
                      : "text-muted-foreground hover:bg-[#26262C] hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {user?.user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="ml-2 text-sm font-medium">
              {user?.user?.username || "User"}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground" 
            onClick={handleLogout}
          >
            <LogOutIcon size={18} />
          </Button>
        </div>
      </div>
    </>
  );

  // Mobile toggle button
  const mobileToggle = isMobile && (
    <button
      className="fixed top-4 left-4 z-50 p-2 bg-card rounded-md border border-border shadow-lg text-[#9146FF] hover:bg-[#26262C] transition-colors duration-200"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      )}
    </button>
  );

  return (
    <>
      {mobileToggle}
      <div 
        className={cn(
          "sidebar w-64 h-full bg-card border-r border-border flex flex-col z-40",
          isMobile && "fixed transition-transform duration-200 ease-in-out",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
