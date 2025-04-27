import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart2Icon, TimerIcon, CoinsIcon, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  icon: "farm" | "points" | "time" | "prediction";
  change?: number;
  loading?: boolean;
}

export default function StatCard({ title, value, icon, change, loading = false }: StatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "farm":
        return <Bot className="text-primary" />;
      case "points":
        return <CoinsIcon className="text-success" />;
      case "time":
        return <TimerIcon className="text-warning" />;
      case "prediction":
        return <BarChart2Icon className="text-destructive" />;
    }
  };

  const getIconBgClass = () => {
    switch (icon) {
      case "farm":
        return "bg-primary bg-opacity-10";
      case "points":
        return "bg-success bg-opacity-10";
      case "time":
        return "bg-warning bg-opacity-10";
      case "prediction":
        return "bg-destructive bg-opacity-10";
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    if (change > 0) {
      return <span className="text-success text-xs mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <span>+{change}</span> since yesterday
      </span>;
    } else if (change < 0) {
      return <span className="text-destructive text-xs mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <span>{change}</span> from yesterday
      </span>;
    } else {
      return <span className="text-warning text-xs mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>No change</span> from yesterday
      </span>;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", getIconBgClass())}>
            {getIcon()}
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-4 w-32 mt-2" />
        ) : (
          getChangeIcon()
        )}
      </CardContent>
    </Card>
  );
}
