
"use client";

import { School, User, Settings, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type Role = "teacher" | "parent" | "admin" | null;

interface RoleSelectorProps {
  onSelect: (role: Role) => void;
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  const roles = [
    {
      id: "teacher",
      title: "Teacher Portal",
      description: "Resource management, AI curriculum planning, and student tracking.",
      icon: School,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "parent",
      title: "Parent Center",
      description: "Learning journey tracking, home activity ideas, and teacher connection.",
      icon: User,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "admin",
      title: "Admin Console",
      description: "Program-wide analytics, resource trends, and system security.",
      icon: Settings,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl mb-2">
          <GraduationCap className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">EduSense AI</h1>
        <p className="text-muted-foreground text-xl max-w-2xl font-body">
          Select your portal to access personalized autonomous educational intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-2xl transition-all border-2 hover:border-primary/40 cursor-pointer group relative overflow-hidden" onClick={() => onSelect(role.id as Role)}>
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <role.icon className="w-32 h-32" />
            </div>
            <CardHeader className="text-center pb-2 relative z-10">
              <div className={`mx-auto p-5 rounded-2xl ${role.bg} mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
                <role.icon className={`w-8 h-8 ${role.color}`} />
              </div>
              <CardTitle className="font-headline text-2xl">{role.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <CardDescription className="text-base font-body leading-relaxed min-h-[60px]">
                {role.description}
              </CardDescription>
              <Button className="mt-8 w-full font-headline text-lg h-12 group-hover:scale-105 transition-transform">
                Enter Portal
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-muted-foreground font-body text-sm opacity-60">
        Trusted by 500+ Early Childhood Programs
      </p>
    </div>
  );
}
