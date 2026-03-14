
"use client";

import { ReactNode } from "react";
import { LogOut, Bell, Search, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIAssistant } from "./AIAssistant";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function DashboardLayout({ children, role, onLogout, searchQuery, onSearchChange }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b bg-white sticky top-0 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <span className="font-headline text-xl font-bold text-primary tracking-tight">EduSense AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
            <Button variant="ghost" className="text-sm font-medium text-muted-foreground">Resources</Button>
            <Button variant="ghost" className="text-sm font-medium text-muted-foreground">Insights</Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search resources..." 
              className="w-64 pl-9 bg-accent/5 border-none focus-visible:ring-1" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>

          <div className="h-8 w-px bg-border mx-1"></div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-1 hidden lg:flex">
              <span className="text-sm font-semibold capitalize leading-none">{role}</span>
              <span className="text-[10px] text-muted-foreground">Premium Account</span>
            </div>
            <UserCircle className="w-8 h-8 text-primary/80" />
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-6 pb-24">
        {children}
      </main>

      <AIAssistant />
    </div>
  );
}
