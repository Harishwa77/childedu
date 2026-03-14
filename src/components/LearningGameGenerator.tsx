"use client";

import { useState, useEffect } from "react";
import { Sparkles, Gamepad2, Puzzle, RefreshCcw, Trophy, Loader2, ArrowRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateLearningGame, LearningGameOutput } from "@/ai/flows/generate-learning-game";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface MatchingCard {
  id: string;
  content: string;
  type: 'icon' | 'word';
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function LearningGameGenerator() {
  const [theme, setTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameData, setGameData] = useState<LearningGameOutput | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
  
  // Matching Game State
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  
  // Puzzle State
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [puzzleGuess, setPuzzleGuess] = useState<string[]>([]);

  const { toast } = useToast();

  const handleGenerate = async (type: 'matching' | 'puzzle') => {
    if (!theme.trim()) {
      toast({ title: "Oops!", description: "Type a theme like 'Animals' or 'Fruits' first!" });
      return;
    }

    setIsGenerating(true);
    setGameData(null);
    setGameState('idle');
    
    try {
      const res = await generateLearningGame({ theme, gameType: type });
      setGameData(res);
      setGameState('playing');

      if (type === 'matching' && res.matchingGame) {
        const matchingCards: MatchingCard[] = [];
        res.matchingGame.pairs.forEach((pair, idx) => {
          matchingCards.push({
            id: `card-${idx}-icon`,
            content: pair.icon,
            type: 'icon',
            matchId: pair.id,
            isFlipped: false,
            isMatched: false,
          });
          matchingCards.push({
            id: `card-${idx}-word`,
            content: pair.word,
            type: 'word',
            matchId: pair.id,
            isFlipped: false,
            isMatched: false,
          });
        });
        setCards(matchingCards.sort(() => Math.random() - 0.5));
      } else if (type === 'puzzle' && res.puzzleGame) {
        const letters = res.puzzleGame.word.toUpperCase().split('');
        setScrambled([...letters].sort(() => Math.random() - 0.5));
        setPuzzleGuess([]);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Magic Failed", description: "The game maker is tired. Try again!" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardClick = (id: string) => {
    if (flippedIds.length === 2 || gameState === 'won') return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      const first = cards.find(c => c.id === newFlipped[0])!;
      const second = newCards.find(c => c.id === newFlipped[1])!;

      if (first.matchId === second.matchId) {
        setTimeout(() => {
          const matchedCards = newCards.map(c => 
            c.id === first.id || c.id === second.id ? { ...c, isMatched: true } : c
          );
          setCards(matchedCards);
          setFlippedIds([]);
          
          if (matchedCards.every(c => c.isMatched)) {
            handleWin();
          }
        }, 600);
      } else {
        setTimeout(() => {
          setCards(newCards.map(c => 
            c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
          ));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  const handlePuzzleLetter = (letter: string, idx: number) => {
    const newGuess = [...puzzleGuess, letter];
    setPuzzleGuess(newGuess);
    setScrambled(prev => prev.filter((_, i) => i !== idx));

    if (newGuess.join('') === gameData?.puzzleGame?.word.toUpperCase()) {
      handleWin();
    } else if (newGuess.length === gameData?.puzzleGame?.word.length) {
      toast({ variant: "destructive", title: "Not quite!", description: "Try again!" });
      setScrambled(gameData.puzzleGame.word.toUpperCase().split('').sort(() => Math.random() - 0.5));
      setPuzzleGuess([]);
    }
  };

  const handleWin = () => {
    setGameState('won');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38BDF8', '#FBBF24', '#FB7185']
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <Card className="border-4 border-primary/20 rounded-[3rem] shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-8 text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-float">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-4xl font-headline font-bold text-primary">Magic Game Maker</CardTitle>
            <CardDescription className="text-lg font-body">Type a theme and watch me create a game just for you!</CardDescription>
          </div>
          <div className="max-w-md mx-auto flex gap-3">
            <Input 
              placeholder="e.g. Dinosaurs, Fruits, Ocean..." 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded-full h-14 border-2 border-primary/20 text-lg px-6"
            />
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => handleGenerate('matching')} 
              disabled={isGenerating || !theme.trim()}
              className="rounded-full h-12 gap-2 bg-sky-500 hover:bg-sky-600 px-6 font-headline"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gamepad2 className="w-5 h-5" />}
              Matching Game
            </Button>
            <Button 
              onClick={() => handleGenerate('puzzle')} 
              disabled={isGenerating || !theme.trim()}
              className="rounded-full h-12 gap-2 bg-emerald-500 hover:bg-emerald-600 px-6 font-headline"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Puzzle className="w-5 h-5" />}
              ABC Puzzle
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8 min-h-[400px] flex items-center justify-center">
          {!gameData && !isGenerating && (
            <div className="text-center opacity-30 space-y-4">
              <Gamepad2 className="w-24 h-24 mx-auto" />
              <p className="font-headline text-2xl">Your game will appear here!</p>
            </div>
          )}

          {isGenerating && (
            <div className="text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <Loader2 className="w-24 h-24 animate-spin text-primary opacity-20" />
                <Sparkles className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="font-headline text-2xl animate-pulse text-primary">AI is crafting your adventure...</p>
            </div>
          )}

          {gameData && gameState !== 'idle' && (
            <div className="w-full space-y-8 animate-in slide-in-from-bottom-5 duration-700">
              <div className="text-center">
                <h3 className="text-3xl font-headline font-bold text-foreground mb-2">{gameData.title}</h3>
                <p className="text-muted-foreground font-body">{gameData.description}</p>
                <Badge variant="outline" className="mt-4 border-primary/20 text-primary font-body">
                  Target: {gameData.learningObjective}
                </Badge>
              </div>

              {gameState === 'won' ? (
                <div className="text-center space-y-6 py-12 bg-emerald-50 rounded-[3rem] border-4 border-emerald-100 animate-in zoom-in duration-500">
                  <div className="relative inline-block">
                    <Trophy className="w-32 h-32 text-yellow-500 mx-auto animate-bounce" />
                    <Star className="w-8 h-8 text-yellow-400 absolute top-0 -right-4 animate-pulse fill-yellow-400" />
                  </div>
                  <h4 className="text-5xl font-headline font-bold text-emerald-600">Great Job!</h4>
                  <p className="text-2xl font-body text-emerald-700">You mastered the {theme} adventure!</p>
                  <Button onClick={() => setGameState('idle')} variant="outline" className="rounded-full h-12 border-emerald-200 text-emerald-600 hover:bg-emerald-100">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Play Another Theme
                  </Button>
                </div>
              ) : (
                <>
                  {gameData.matchingGame && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {cards.map((card) => (
                        <div 
                          key={card.id}
                          onClick={() => handleCardClick(card.id)}
                          className={cn(
                            "aspect-square rounded-3xl cursor-pointer transition-all duration-500 transform preserve-3d bouncy-hover flex items-center justify-center text-center p-4",
                            card.isFlipped || card.isMatched 
                              ? "bg-white border-4 border-primary/40 rotate-y-180" 
                              : "bg-primary/20 border-4 border-white/40 shadow-inner"
                          )}
                        >
                          {(card.isFlipped || card.isMatched) ? (
                            <span className={cn(
                              "font-headline font-bold break-words",
                              card.type === 'icon' ? "text-5xl" : "text-lg text-primary"
                            )}>
                              {card.content}
                            </span>
                          ) : (
                            <Star className="w-8 h-8 text-primary/40" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {gameData.puzzleGame && (
                    <div className="space-y-12 py-8 text-center">
                       <div className="text-9xl mb-8 drop-shadow-xl animate-float">{gameData.puzzleGame.icon}</div>
                       
                       <div className="flex justify-center gap-4">
                         {Array.from({ length: gameData.puzzleGame.word.length }).map((_, i) => (
                           <div key={i} className="w-16 h-16 border-b-4 border-emerald-300 flex items-center justify-center text-4xl font-headline font-bold text-emerald-600">
                             {puzzleGuess[i] || ""}
                           </div>
                         ))}
                       </div>

                       <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
                         {scrambled.map((letter, i) => (
                           <Button 
                            key={i}
                            variant="outline"
                            onClick={() => handlePuzzleLetter(letter, i)}
                            className="w-16 h-16 rounded-2xl text-2xl font-headline font-bold border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 bouncy-hover"
                           >
                             {letter}
                           </Button>
                         ))}
                       </div>

                       <p className="text-lg italic font-body text-muted-foreground">Hint: {gameData.puzzleGame.hint}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
