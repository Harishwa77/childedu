
"use client";

import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { translateAiInsights } from "@/ai/flows/translate-ai-insights";

type Language = "English" | "Tamil" | "Hindi";

export function TranslationSelector({ content, onTranslate }: { content: string, onTranslate: (translated: string) => void }) {
  const [currentLang, setCurrentLang] = useState<Language>("English");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (target: Language) => {
    if (target === currentLang) return;
    
    setIsTranslating(true);
    try {
      const result = await translateAiInsights({
        content: content,
        targetLanguage: target
      });
      onTranslate(result.translatedContent);
      setCurrentLang(target);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs">
          {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
          {currentLang}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleTranslate("English")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTranslate("Tamil")}>Tamil (தமிழ்)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTranslate("Hindi")}>Hindi (हिन्दी)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
