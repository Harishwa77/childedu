"use client";

import { School, User, Settings, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Role = "teacher" | "parent" | "admin" | null;

interface RoleSelectorProps {
  onSelect: (role: Role) => void;
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  const roles = [
    {
      id: "teacher",
      title: "Teacher World",
      description: "Help your students grow with magical AI tools and lesson plans.",
      icon: School,
      color: "text-sky-500",
      bg: "bg-sky-50",
      border: "hover:border-sky-400",
    },
    {
      id: "parent",
      title: "Family Center",
      description: "Follow your child's learning adventure and discover fun home activities.",
      icon: User,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "hover:border-emerald-400",
    },
    {
      id: "admin",
      title: "School HQ",
      description: "Manage the magic behind the scenes and track school progress.",
      icon: Settings,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "hover:border-orange-400",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-12 max-w-6xl mx-auto animate-in fade-in duration-1000">
      {/* Playful Background Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float delay-700" />
      
      <div className="text-center space-y-6 relative z-10">
        <div className="mx-auto w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-2 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
          <GraduationCap className="w-14 h-14" />
        </div>
        <h1 className="text-6xl font-headline font-bold text-primary tracking-tight">
          EduSense AI
        </h1>
        <p className="text-muted-foreground text-2xl max-w-2xl font-body mx-auto">
          Welcome to your educational adventure! Where do you want to go today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative z-10">
        {roles.map((role) => (
          <Card 
            key={role.id} 
            className={cn(
              "hover:shadow-2xl transition-all border-4 rounded-[3rem] cursor-pointer group relative overflow-hidden bg-white/80 backdrop-blur-sm",
              role.border
            )} 
            onClick={() => onSelect(role.id as Role)}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <role.icon className="w-40 h-40" />
            </div>
            <CardHeader className="text-center pb-2 relative z-10">
              <div className={cn("mx-auto p-6 rounded-[2rem] mb-4 transition-transform group-hover:scale-110 shadow-lg", role.bg)}>
                <role.icon className={cn("w-10 h-10", role.color)} />
              </div>
              <CardTitle className="font-headline text-3xl mb-2">{role.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center relative z-10 p-8 pt-0">
              <CardDescription className="text-lg font-body leading-relaxed min-h-[80px]">
                {role.description}
              </CardDescription>
              <Button className={cn("mt-8 w-full font-headline text-xl h-14 rounded-[1.5rem] shadow-lg bouncy-hover", role.id === 'teacher' ? 'bg-sky-500 hover:bg-sky-600' : role.id === 'parent' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600')}>
                Enter Portal <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 text-muted-foreground font-body text-lg opacity-80 bg-white/50 px-8 py-3 rounded-full backdrop-blur-sm">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        Trusted by 500+ Early Learning Communities
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </div>
    </div>
  );
}