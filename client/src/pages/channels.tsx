import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import AddFarmModal from "@/components/modals/add-farm-modal";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Farm } from "@shared/schema";
import { formatTimeDuration } from "@/lib/time-utils";
import { queryClient } from "@/lib/queryClient";

interface ExtendedFarm extends Farm {
  accountName: string;
}

export default function Channels() {
  const [isAddFarmModalOpen, setIsAddFarmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: farms, isLoading } = useQuery<ExtendedFarm[]>({
    queryKey: ['/api/farms'],
  });

  const filteredFarms = farms?.filter(farm => 
    farm.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIndicatorClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "error":
        return "bg-destructive";
      default:
        return "bg-border";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">Channel Farms</h2>
          
          <Button onClick={() => setIsAddFarmModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Farm
          </Button>
        </header>
        
        {/* Channels Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-styled">
          {/* Search */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels or accounts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Channel List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-card animate-pulse border border-border rounded-lg h-48"></div>
              ))
            ) : filteredFarms && filteredFarms.length > 0 ? (
              filteredFarms.map(farm => (
                <Card key={farm.id} className="bg-card border-border overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        {farm.profileImage ? (
                          <img 
                            src={farm.profileImage} 
                            alt={farm.channelName} 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            {farm.channelName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div 
                          className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusIndicatorClass(farm.status)} rounded-full border-2 border-card`}
                        ></div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{farm.channelName}</CardTitle>
                        <p className="text-xs text-muted-foreground">via {farm.accountName}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 ${getStatusIndicatorClass(farm.status)} rounded-full mr-2`}></span>
                          <span className="capitalize">{farm.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uptime:</span>
                        <span>{formatTimeDuration(farm.uptime)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Points Claimed:</span>
                        <span>{farm.pointsClaimed.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Features:</span>
                        <span className="text-sm">
                          {Object.entries(farm.features)
                            .filter(([_, enabled]) => enabled)
                            .length} / 4
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No channels matched your search" : "No channel farms found"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddFarmModalOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Your First Channel
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Add Farm Modal */}
      <AddFarmModal 
        isOpen={isAddFarmModalOpen} 
        onClose={() => setIsAddFarmModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/farms'] })}
      />
    </div>
  );
}
