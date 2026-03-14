"use client";

import { useState } from "react";
import { Sparkles, Volume2, Loader2, BookOpen, Hash, BrainCircuit } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-orange-400" />
          Basics Learning Hub
          <Sparkles className="w-8 h-8 text-orange-400" />
        </h2>
        <p className="text-muted-foreground font-body text-lg">
          Interactive discovery for our youngest learners. Tap to hear the sounds!
        </p>
      </div>

      <Tabs defaultValue="alphabets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 bg-primary/5">
          <TabsTrigger value="alphabets" className="gap-2 font-headline text-lg">
            <BookOpen className="w-5 h-5" /> ABCs
          </TabsTrigger>
          <TabsTrigger value="numbers" className="gap-2 font-headline text-lg">
            <Hash className="w-5 h-5" /> 123s
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alphabets" className="pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {alphabets.map((item) => (
              <Card 
                key={item.val} 
                className="group cursor-pointer hover:border-primary/50 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm border-2"
                onClick={() => handleSpeech(`${item.val} is for ${item.word}`, item.val)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-2 text-center relative">
                   <div className="absolute top-2 right-2">
                     {isSpeaking === item.val ? (
                       <Loader2 className="w-4 h-4 animate-spin text-primary" />
                     ) : (
                       <Volume2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                     )}
                   </div>
                   <span className="text-5xl font-headline font-bold text-primary group-hover:scale-110 transition-transform">{item.val}</span>
                   <span className="text-3xl">{item.icon}</span>
                   <p className="font-body text-lg font-bold text-muted-foreground group-hover:text-foreground">{item.word}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {numbers.map((item) => (
              <Card 
                key={item.val} 
                className="group cursor-pointer hover:border-accent/50 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm border-2"
                onClick={() => handleSpeech(`${item.val}. ${item.hint}`, item.val)}
              >
                <CardContent className="p-8 flex flex-col items-center justify-center space-y-4 text-center relative overflow-hidden">
                   <div className="absolute top-2 right-2">
                     {isSpeaking === item.val ? (
                       <Loader2 className="w-4 h-4 animate-spin text-accent" />
                     ) : (
                       <Volume2 className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                     )}
                   </div>
                   <span className="text-7xl font-headline font-bold text-accent group-hover:scale-125 transition-transform">{item.val}</span>
                   <div className="flex flex-wrap justify-center gap-1">
                     {Array.from({ length: parseInt(item.val) }).map((_, i) => (
                       <span key={i} className="text-xl animate-in zoom-in duration-300" style={{ transitionDelay: `${i * 50}ms` }}>{item.icon}</span>
                     ))}
                   </div>
                   <p className="font-headline text-2xl font-bold text-muted-foreground group-hover:text-accent">{item.word}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary/5 border-primary/20 overflow-hidden">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <BrainCircuit className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-headline font-bold text-primary">Pedagogical Note</h3>
            <p className="text-muted-foreground font-body">
              These interactive elements are designed to foster multisensory association between symbols, sounds, and familiar objects. Encourage your child to repeat the sounds after tapping the cards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
