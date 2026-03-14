"use client";

import { BarChart3, TrendingUp, Shield, Download, Users, Activity, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, CartesianGrid } from "recharts";
import { DashboardTab } from "@/app/types";

const trendData = [
  { month: "Jan", attendance: 88, users: 400 },
  { month: "Feb", attendance: 92, users: 550 },
  { month: "Mar", attendance: 85, users: 720 },
  { month: "Apr", attendance: 94, users: 900 },
  { month: "May", attendance: 97, users: 1240 },
];

export function AdminDashboard({ searchQuery, activeTab }: { searchQuery: string, activeTab?: DashboardTab }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Analytics Console</h2>
          <p className="text-muted-foreground font-body">Monitoring EduSense AI Platform Performance</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-indigo-600 text-white shadow-lg">
          <CardContent className="p-6 space-y-2">
            <Users className="w-6 h-6 opacity-80" />
            <p className="text-3xl font-bold font-headline">1,240</p>
            <p className="text-xs uppercase font-bold tracking-widest text-white/70">Total Active Users</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-orange-500 text-white shadow-lg">
          <CardContent className="p-6 space-y-2">
            <TrendingUp className="w-6 h-6 opacity-80" />
            <p className="text-3xl font-bold font-headline">+18%</p>
            <p className="text-xs uppercase font-bold tracking-widest text-white/70">Platform Growth</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-blue-600 text-white shadow-lg">
          <CardContent className="p-6 space-y-2">
            <Activity className="w-6 h-6 opacity-80" />
            <p className="text-3xl font-bold font-headline">94.2%</p>
            <p className="text-xs uppercase font-bold tracking-widest text-white/70">Avg Attendance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <CardTitle className="font-headline text-xl">Attendance Trends</CardTitle>
            </div>
            <CardDescription>System-wide daily participation rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ChartContainer config={{
                attendance: { label: "Attendance %", color: "#10b981" }
              }}>
                <AreaChart data={trendData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
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

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/10 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline text-lg">Platform Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="font-body text-sm space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border">
                <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold">Growth Alert</p>
                  <p className="text-muted-foreground">User registrations have peaked in the last 48 hours, with high activity in the Magic Games sector.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border">
                <BarChart3 className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <p className="font-bold">System Stability</p>
                  <p className="text-muted-foreground">Server response times are within the optimal threshold (150ms) during high-concurrency periods.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
