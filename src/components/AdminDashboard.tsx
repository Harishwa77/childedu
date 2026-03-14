
"use client";

import { BarChart3, TrendingUp, Shield, Download, Users, FileBarChart, BrainCircuit, Globe, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Area, AreaChart, ResponsiveContainer, Line, LineChart } from "recharts";
import { DashboardTab } from "@/app/page";

const trendData = [
  { month: "Jan", engagement: 65, resources: 40, attendance: 88 },
  { month: "Feb", engagement: 59, resources: 55, attendance: 92 },
  { month: "Mar", engagement: 80, resources: 72, attendance: 85 },
  { month: "Apr", engagement: 81, resources: 60, attendance: 94 },
  { month: "May", engagement: 95, resources: 85, attendance: 97 },
];

export function AdminDashboard({ searchQuery, activeTab }: { searchQuery: string, activeTab?: DashboardTab }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Analytics Console</h2>
          <p className="text-muted-foreground font-body">Monitoring EduSense AI across 12 programs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button className="gap-2">
            <Shield className="w-4 h-4" /> Security Logs
          </Button>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none bg-indigo-600 text-white">
            <CardContent className="p-6 space-y-2">
              <Users className="w-6 h-6 opacity-80" />
              <p className="text-3xl font-bold font-headline">1,240</p>
              <p className="text-xs uppercase font-bold tracking-widest text-white/70">Total Users</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-emerald-600 text-white">
            <CardContent className="p-6 space-y-2">
              <FileBarChart className="w-6 h-6 opacity-80" />
              <p className="text-3xl font-bold font-headline">4,582</p>
              <p className="text-xs uppercase font-bold tracking-widest text-white/70">Processed Files</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-orange-500 text-white">
            <CardContent className="p-6 space-y-2">
              <TrendingUp className="w-6 h-6 opacity-80" />
              <p className="text-3xl font-bold font-headline">+18%</p>
              <p className="text-xs uppercase font-bold tracking-widest text-white/70">Growth M/M</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-blue-600 text-white">
            <CardContent className="p-6 space-y-2">
              <Activity className="w-6 h-6 opacity-80" />
              <p className="text-3xl font-bold font-headline">94.2%</p>
              <p className="text-xs uppercase font-bold tracking-widest text-white/70">Avg Attendance</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {(activeTab === "dashboard" || activeTab === "insights") && (
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline text-xl">Engagement & Resource Trends</CardTitle>
              </div>
              <CardDescription className="font-body">AI-driven activity forecasting for next quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ChartContainer config={{
                  engagement: { label: "Engagement", color: "hsl(var(--primary))" },
                  resources: { label: "Resources", color: "hsl(var(--accent))" }
                }}>
                  <BarChart data={trendData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="engagement" fill="var(--color-engagement)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resources" fill="var(--color-resources)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {(activeTab === "dashboard" || activeTab === "resources") && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <CardTitle className="font-headline text-xl">System-Wide Attendance</CardTitle>
                </div>
                <CardDescription>Daily participation trends across all active centers</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="h-[180px] w-full">
                  <ChartContainer config={{
                    attendance: { label: "Attendance %", color: "#10b981" }
                  }}>
                    <AreaChart data={trendData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="var(--color-attendance)" 
                        fill="var(--color-attendance)" 
                        fillOpacity={0.1} 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {(activeTab === "dashboard" || activeTab === "insights") && (
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <CardTitle className="font-headline text-lg">System-Wide Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="font-body text-sm space-y-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border">
                  <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold">Growth Alert</p>
                    <p className="text-muted-foreground">Multimedia uploads have increased by <span className="font-bold text-foreground">24%</span> since the introduction of the new Teacher Hub interface.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border">
                  <BarChart3 className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <p className="font-bold">Regional Adoption</p>
                    <p className="text-muted-foreground">Language translation usage for <span className="font-bold text-foreground">Tamil</span> is up 15% this week, showing strong regional engagement.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

