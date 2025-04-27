import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account } from "@shared/schema";

const formSchema = z.object({
  accountId: z.number({
    required_error: "Please select an account",
    invalid_type_error: "Please select a valid account",
  }),
  channelName: z.string().min(2, "Channel name must be at least 2 characters"),
  features: z.object({
    claimPoints: z.boolean().default(true),
    watchTime: z.boolean().default(true),
    predictions: z.boolean().default(true),
    claimDrops: z.boolean().default(false),
  }),
  predictionSettings: z.object({
    strategy: z.enum(["random", "majority", "percentage", "custom"]).default("random"),
    maxPoints: z
      .number()
      .min(100, "Minimum bet must be at least 100 points")
      .default(1000),
    favorableOddsOnly: z.boolean().default(false),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFarmModal({
  isOpen,
  onClose,
  onSuccess,
}: AddFarmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictionSettings, setShowPredictionSettings] = useState(true);
  const { toast } = useToast();

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    enabled: isOpen, // Only fetch when modal is open
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelName: "",
      features: {
        claimPoints: true,
        watchTime: true,
        predictions: true,
        claimDrops: false,
      },
      predictionSettings: {
        strategy: "random",
        maxPoints: 1000,
        favorableOddsOnly: false,
      },
    },
  });

  // Watch for changes to the predictions feature toggle
  const watchPrediction = form.watch("features.predictions");
  
  useEffect(() => {
    setShowPredictionSettings(watchPrediction);
  }, [watchPrediction]);

  // Set account ID when accounts are loaded (if none is selected yet)
  useEffect(() => {
    if (accounts && accounts.length > 0 && !form.getValues("accountId")) {
      form.setValue("accountId", accounts[0].id);
    }
  }, [accounts, form]);

  const createFarmMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest("POST", "/api/farms", data);
    },
    onSuccess: () => {
      toast({
        title: "Farm created",
        description: "Your Twitch farm has been created successfully.",
      });
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create farm",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    createFarmMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1F1F23] border-[#323238] max-w-md p-4 md:p-6 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent">
            Add New Farm
          </DialogTitle>
          <DialogDescription className="text-[#ADADB8]">
            Configure a new auto-farming channel
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#EFEFF1]">Account</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#26262C] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] focus:ring-[#9146FF]">
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#18181B] border-[#323238] text-[#EFEFF1]">
                      {accounts && accounts.length > 0 ? (
                        accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()} className="hover:bg-[#26262C] hover:text-white focus:bg-[#9146FF]">
                            {account.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled className="text-[#7D7D8E]">
                          No accounts available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#EFEFF1]">Channel Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. pokimane" 
                      className="bg-[#26262C] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] placeholder:text-[#7D7D8E]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel className="text-[#EFEFF1]">Features to Enable</FormLabel>
              
              <FormField
                control={form.control}
                name="features.claimPoints"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-[#323238] data-[state=checked]:bg-[#9146FF] data-[state=checked]:border-[#9146FF]"
                      />
                    </FormControl>
                    <FormLabel className="text-[#EFEFF1] font-normal cursor-pointer">
                      Claim Channel Points
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="features.watchTime"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-[#323238] data-[state=checked]:bg-[#9146FF] data-[state=checked]:border-[#9146FF]"
                      />
                    </FormControl>
                    <FormLabel className="text-[#EFEFF1] font-normal cursor-pointer">
                      Accumulate Watch Time
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="features.predictions"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-[#323238] data-[state=checked]:bg-[#9146FF] data-[state=checked]:border-[#9146FF]"
                      />
                    </FormControl>
                    <FormLabel className="text-[#EFEFF1] font-normal cursor-pointer">
                      Participate in Predictions
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="features.claimDrops"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-[#323238] data-[state=checked]:bg-[#9146FF] data-[state=checked]:border-[#9146FF]"
                      />
                    </FormControl>
                    <FormLabel className="text-[#EFEFF1] font-normal cursor-pointer">
                      Claim Drops
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {showPredictionSettings && (
              <div className="p-4 border border-[#323238] rounded-md bg-[#26262C] space-y-4">
                <p className="text-sm font-medium mb-2 text-[#EFEFF1]">Prediction Settings</p>
                
                <FormField
                  control={form.control}
                  name="predictionSettings.strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#EFEFF1]">Strategy</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-sm bg-[#18181B] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] focus:ring-[#9146FF]">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#18181B] border-[#323238] text-[#EFEFF1]">
                          <SelectItem value="random" className="hover:bg-[#26262C] hover:text-white">Random Choice</SelectItem>
                          <SelectItem value="majority" className="hover:bg-[#26262C] hover:text-white">Follow Majority</SelectItem>
                          <SelectItem value="percentage" className="hover:bg-[#26262C] hover:text-white">Percentage-based</SelectItem>
                          <SelectItem value="custom" className="hover:bg-[#26262C] hover:text-white">Custom Logic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="predictionSettings.maxPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#EFEFF1]">Max Points to Bet</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={100}
                          placeholder="e.g. 5000"
                          className="bg-[#18181B] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] placeholder:text-[#7D7D8E]"
                          {...field}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="predictionSettings.favorableOddsOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-[#323238] data-[state=checked]:bg-[#9146FF] data-[state=checked]:border-[#9146FF]"
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-[#EFEFF1] font-normal cursor-pointer">
                        Only bet if odds are favorable
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="mt-6 flex sm:justify-end justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="bg-transparent text-[#EFEFF1] border-[#323238] hover:bg-[#26262C] hover:text-white flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !accounts || accounts.length === 0}
                className="bg-[#9146FF] hover:bg-[#772CE8] text-white flex-1 sm:flex-none"
              >
                {isLoading ? "Creating..." : "Start Farm"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
