import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Log } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { SearchIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const { data: logs, isLoading } = useQuery<Log[]>({
    queryKey: ['/api/logs'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/logs?limit=100");
      return res.json();
    }
  });
  
  // Filter logs based on search term and status
  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertTriangleIcon className="h-4 w-4 text-warning" />;
      case "error":
        return <XCircleIcon className="h-4 w-4 text-destructive" />;
      default:
        return <InfoIcon className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "success":
        return "text-success text-xs px-2 py-1 rounded-full bg-success bg-opacity-10";
      case "warning":
        return "text-warning text-xs px-2 py-1 rounded-full bg-warning bg-opacity-10";
      case "error":
        return "text-destructive text-xs px-2 py-1 rounded-full bg-destructive bg-opacity-10";
      default:
        return "text-primary text-xs px-2 py-1 rounded-full bg-primary bg-opacity-10";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">Activity Logs</h2>
        </header>
        
        {/* Logs Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-styled">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Logs Table */}
          <Card className="bg-card border-border">
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-styled">
              <Table>
                <TableHeader className="bg-secondary sticky top-0">
                  <TableRow>
                    <TableHead className="w-[160px]">Time</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="w-[40%]">Event</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredLogs && filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                      <TableRow key={log.id} className="hover:bg-accent">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.accountName}</TableCell>
                        <TableCell>{log.channelName}</TableCell>
                        <TableCell>{log.event}</TableCell>
                        <TableCell>
                          <span className={getStatusClasses(log.status)}>
                            <span className="inline-flex items-center">
                              {getStatusIcon(log.status)}
                              <span className="ml-1 capitalize">{log.status}</span>
                            </span>
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No logs found
                        {searchTerm && " matching your search"}
                        {filterStatus !== "all" && ` with status "${filterStatus}"`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
