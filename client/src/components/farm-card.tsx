import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { formatTimeDuration } from "@/lib/time-utils";
import { Farm } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FarmCardProps {
  farm: Farm & { accountName: string };
  onUpdate: () => void;
  onDelete: () => void;
}

export default function FarmCard({ farm, onUpdate, onDelete }: FarmCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const updateFarmMutation = useMutation({
    mutationFn: async (data: Partial<Farm>) => {
      return apiRequest("PATCH", `/api/farms/${farm.id}`, data);
    },
    onSuccess: () => {
      onUpdate();
      toast({
        title: "Farm updated",
        description: "The farm has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update farm",
        variant: "destructive",
      });
    }
  });
  
  const deleteFarmMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/farms/${farm.id}`);
    },
    onSuccess: () => {
      onDelete();
      toast({
        title: "Farm deleted",
        description: "The farm has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete farm",
        variant: "destructive",
      });
    }
  });
  
  const handleToggleFeature = (feature: keyof typeof farm.features) => {
    const updatedFeatures = {
      ...farm.features,
      [feature]: !farm.features[feature]
    };
    
    updateFarmMutation.mutate({ features: updatedFeatures });
  };
  
  const getStatusIndicator = () => {
    switch (farm.status) {
      case "active":
        return <span className="w-3 h-3 bg-success rounded-full mr-2"></span>;
      case "warning":
        return <span className="w-3 h-3 bg-warning rounded-full mr-2"></span>;
      case "error":
        return <span className="w-3 h-3 bg-destructive rounded-full mr-2"></span>;
      default:
        return <span className="w-3 h-3 bg-border rounded-full mr-2"></span>;
    }
  };
  
  return (
    <>
      <Card className="bg-card border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <div className="relative">
              {farm.profileImage ? (
                <img src={farm.profileImage} alt={farm.channelName} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  {farm.channelName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                farm.status === "active" ? "bg-success" : 
                farm.status === "warning" ? "bg-warning" : 
                farm.status === "error" ? "bg-destructive" : "bg-border"
              } rounded-full border-2 border-card`}></div>
            </div>
            <div className="ml-3">
              <h3 className="font-medium">{farm.channelName}</h3>
              <p className="text-xs text-muted-foreground">via {farm.accountName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {getStatusIndicator()}
              <span className="text-sm font-medium capitalize">{farm.status}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Uptime: {formatTimeDuration(farm.uptime)}
            </span>
          </div>
          
          {farm.status === "warning" && (
            <div className="bg-warning bg-opacity-10 text-warning text-sm p-2 rounded mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              Stream is offline but farm is still running
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Points Claimed</p>
              <p className="font-medium">{farm.pointsClaimed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Watch Time</p>
              <p className="font-medium">{formatTimeDuration(farm.watchTime, 'verbose')}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Features</p>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3">
            <div className="flex items-center">
              <Label className="inline-flex items-center cursor-pointer">
                <Switch
                  checked={farm.features.claimPoints}
                  onCheckedChange={() => handleToggleFeature('claimPoints')}
                  className="mr-2"
                />
                <span className="text-sm">Claim Points</span>
              </Label>
            </div>
            
            <div className="flex items-center">
              <Label className="inline-flex items-center cursor-pointer">
                <Switch
                  checked={farm.features.watchTime}
                  onCheckedChange={() => handleToggleFeature('watchTime')}
                  className="mr-2"
                />
                <span className="text-sm">Watch Time</span>
              </Label>
            </div>
            
            <div className="flex items-center">
              <Label className="inline-flex items-center cursor-pointer">
                <Switch
                  checked={farm.features.predictions}
                  onCheckedChange={() => handleToggleFeature('predictions')}
                  className="mr-2"
                />
                <span className="text-sm">Predictions</span>
              </Label>
            </div>
            
            <div className="flex items-center">
              <Label className="inline-flex items-center cursor-pointer">
                <Switch
                  checked={farm.features.claimDrops}
                  onCheckedChange={() => handleToggleFeature('claimDrops')}
                  className="mr-2"
                />
                <span className="text-sm">Claim Drops</span>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop farming on channel "{farm.channelName}" and remove it from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteFarmMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
