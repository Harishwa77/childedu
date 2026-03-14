"use client";

import { Sparkles, BrainCircuit, Star, Cloud, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LearningGameGenerator } from "./LearningGameGenerator";

export function KinderLearningHub() {
  return (
    <div className="space-y-12 animate-in fade-in zoom-in duration-700 max-w-7xl mx-auto px-4">
      <div className="text-center space-y-4 relative">
        <Sun className="w-16 h-16 text-yellow-400 absolute -top-10 -left-10 animate-spin-slow opacity-20" />
        <Cloud className="w-20 h-20 text-sky-400 absolute top-0 -right-10 animate-float opacity-20" />
        
        <h2 className="text-6xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Star className="w-10 h-10 text-orange-400 fill-orange-400 animate-pulse" />
          Magic Games Hub
          <Star className="w-10 h-10 text-orange-400 fill-orange-400 animate-pulse" />
        </h2>
        <p className="text-muted-foreground font-body text-2xl max-w-2xl mx-auto leading-relaxed">
          Welcome to your magical discovery zone! Type a theme and watch the AI create a new adventure just for you!
        </p>
      </div>

      <div className="pt-8">
        <LearningGameGenerator />
      </div>

      <Card className="bg-primary/5 border-4 border-primary/20 rounded-[3rem] shadow-inner overflow-hidden relative">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
        <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white rounded-[2rem] shadow-lg animate-float">
            <BrainCircuit className="w-16 h-16 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-headline font-bold text-primary mb-2">Did You Know?</h3>
            <p className="text-xl text-muted-foreground font-body leading-relaxed max-w-2xl">
              Playing AI-generated games helps your brain connect new ideas with fun challenges! Every time you play, your "Learning DNA" gets stronger. Keep exploring!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
