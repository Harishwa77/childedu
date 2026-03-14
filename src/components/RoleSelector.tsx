
"use client";

import { UserCircle, School, User, Settings } from "lucide-react";
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
      title: "Teacher",
      description: "Upload resources, review lesson summaries, and get activity recommendations.",
      icon: School,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "parent",
      title: "Parent",
      description: "Track child's progress, view summaries, and get home activity ideas.",
      icon: User,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "admin",
      title: "Administrator",
      description: "Monitor program analytics, resource trends, and overall performance.",
      icon: Settings,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-headline font-bold text-primary">Welcome to EduSense AI</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Select your role to access personalized dashboards and AI-powered educational insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/20 cursor-pointer group" onClick={() => onSelect(role.id as Role)}>
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto p-4 rounded-full ${role.bg} mb-4 transition-transform group-hover:scale-110`}>
                <role.icon className={`w-8 h-8 ${role.color}`} />
              </div>
              <CardTitle className="font-headline text-2xl">{role.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm font-body leading-relaxed">
                {role.description}
              </CardDescription>
              <Button variant="outline" className="mt-6 w-full group-hover:bg-primary group-hover:text-white transition-colors">
                Enter Dashboard
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
