import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Account } from "@shared/schema";
import { AlertCircle, Check, ChevronRight, Sparkles, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface OptimizationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
}

export default function OptimizationWizard({
  isOpen,
  onClose,
  onSuccess,
  accounts,
}: OptimizationWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<
    "balanced" | "aggressive" | "conservative" | "custom"
  >("balanced");
  const [progress, setProgress] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const { toast } = useToast();

  // Reset state when modal opens
  const resetState = () => {
    setStep(1);
    setSelectedPreset("balanced");
    setProgress(0);
    setOptimizing(false);
  };

  // Optimization mutation
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const simulatedData = {
        preset: selectedPreset,
        accountsCount: accounts.length,
        // Additional metadata would go here in a real implementation
      };
      
      return apiRequest("POST", "/api/optimize", simulatedData);
    },
    onSuccess: () => {
      toast({
        title: "Optimization Complete",
        description: "Your farms have been optimized successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/farms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description:
          error instanceof Error ? error.message : "Failed to optimize farms",
        variant: "destructive",
      });
    },
  });

  // Handle preset selection
  const handleSelectPreset = (preset: "balanced" | "aggressive" | "conservative" | "custom") => {
    setSelectedPreset(preset);
  };

  // Handle optimization start
  const handleStartOptimization = () => {
    setStep(3);
    setOptimizing(true);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Wait a moment at 100% before completing
          setTimeout(() => {
            optimizeMutation.mutate();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  // Preset descriptions and configs
  const presets = {
    balanced: {
      title: "Balanced",
      description: "Optimized for steady point gain with moderate risk in predictions",
      config: {
        pointsWeight: 60,
        predictionWeight: 40,
        maxBetPercentage: 30,
        channelsPerAccount: 5,
      },
      icon: <Sparkles className="h-6 w-6 text-[#9146FF]" />,
    },
    aggressive: {
      title: "Aggressive",
      description: "Maximizes point gain with higher risk in predictions",
      config: {
        pointsWeight: 40,
        predictionWeight: 60,
        maxBetPercentage: 70,
        channelsPerAccount: 8,
      },
      icon: <Zap className="h-6 w-6 text-[#9146FF]" />,
    },
    conservative: {
      title: "Conservative",
      description: "Focuses on safe point collection with minimal risk",
      config: {
        pointsWeight: 80,
        predictionWeight: 20,
        maxBetPercentage: 10,
        channelsPerAccount: 3,
      },
      icon: <Check className="h-6 w-6 text-[#9146FF]" />,
    },
    custom: {
      title: "Custom",
      description: "Manually configure all parameters",
      config: {
        pointsWeight: 50,
        predictionWeight: 50,
        maxBetPercentage: 50,
        channelsPerAccount: 5,
      },
      icon: <AlertCircle className="h-6 w-6 text-[#9146FF]" />,
    },
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
        if (open) resetState();
      }}
    >
      <DialogContent className="bg-[#1F1F23] border-[#323238] max-w-xl p-0 rounded-xl shadow-xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent">
            Channel Point Optimization Wizard
          </DialogTitle>
          <DialogDescription className="text-[#ADADB8]">
            Automatically optimize your farms for maximum point collection and prediction success
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="px-6 py-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-[#EFEFF1] mb-2">Select Optimization Preset</h3>
              <p className="text-sm text-[#ADADB8] mb-4">
                Choose a preset that matches your farming strategy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.entries(presets).map(([key, preset]) => (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className={`bg-[#26262C] border-2 hover:bg-[#3A3A3D] transition-colors cursor-pointer overflow-hidden ${
                          selectedPreset === key 
                            ? 'border-[#9146FF] shadow-[0_0_10px_rgba(145,70,255,0.3)]' 
                            : 'border-[#4B4B56] hover:border-[#626267]'
                        }`}
                        onClick={() => handleSelectPreset(key as any)}
                      >
                        <CardHeader className="py-3 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-white">{preset.title}</CardTitle>
                          </div>
                          {preset.icon}
                        </CardHeader>
                        <CardContent className="py-2">
                          <CardDescription className="text-[#EFEFF1]">
                            {preset.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#18181B] border-2 border-[#4B4B56] text-white p-4 shadow-lg z-50">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                          <span className="text-[#ADADB8]">Points Weight:</span>
                          <span className="font-mono text-white">{preset.config.pointsWeight}%</span>
                          
                          <span className="text-[#ADADB8]">Prediction Weight:</span>
                          <span className="font-mono text-white">{preset.config.predictionWeight}%</span>
                          
                          <span className="text-[#ADADB8]">Max Bet:</span>
                          <span className="font-mono text-white">{preset.config.maxBetPercentage}%</span>
                          
                          <span className="text-[#ADADB8]">Channels/Account:</span>
                          <span className="font-mono text-white">{preset.config.channelsPerAccount}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-[#ADADB8]">
                {accounts.length} account{accounts.length === 1 ? '' : 's'} will be optimized
              </p>
              <Button 
                onClick={() => setStep(2)}
                className="bg-[#9146FF] hover:bg-[#772CE8] text-white"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#EFEFF1] mb-2">Optimization Preview</h3>
              <p className="text-sm text-[#ADADB8]">
                Here's how your farms will be configured with the {presets[selectedPreset].title} preset
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <Card className="bg-[#26262C] border-2 border-[#4B4B56] shadow-md">
                <CardHeader className="py-3">
                  <CardTitle className="text-white text-base">Account Configuration</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <ul className="space-y-2 text-sm text-white">
                    <li className="flex justify-between">
                      <span className="text-[#ADADB8]">Accounts to optimize:</span>
                      <span className="font-semibold text-white">{accounts.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#ADADB8]">Total channels to farm:</span>
                      <span className="font-semibold text-white">
                        {accounts.length * presets[selectedPreset].config.channelsPerAccount}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#ADADB8]">Channels per account:</span>
                      <span className="font-semibold text-white">
                        {presets[selectedPreset].config.channelsPerAccount}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#26262C] border-2 border-[#4B4B56] shadow-md">
                <CardHeader className="py-3">
                  <CardTitle className="text-white text-base">Point Strategy</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <ul className="space-y-2 text-sm text-white">
                    <li className="flex justify-between">
                      <span className="text-[#ADADB8]">Point claiming priority:</span>
                      <span className="font-semibold text-white">
                        {presets[selectedPreset].config.pointsWeight}%
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#ADADB8]">Prediction strategy:</span>
                      <span className="font-semibold text-white">
                        {selectedPreset === 'aggressive' ? 'High Risk/Reward' : 
                         selectedPreset === 'conservative' ? 'Low Risk' : 'Balanced'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#ADADB8]">Max bet per prediction:</span>
                      <span className="font-semibold text-white">
                        {presets[selectedPreset].config.maxBetPercentage}% of balance
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex sm:justify-between justify-center gap-3 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="bg-transparent text-[#EFEFF1] border-[#323238] hover:bg-[#26262C] flex-1 sm:flex-none min-w-[100px]"
              >
                Back
              </Button>
              <Button 
                onClick={handleStartOptimization}
                className="bg-[#9146FF] hover:bg-[#772CE8] text-white flex-1 sm:flex-none min-w-[180px]"
              >
                Start Optimization
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="px-6 py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#EFEFF1] mb-2">Optimizing Your Farms</h3>
              <p className="text-sm text-[#ADADB8] mb-4">
                Please wait while we configure your farms for optimal performance
              </p>
            </div>

            <div className="space-y-6 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#ADADB8]">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-[#26262C]" indicatorClassName="bg-[#9146FF]" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${progress >= 20 ? 'bg-[#9146FF]' : 'bg-[#26262C]'}`}>
                    {progress >= 20 && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={progress >= 20 ? 'text-white font-medium' : 'text-[#ADADB8]'}>
                    Analyzing accounts
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${progress >= 40 ? 'bg-[#9146FF] shadow-md border border-[#9146FF]' : 'bg-[#26262C] border border-[#4B4B56]'}`}>
                    {progress >= 40 && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={progress >= 40 ? 'text-white font-medium' : 'text-[#ADADB8]'}>
                    Selecting optimal channels
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${progress >= 60 ? 'bg-[#9146FF] shadow-md border border-[#9146FF]' : 'bg-[#26262C] border border-[#4B4B56]'}`}>
                    {progress >= 60 && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={progress >= 60 ? 'text-white font-medium' : 'text-[#ADADB8]'}>
                    Configuring prediction strategies
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${progress >= 80 ? 'bg-[#9146FF] shadow-md border border-[#9146FF]' : 'bg-[#26262C] border border-[#4B4B56]'}`}>
                    {progress >= 80 && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={progress >= 80 ? 'text-white font-medium' : 'text-[#ADADB8]'}>
                    Setting up point collection timers
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${progress >= 100 ? 'bg-[#9146FF] shadow-md border border-[#9146FF]' : 'bg-[#26262C] border border-[#4B4B56]'}`}>
                    {progress >= 100 && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={progress >= 100 ? 'text-white font-medium' : 'text-[#ADADB8]'}>
                    Finalizing optimization
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={!optimizeMutation.isSuccess && optimizing}
                className="bg-transparent text-[#EFEFF1] border-[#323238] hover:bg-[#26262C] min-w-[100px] shadow-md"
              >
                {optimizeMutation.isSuccess ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}