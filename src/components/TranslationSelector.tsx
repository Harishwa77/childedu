"use client";

import { useState } from "react";
import { Languages, Loader2, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { translateAiInsights } from "@/ai/flows/translate-ai-insights";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  { id: "Assamese", label: "Assamese (অসমীয়া)" },
  { id: "Urdu", label: "Urdu (اردو)" },
] as const;

type LanguageId = typeof languages[number]["id"];

interface TranslationSelectorProps {
  content: string;
  onTranslate: (translated: string) => void;
  className?: string;
}

export function TranslationSelector({ content, onTranslate, className }: TranslationSelectorProps) {
  const [currentLang, setCurrentLang] = useState<LanguageId>("English");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (target: LanguageId) => {
    if (target === currentLang || !content) return;
    
    setIsTranslating(true);
    try {
      const result = await translateAiInsights({
        content: content,
        targetLanguage: target as any
      });
      onTranslate(result.translatedContent);
      setCurrentLang(target);
    } catch (error) {
      console.error("Translation Error:", error);
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
          className={cn("gap-2 h-8 text-[10px] font-bold uppercase tracking-wider", className)}
          disabled={isTranslating || !content}
        >
          {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
          {languages.find(l => l.id === currentLang)?.label || currentLang}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <ScrollArea className="h-72">
          <div className="p-1">
            {languages.map((lang) => (
              <DropdownMenuItem 
                key={lang.id} 
                onClick={() => handleTranslate(lang.id)}
                className="flex items-center justify-between"
              >
                <span>{lang.label}</span>
                {currentLang === lang.id && <Check className="w-3 h-3 text-primary" />}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
