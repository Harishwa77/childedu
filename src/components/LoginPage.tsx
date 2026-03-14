
"use client";

import { useState } from "react";
import { Mail, Lock, LogIn, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[450px] space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl mb-4 group hover:scale-110 transition-transform">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">EduSense AI</h1>
          <p className="text-muted-foreground font-body text-lg">
            Autonomous Intelligence for Early Childhood
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-headline text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center font-body">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@school.edu" 
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="px-0 font-body text-xs h-auto text-primary">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-body leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11 text-base gap-2" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <LogIn className="w-4 h-4" />
                  </>
                )}
              </Button>
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground font-body">
                  Don't have an account?{" "}
                  <Button variant="link" className="p-0 font-bold text-primary">
                    Create Account
                  </Button>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs font-body">
          <Sparkles className="w-3 h-3 text-orange-400" />
          Powered by Gemini 2.5 Flash
          <Sparkles className="w-3 h-3 text-orange-400" />
        </div>
      </div>
    </div>
  );
}
