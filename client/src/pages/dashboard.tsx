import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import StatCard from "@/components/stat-card";
import FarmCard from "@/components/farm-card";
import ActivityLog from "@/components/activity-log";
import AddAccountModal from "@/components/modals/add-account-modal";
import AddFarmModal from "@/components/modals/add-farm-modal";
import OptimizationWizard from "@/components/optimization-wizard";
import { apiRequest } from "@/lib/api";
import { formatTimeDuration } from "@/lib/time-utils";
import { Farm, Log, Account } from "@shared/schema";
import { PlusIcon, RotateCwIcon, MonitorIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExtendedFarm extends Farm {
  accountName: string;
}

export default function Dashboard() {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isAddFarmModalOpen, setIsAddFarmModalOpen] = useState(false);
  const [isOptimizationWizardOpen, setIsOptimizationWizardOpen] = useState(false);

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
  
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
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
    <div className="flex h-screen overflow-hidden bg-[#0E0E10]">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#1F1F23] border-b border-[#323238] h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <h2 className="text-lg font-medium bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent">Dashboard</h2>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleRefreshAllFarms}
              disabled={refreshFarmsMutation.isPending}
              className="text-xs md:text-sm bg-[#26262C] hover:bg-[#3A3A3D] border-[#323238]"
            >
              <RotateCwIcon className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Button 
              onClick={() => setIsAddAccountModalOpen(true)}
              className="text-xs md:text-sm bg-[#9146FF] hover:bg-[#772CE8] text-white"
            >
              <PlusIcon className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Add Account</span>
              <span className="inline sm:hidden">Account</span>
            </Button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:p-6 scrollbar-styled">
          {/* One-Click Optimization Banner */}
          <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-[#18181B] to-[#1F1F23] border-2 border-[#4B4B56] rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-5">
              <div className="w-full h-full bg-[#9146FF] rounded-full blur-3xl transform -translate-x-1/2"></div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between relative">
              <div className="mb-4 md:mb-0 md:mr-8">
                <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent mb-2">
                  One-Click Optimization
                </h3>
                <p className="text-sm text-white max-w-xl">
                  Automatically configure your farms for maximum point collection and prediction success
                  based on proven strategies.
                </p>
              </div>
              
              <Button 
                onClick={() => setIsOptimizationWizardOpen(true)}
                className="bg-[#9146FF] hover:bg-[#772CE8] text-white font-medium flex items-center px-4 py-2 h-auto min-w-[140px] justify-center shadow-md"
                disabled={!accounts || accounts.length === 0}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Optimize Now
              </Button>
            </div>
            
            {(!accounts || accounts.length === 0) && (
              <p className="text-xs text-white mt-2">
                Add at least one account to enable optimization
              </p>
            )}
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
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
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent">
                Active Farms
              </h2>
              <button 
                className="text-[#9146FF] hover:text-[#772CE8] text-sm font-medium flex items-center"
                onClick={() => setIsAddFarmModalOpen(true)}
              >
                <PlusIcon className="mr-1 h-4 w-4" /> 
                <span className="hidden sm:inline">Add Farm</span>
                <span className="inline sm:hidden">Add</span>
              </button>
            </div>
            
            {isLoadingFarms ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-[#1F1F23] animate-pulse border border-[#323238] rounded-lg h-48 md:h-64"></div>
                ))}
              </div>
            ) : farms && farms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="bg-[#1F1F23] border border-[#323238] rounded-lg p-6 md:p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#26262C] flex items-center justify-center">
                  <MonitorIcon className="h-8 w-8 text-[#9146FF]" />
                </div>
                <p className="text-[#ADADB8] mb-4">No active farms found</p>
                <Button 
                  onClick={() => setIsAddFarmModalOpen(true)}
                  className="bg-[#9146FF] hover:bg-[#772CE8] text-white"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Your First Farm
                </Button>
              </div>
            )}
          </div>
          
          {/* Activity Log Section */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent">
              Recent Activity
            </h2>
            <ActivityLog logs={logs || []} isLoading={isLoadingLogs} />
          </div>
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
      
      <OptimizationWizard
        isOpen={isOptimizationWizardOpen}
        onClose={() => setIsOptimizationWizardOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/farms'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
        }}
        accounts={accounts || []}
      />
    </div>
  );
}
