import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [isPredictionEnabled, setIsPredictionEnabled] = useState(true);
  const [isAutoClaimEnabled, setIsAutoClaimEnabled] = useState(true);
  const [isWatchTimeEnabled, setIsWatchTimeEnabled] = useState(true);
  const [maxPointsAllocationPercentage, setMaxPointsAllocationPercentage] = useState(30);
  
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      defaultPredictionStrategy: "majority",
      defaultMaxPointsPerPrediction: "1000",
      autoRefreshInterval: "5",
      logRetentionDays: "30"
    }
  });
  
  const onSubmit = (data: any) => {
    console.log(data);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  const handleReset = () => {
    form.reset();
    setIsPredictionEnabled(true);
    setIsAutoClaimEnabled(true);
    setIsWatchTimeEnabled(true);
    setMaxPointsAllocationPercentage(30);
    
    toast({
      title: "Settings reset",
      description: "Your settings have been reset to defaults.",
    });
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">Settings</h2>
        </header>
        
        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-styled">
          <div className="max-w-4xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* General Settings */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure the behavior of the TwitchFarm application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-claim" className="flex flex-col space-y-1">
                        <span>Auto-claim Channel Points</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Automatically claim bonus points when available
                        </span>
                      </Label>
                      <Switch
                        id="auto-claim"
                        checked={isAutoClaimEnabled}
                        onCheckedChange={setIsAutoClaimEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="watch-time" className="flex flex-col space-y-1">
                        <span>Track Watch Time</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Accumulate watch minutes for channel rewards
                        </span>
                      </Label>
                      <Switch
                        id="watch-time"
                        checked={isWatchTimeEnabled}
                        onCheckedChange={setIsWatchTimeEnabled}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="autoRefreshInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auto-refresh Interval (minutes)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select interval" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 minute</SelectItem>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="10">10 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often the dashboard will refresh data
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                {/* Prediction Settings */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Prediction Settings</CardTitle>
                    <CardDescription>Configure how the prediction system behaves</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="predictions" className="flex flex-col space-y-1">
                        <span>Enable Predictions</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Automatically participate in channel predictions
                        </span>
                      </Label>
                      <Switch
                        id="predictions"
                        checked={isPredictionEnabled}
                        onCheckedChange={setIsPredictionEnabled}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="defaultPredictionStrategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Prediction Strategy</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!isPredictionEnabled}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="random">Random Choice</SelectItem>
                              <SelectItem value="majority">Follow Majority</SelectItem>
                              <SelectItem value="percentage">Percentage-based</SelectItem>
                              <SelectItem value="custom">Custom Logic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The default strategy to use for new channel farms
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="defaultMaxPointsPerPrediction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Max Points Per Prediction</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              disabled={!isPredictionEnabled}
                            />
                          </FormControl>
                          <FormDescription>
                            The default maximum points to bet on a prediction
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>
                          Max Points Allocation (% of available points)
                        </Label>
                        <span>{maxPointsAllocationPercentage}%</span>
                      </div>
                      <Slider
                        value={[maxPointsAllocationPercentage]}
                        onValueChange={(values) => setMaxPointsAllocationPercentage(values[0])}
                        min={5}
                        max={100}
                        step={5}
                        disabled={!isPredictionEnabled}
                      />
                      <p className="text-sm text-muted-foreground">
                        Maximum percentage of available points to use for predictions
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Advanced Settings */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Configure advanced behavior of the application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="logRetentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Log Retention Period (days)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long to keep activity logs before automatic deletion
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" onClick={handleReset}>
                    Reset to Defaults
                  </Button>
                  <Button type="submit">
                    Save Settings
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </div>
  );
}
