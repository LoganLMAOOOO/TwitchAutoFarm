import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import StatCard from "@/components/stat-card";
import FarmCard from "@/components/farm-card";
import ActivityLog from "@/components/activity-log";
import AddAccountModal from "@/components/modals/add-account-modal";
import AddFarmModal from "@/components/modals/add-farm-modal";
import { apiRequest } from "@/lib/api";
import { formatTimeDuration } from "@/lib/time-utils";
import { Farm, Log } from "@shared/schema";
import { PlusIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExtendedFarm extends Farm {
  accountName: string;
}

export default function Dashboard() {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isAddFarmModalOpen, setIsAddFarmModalOpen] = useState(false);

  // Fetch data
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: farms, isLoading: isLoadingFarms } = useQuery<ExtendedFarm[]>({
    queryKey: ['/api/farms'],
  });

  const { data: logs, isLoading: isLoadingLogs } = useQuery<Log[]>({
    queryKey: ['/api/logs'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/logs?limit=5");
      return res.json();
    }
  });

  // Mutations
  const refreshFarmsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("GET", "/api/farms");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/farms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    }
  });

  const handleRefreshAllFarms = () => {
    refreshFarmsMutation.mutate();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">Dashboard</h2>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleRefreshAllFarms}
              disabled={refreshFarmsMutation.isPending}
            >
              <RotateCwIcon className="mr-2 h-4 w-4" />
              Refresh All
            </Button>
            
            <Button onClick={() => setIsAddAccountModalOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-styled">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Active Farms"
              value={isLoadingStats ? "..." : stats?.activeFarms?.toString() || "0"}
              icon="farm"
              change={stats?.changes?.farmsChange}
              loading={isLoadingStats}
            />
            
            <StatCard 
              title="Points Claimed Today"
              value={isLoadingStats ? "..." : (stats?.pointsClaimed?.toLocaleString() || "0")}
              icon="points"
              change={stats?.changes?.pointsClaimedChange}
              loading={isLoadingStats}
            />
            
            <StatCard 
              title="Watch Hours Today"
              value={isLoadingStats ? "..." : (stats?.watchHours?.toString() || "0")}
              icon="time"
              change={stats?.changes?.watchHoursChange}
              loading={isLoadingStats}
            />
            
            <StatCard 
              title="Prediction Success"
              value={isLoadingStats ? "..." : `${stats?.predictionRate || 0}%`}
              icon="prediction"
              change={stats?.changes?.predictionRateChange}
              loading={isLoadingStats}
            />
          </div>
          
          {/* Active Farms Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Active Farms</h2>
              <button 
                className="text-primary hover:text-opacity-80 text-sm font-medium"
                onClick={() => setIsAddFarmModalOpen(true)}
              >
                <PlusIcon className="inline-block mr-1 h-4 w-4" /> Add Farm
              </button>
            </div>
            
            {isLoadingFarms ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-card animate-pulse border border-border rounded-lg h-64"></div>
                ))}
              </div>
            ) : farms && farms.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {farms.map(farm => (
                  <FarmCard 
                    key={farm.id} 
                    farm={farm}
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/farms'] })}
                    onDelete={() => queryClient.invalidateQueries({ queryKey: ['/api/farms'] })}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">No active farms found</p>
                <Button onClick={() => setIsAddFarmModalOpen(true)}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Your First Farm
                </Button>
              </div>
            )}
          </div>
          
          {/* Activity Log Section */}
          <ActivityLog logs={logs || []} isLoading={isLoadingLogs} />
        </main>
      </div>
      
      {/* Modals */}
      <AddAccountModal 
        isOpen={isAddAccountModalOpen} 
        onClose={() => setIsAddAccountModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/accounts'] })}
      />
      
      <AddFarmModal 
        isOpen={isAddFarmModalOpen} 
        onClose={() => setIsAddFarmModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/farms'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        }}
      />
    </div>
  );
}
