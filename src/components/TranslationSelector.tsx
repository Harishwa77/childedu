"use client";

import { useState, useEffect } from "react";
import { Languages, Loader2, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { translateAiInsights } from "@/ai/flows/translate-ai-insights";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const languages = [
  { id: "English", label: "English" },
  { id: "Hindi", label: "Hindi (हिन्दी)" },
  { id: "Tamil", label: "Tamil (தமிழ்)" },
  { id: "Telugu", label: "Telugu (తెలుగు)" },
  { id: "Bengali", label: "Bengali (বাংলা)" },
  { id: "Marathi", label: "Marathi (मराठी)" },
  { id: "Gujarati", label: "Gujarati (ગુજરાતી)" },
  { id: "Kannada", label: "Kannada (ಕನ್ನಡ)" },
  { id: "Malayalam", label: "Malayalam (മലയാളം)" },
  { id: "Punjabi", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { id: "Odia", label: "Odia (ଓੜିଆ)" },
  { id: "Assamese", label: "Assamese (ଅসমীயா)" },
  { id: "Urdu", label: "Urdu (اردو)" },
] as const;

type LanguageId = typeof languages[number]["id"];

interface TranslationSelectorProps {
  originalContent: string;
  onTranslate: (translated: string) => void;
  className?: string;
}

export function TranslationSelector({ originalContent, onTranslate, className }: TranslationSelectorProps) {
  const [currentLang, setCurrentLang] = useState<LanguageId>("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async (target: LanguageId) => {
    if (target === currentLang || !originalContent) {
      if (target === "English") {
        onTranslate(originalContent);
        setCurrentLang("English");
      }
      return;
    }
    
    setIsTranslating(true);
    try {
      if (target === "English") {
        onTranslate(originalContent);
        setCurrentLang("English");
        setIsTranslating(false);
        return;
      }

      const result = await translateAiInsights({
        content: originalContent,
        targetLanguage: target as any
      });
      
      if (result.translatedContent === originalContent && target !== "English") {
        toast({
          title: "Translation Service Busy",
          description: "Our AI is currently at capacity. Displaying original text for now.",
          variant: "default"
        });
      } else {
        onTranslate(result.translatedContent);
        setCurrentLang(target);
      }
    } catch (error) {
      console.error("Translation Error:", error);
      toast({
        title: "Translation Error",
        description: "Could not translate content at this time.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-2 h-8 text-[10px] font-bold uppercase tracking-wider rounded-full border-primary/20 hover:bg-primary/5", className)}
          disabled={isTranslating || !originalContent}
        >
          {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3 text-primary" />}
          {languages.find(l => l.id === currentLang)?.label || currentLang}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
        <ScrollArea className="h-72">
          <div className="space-y-1">
            {languages.map((lang) => (
              <DropdownMenuItem 
                key={lang.id} 
                onClick={() => handleTranslate(lang.id)}
                className="flex items-center justify-between rounded-xl cursor-pointer"
              >
                <span className="font-body">{lang.label}</span>
                {currentLang === lang.id && <Check className="w-3 h-3 text-primary" />}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}