import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, "Account name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  authType: z.enum(["cookie", "oauth"]),
  authCredentials: z.string().min(5, "Authentication credentials are required"),
  remember: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      authType: "cookie",
      authCredentials: "",
      remember: false,
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest("POST", "/api/accounts", data);
    },
    onSuccess: () => {
      toast({
        title: "Account added",
        description: "Your Twitch account has been added successfully.",
      });
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add account",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    createAccountMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1F1F23] border-[#323238] max-w-md p-4 md:p-6 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#9146FF] to-[#772CE8] bg-clip-text text-transparent">
            Add Twitch Account
          </DialogTitle>
          <DialogDescription className="text-[#ADADB8]">
            Enter your Twitch account details to start farming
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#EFEFF1]">Account Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Display name for this account"
                      className="bg-[#26262C] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] placeholder:text-[#7D7D8E]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#EFEFF1]">Twitch Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your Twitch username" 
                      className="bg-[#26262C] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] placeholder:text-[#7D7D8E]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#EFEFF1]">Authentication Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#26262C] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] focus:ring-[#9146FF]">
                        <SelectValue placeholder="Select auth method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#18181B] border-[#323238] text-[#EFEFF1]">
                      <SelectItem value="cookie" className="hover:bg-[#26262C] hover:text-white focus:bg-[#9146FF]">Cookie Authentication</SelectItem>
                      <SelectItem value="oauth" className="hover:bg-[#26262C] hover:text-white focus:bg-[#9146FF]">OAuth Token</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authCredentials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#EFEFF1]">Authentication Credentials</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Paste your authentication cookie or token here"
                      className="bg-[#26262C] border-[#323238] text-[#EFEFF1] focus:border-[#9146FF] placeholder:text-[#7D7D8E] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-[#ADADB8] mt-1">
                    Your credentials are stored securely and only used to connect to Twitch.
                  </p>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-[#323238] data-[state=checked]:bg-[#9146FF] data-[state=checked]:border-[#9146FF]"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-[#EFEFF1]">Remember this account</FormLabel>
                  </div>
                </FormItem>
              )}
            />

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
                disabled={isLoading}
                className="bg-[#9146FF] hover:bg-[#772CE8] text-white flex-1 sm:flex-none"
              >
                {isLoading ? "Adding..." : "Add Account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
