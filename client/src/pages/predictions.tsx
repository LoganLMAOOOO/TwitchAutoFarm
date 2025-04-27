import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { Farm } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ExtendedFarm extends Farm {
  accountName: string;
}

// Mock prediction data (in a real app, you'd fetch this from the API)
const predictionData = [
  { name: "Won", value: 68, color: "#00C989" },
  { name: "Lost", value: 32, color: "#F43F5E" },
];

const channelPerformance = [
  { channel: "xQc", won: 12500, lost: 3200 },
  { channel: "Asmongold", won: 8700, lost: 5100 },
  { channel: "shroud", won: 6300, lost: 4500 },
  { channel: "pokimane", won: 3800, lost: 2100 },
  { channel: "ludwig", won: 2900, lost: 3600 },
];

const predictionStrategies = [
  { strategy: "Follow Majority", success: 72 },
  { strategy: "Random Choice", success: 51 },
  { strategy: "Percentage-based", success: 64 },
  { strategy: "Custom Logic", success: 78 },
];

export default function Predictions() {
  const { data: farms, isLoading } = useQuery<ExtendedFarm[]>({
    queryKey: ['/api/farms'],
  });

  const activePredictionFarms = farms?.filter(farm => farm.features.predictions && farm.status === "active") || [];
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">Predictions</h2>
        </header>
        
        {/* Predictions Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-styled">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Prediction Success Rate */}
            <Card className="bg-card border-border col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Overall Prediction Success</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {isLoading ? (
                  <Skeleton className="h-48 w-48 rounded-full" />
                ) : (
                  <div className="h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={predictionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {predictionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Active Prediction Farms */}
            <Card className="bg-card border-border col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">
                  Active Prediction Farms: {isLoading ? "--" : activePredictionFarms.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : activePredictionFarms.length > 0 ? (
                  <ul className="space-y-2">
                    {activePredictionFarms.map(farm => (
                      <li key={farm.id} className="flex items-center justify-between p-2 border border-border rounded-md">
                        <span className="font-medium">{farm.channelName}</span>
                        <div className="text-sm text-muted-foreground">
                          Strategy: {farm.predictionSettings.strategy}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active prediction farms
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Strategy Performance */}
            <Card className="bg-card border-border col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={predictionStrategies}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                      <YAxis type="category" dataKey="strategy" width={100} />
                      <Tooltip formatter={(value) => [`${value}%`, "Success Rate"]} />
                      <Bar dataKey="success" fill="#9146FF" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Analysis */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="winnings">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="winnings">Points Won/Lost</TabsTrigger>
                  <TabsTrigger value="history">Prediction History</TabsTrigger>
                </TabsList>
                <TabsContent value="winnings">
                  {isLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={channelPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Legend />
                        <Bar name="Points Won" dataKey="won" fill="#00C989" />
                        <Bar name="Points Lost" dataKey="lost" fill="#F43F5E" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </TabsContent>
                <TabsContent value="history">
                  <div className="text-center py-8 text-muted-foreground">
                    Detailed prediction history coming soon
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
