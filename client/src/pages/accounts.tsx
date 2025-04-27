import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import AddAccountModal from "@/components/modals/add-account-modal";
import { apiRequest } from "@/lib/api";
import { Account } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Trash2Icon, Edit2Icon, CheckCircleIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Accounts() {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const { toast } = useToast();

  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Account deleted",
        description: "The account has been successfully removed.",
      });
      setAccountToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    }
  });

  const toggleAccountMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      return apiRequest("PATCH", `/api/accounts/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Account updated",
        description: "The account status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update account",
        variant: "destructive",
      });
    }
  });

  const handleDeleteAccount = (account: Account) => {
    setAccountToDelete(account);
  };

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      deleteAccountMutation.mutate(accountToDelete.id);
    }
  };

  const handleToggleAccount = (account: Account) => {
    toggleAccountMutation.mutate({ id: account.id, active: !account.active });
  };

  const getAuthTypeLabel = (type: string) => {
    switch (type) {
      case "cookie":
        return "Cookie Authentication";
      case "oauth":
        return "OAuth Token";
      default:
        return type;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">Accounts</h2>
          
          <Button onClick={() => setIsAddAccountModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </header>
        
        {/* Accounts Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-styled">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-card animate-pulse border border-border rounded-lg h-48"></div>
              ))
            ) : accounts && accounts.length > 0 ? (
              accounts.map(account => (
                <Card key={account.id} className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold">{account.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                        onClick={() => handleDeleteAccount(account)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Username:</span>
                        <span className="font-medium">{account.username}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Auth Method:</span>
                        <span className="font-medium">{getAuthTypeLabel(account.authType)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <div className="flex items-center">
                          {account.active ? (
                            <CheckCircleIcon className="h-4 w-4 text-success mr-1" />
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-border mr-2" />
                          )}
                          <span className="font-medium">{account.active ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                        <Label htmlFor={`account-active-${account.id}`} className="text-sm">
                          Auto-farming enabled
                        </Label>
                        <Switch
                          id={`account-active-${account.id}`}
                          checked={account.active}
                          onCheckedChange={() => handleToggleAccount(account)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">No accounts found. Add a Twitch account to get started.</p>
                <Button onClick={() => setIsAddAccountModalOpen(true)}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Your First Account
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Add Account Modal */}
      <AddAccountModal 
        isOpen={isAddAccountModalOpen} 
        onClose={() => setIsAddAccountModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/accounts'] })}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!accountToDelete} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the account "{accountToDelete?.name}" and stop all farming activities associated with it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteAccount}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
