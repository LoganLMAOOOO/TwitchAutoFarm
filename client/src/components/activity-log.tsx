import { Button } from "@/components/ui/button";
import { Log } from "@shared/schema";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLogProps {
  logs: Log[];
  isLoading: boolean;
  limit?: number;
}

export default function ActivityLog({ logs, isLoading, limit = 5 }: ActivityLogProps) {
  const displayLogs = logs.slice(0, limit);

  const getStatusClass = (status: string) => {
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <Link to="/logs" className="text-primary hover:text-opacity-80 text-sm font-medium">
          View All
        </Link>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto scrollbar-styled">
          <table className="w-full text-sm">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Time</th>
                <th className="text-left py-3 px-4 font-medium">Account</th>
                <th className="text-left py-3 px-4 font-medium">Channel</th>
                <th className="text-left py-3 px-4 font-medium">Event</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-accent">
                    <td className="py-2 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-2 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-2 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-2 px-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="py-2 px-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                  </tr>
                ))
              ) : displayLogs.length > 0 ? (
                displayLogs.map(log => (
                  <tr key={log.id} className="hover:bg-accent">
                    <td className="py-2 px-4 font-mono text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">{log.accountName}</td>
                    <td className="py-2 px-4">{log.channelName}</td>
                    <td className="py-2 px-4">{log.event}</td>
                    <td className="py-2 px-4">
                      <span className={getStatusClass(log.status)}>
                        <span className="capitalize">{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No activity logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
