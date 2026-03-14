
"use client";

import { BarChart3, TrendingUp, PieChart, Shield, Download, Users, FileBarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", engagement: 65, resources: 40 },
  { month: "Feb", engagement: 59, resources: 55 },
  { month: "Mar", engagement: 80, resources: 72 },
  { month: "Apr", engagement: 81, resources: 60 },
  { month: "May", engagement: 95, resources: 85 },
];

export function AdminDashboard() {
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
            <Shield className="w-6 h-6 opacity-80" />
            <p className="text-3xl font-bold font-headline">99.9%</p>
            <p className="text-xs uppercase font-bold tracking-widest text-white/70">Uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Engagement & Resource Trends</CardTitle>
            <CardDescription className="font-body">Monthly activity across all dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ChartContainer config={{
                engagement: { label: "Engagement", color: "hsl(var(--primary))" },
                resources: { label: "Resources", color: "hsl(var(--accent))" }
              }}>
                <BarChart data={data}>
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

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-headline text-xl">Top Activity Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Tactile Play", val: 45, color: "bg-blue-500" },
                { name: "Numeracy", val: 30, color: "bg-accent" },
                { name: "Language Arts", val: 25, color: "bg-indigo-500" },
              ].map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-body font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-accent/10 rounded-full">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="font-headline text-lg">System Insights</CardTitle>
            </CardHeader>
            <CardContent className="font-body text-sm space-y-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p>Multimedia uploads have increased by <span className="font-bold">24%</span> since the introduction of the new Teacher Hub interface.</p>
              </div>
              <div className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p>Language translation usage for <span className="font-bold">Tamil</span> is up 15% this week, showing strong regional adoption.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
