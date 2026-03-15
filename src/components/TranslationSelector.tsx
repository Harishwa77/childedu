"use client";

import { useState } from "react";
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
  { id: "Assamese", label: "Assamese (অসমীয়া)" },
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
    if (!originalContent) return;
    
    // If switching to English, always restore the original content instantly
    if (target === "English") {
      onTranslate(originalContent);
      setCurrentLang("English");
      return;
    }

    if (target === currentLang) return;
    
    setIsTranslating(true);
    try {
      const result = await translateAiInsights({
        content: originalContent,
        targetLanguage: target as any
      });
      
      onTranslate(result.translatedContent);
      setCurrentLang(target);
      
      if (result.translatedContent === originalContent) {
        toast({
          title: "Notice",
          description: "Displaying original text (Translation skipped or returned original).",
        });
      }
    } catch (error) {
      console.error("Translation Error:", error);
      toast({
        title: "Translation Error",
        description: "Could not translate content at this time. Please try again later.",
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
          className={cn("gap-2 h-9 text-xs font-bold rounded-full border-primary/20 hover:bg-primary/5 px-4 shadow-sm", className)}
          disabled={isTranslating || !originalContent}
        >
          {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-4 h-4 text-primary" />}
          {languages.find(l => l.id === currentLang)?.label || currentLang}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl border-none">
        <div className="p-2 border-b mb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Language</p>
        </div>
        <ScrollArea className="h-72">
          <div className="space-y-1">
            {languages.map((lang) => (
              <DropdownMenuItem 
                key={lang.id} 
                onClick={() => handleTranslate(lang.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl cursor-pointer p-3",
                  currentLang === lang.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                <span className="font-body text-sm">{lang.label}</span>
                {currentLang === lang.id && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
