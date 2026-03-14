"use client";

import { useState } from "react";
import { Sparkles, Volume2, Loader2, BookOpen, Hash, BrainCircuit, Star, Cloud, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { cn } from "@/lib/utils";

const numbers = [
  { val: "1", word: "One", icon: "🍎", hint: "One Apple" },
  { val: "2", word: "Two", icon: "🍌", hint: "Two Bananas" },
  { val: "3", word: "Three", icon: "🍊", hint: "Three Oranges" },
  { val: "4", word: "Four", icon: "🍇", hint: "Four Grapes" },
  { val: "5", word: "Five", icon: "🍓", hint: "Five Strawberries" },
  { val: "6", word: "Six", icon: "🍒", hint: "Six Cherries" },
  { val: "7", word: "Seven", icon: "🍍", hint: "Seven Pineapples" },
  { val: "8", word: "Eight", icon: "🍐", hint: "Eight Pears" },
  { val: "9", word: "Nine", icon: "🍉", hint: "Nine Watermelons" },
  { val: "10", word: "Ten", icon: "🌽", hint: "Ten Corns" },
];

const alphabets = [
  { val: "A", word: "Apple", icon: "🍎" },
  { val: "B", word: "Ball", icon: "⚽" },
  { val: "C", word: "Cat", icon: "🐱" },
  { val: "D", word: "Dog", icon: "🐶" },
  { val: "E", word: "Elephant", icon: "🐘" },
  { val: "F", word: "Fish", icon: "🐟" },
  { val: "G", word: "Grapes", icon: "🍇" },
  { val: "H", word: "Hat", icon: "🎩" },
  { val: "I", word: "Ice Cream", icon: "🍦" },
  { val: "J", word: "Jelly", icon: "🍮" },
  { val: "K", word: "Kite", icon: "🪁" },
  { val: "L", word: "Lion", icon: "🦁" },
  { val: "M", word: "Monkey", icon: "🐒" },
  { val: "N", word: "Nest", icon: "🪹" },
  { val: "O", word: "Owl", icon: "🦉" },
  { val: "P", word: "Penguin", icon: "🐧" },
  { val: "Q", word: "Queen", icon: "👸" },
  { val: "R", word: "Rabbit", icon: "🐰" },
  { val: "S", word: "Sun", icon: "☀️" },
  { val: "T", word: "Tiger", icon: "🐯" },
  { val: "U", word: "Umbrella", icon: "☂️" },
  { val: "V", word: "Van", icon: "🚐" },
  { val: "W", word: "Whale", icon: "🐋" },
  { val: "X", word: "Xylophone", icon: "🎹" },
  { val: "Y", word: "Yo-Yo", icon: "🪀" },
  { val: "Z", word: "Zebra", icon: "🦓" },
];

export function KinderLearningHub() {
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const handleSpeech = async (text: string, id: string) => {
    if (isSpeaking) return;
    setIsSpeaking(id);
    try {
      const res = await textToSpeech({ text });
      const audio = new Audio(res.audioDataUri);
      audio.onended = () => setIsSpeaking(null);
      audio.play();
    } catch (error) {
      console.error(error);
      setIsSpeaking(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in zoom-in duration-700 max-w-7xl mx-auto px-4">
      <div className="text-center space-y-4 relative">
        <Sun className="w-16 h-16 text-yellow-400 absolute -top-10 -left-10 animate-spin-slow opacity-20" />
        <Cloud className="w-20 h-20 text-sky-400 absolute top-0 -right-10 animate-float opacity-20" />
        
        <h2 className="text-6xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Star className="w-10 h-10 text-orange-400 fill-orange-400 animate-pulse" />
          Play & Learn Hub
          <Star className="w-10 h-10 text-orange-400 fill-orange-400 animate-pulse" />
        </h2>
        <p className="text-muted-foreground font-body text-2xl max-w-2xl mx-auto leading-relaxed">
          Welcome to your interactive discovery zone! Tap a card to hear its magical sound.
        </p>
      </div>

      <Tabs defaultValue="alphabets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-16 bg-white border-4 border-primary/20 rounded-full p-2 shadow-lg">
          <TabsTrigger value="alphabets" className="gap-3 font-headline text-2xl rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <BookOpen className="w-6 h-6" /> ABCs
          </TabsTrigger>
          <TabsTrigger value="numbers" className="gap-3 font-headline text-2xl rounded-full data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
            <Hash className="w-6 h-6" /> 123s
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alphabets" className="pt-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {alphabets.map((item) => (
              <Card 
                key={item.val} 
                className="group cursor-pointer border-4 border-primary/10 rounded-[2.5rem] bg-white shadow-xl hover:shadow-2xl bouncy-hover overflow-hidden"
                onClick={() => handleSpeech(`${item.val} is for ${item.word}`, item.val)}
              >
                <CardContent className="p-8 flex flex-col items-center justify-center space-y-4 text-center relative">
                   <div className="absolute top-4 right-4">
                     {isSpeaking === item.val ? (
                       <Loader2 className="w-6 h-6 animate-spin text-primary" />
                     ) : (
                       <div className="p-2 bg-primary/5 rounded-full group-hover:bg-primary/20 transition-colors">
                         <Volume2 className="w-5 h-5 text-primary" />
                       </div>
                     )}
                   </div>
                   <span className="text-7xl font-headline font-bold text-primary group-hover:scale-125 transition-transform">{item.val}</span>
                   <span className="text-5xl drop-shadow-sm transform group-hover:rotate-12 transition-transform">{item.icon}</span>
                   <p className="font-headline text-2xl font-bold text-muted-foreground group-hover:text-primary">{item.word}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="pt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {numbers.map((item) => (
              <Card 
                key={item.val} 
                className="group cursor-pointer border-4 border-accent/10 rounded-[3rem] bg-white shadow-xl hover:shadow-2xl bouncy-hover overflow-hidden"
                onClick={() => handleSpeech(`${item.val}. ${item.hint}`, item.val)}
              >
                <CardContent className="p-10 flex flex-col items-center justify-center space-y-6 text-center relative">
                   <div className="absolute top-4 right-4">
                     {isSpeaking === item.val ? (
                       <Loader2 className="w-6 h-6 animate-spin text-accent" />
                     ) : (
                       <div className="p-2 bg-accent/5 rounded-full group-hover:bg-accent/20 transition-colors">
                         <Volume2 className="w-5 h-5 text-accent" />
                       </div>
                     )}
                   </div>
                   <span className="text-8xl font-headline font-bold text-accent group-hover:scale-110 transition-transform">{item.val}</span>
                   <div className="flex flex-wrap justify-center gap-2">
                     {Array.from({ length: parseInt(item.val) }).map((_, i) => (
                       <span key={i} className="text-2xl animate-in zoom-in duration-500 hover:rotate-12 transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                         {item.icon}
                       </span>
                     ))}
                   </div>
                   <p className="font-headline text-3xl font-bold text-muted-foreground group-hover:text-accent">{item.word}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary/5 border-4 border-primary/20 rounded-[3rem] shadow-inner overflow-hidden relative">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
        <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white rounded-[2rem] shadow-lg animate-float">
            <BrainCircuit className="w-16 h-16 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-headline font-bold text-primary mb-2">Did You Know?</h3>
            <p className="text-xl text-muted-foreground font-body leading-relaxed max-w-2xl">
              Tapping these cards helps your brain connect pictures, sounds, and letters all at once! This makes learning feel like play. Keep exploring!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}