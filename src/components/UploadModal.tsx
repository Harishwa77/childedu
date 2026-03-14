"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Music, Video, Image as ImageIcon, Loader2, CheckCircle, Youtube, Link as LinkIcon, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processEducationalContent } from "@/ai/flows/process-educational-content-pipeline";
import { summarizeYoutubeLink } from "@/ai/flows/summarize-youtube-link";
import { useToast } from "@/hooks/use-toast";

export function UploadModal({ onProcessed }: { onProcessed: (data: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 50MB."
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setProgress(5);
    setProcessingStatus("Initiating Autonomous AI Pipeline...");

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        const dataUri = reader.result as string;
        setProgress(20);
        setProcessingStatus("Extracting content & transcribing...");
        
        try {
          const resourceId = Math.random().toString(36).substring(2, 11);
          
          // Autonomous Processing Pipeline
          const result = await processEducationalContent({
            contentDataUri: dataUri,
            contentType: file.type,
            resourceId: resourceId,
          });

          setProgress(90);
          setProcessingStatus("Generating Flashcards & Quiz...");
          
          setProgress(100);
          setProcessingStatus("Knowledge Base Updated!");
          
          setTimeout(() => {
            onProcessed({
              id: resourceId,
              ...result,
              aiContent: {
                summary: result.summary,
                keyConcepts: result.keyConcepts,
                flashcards: result.flashcards,
                quiz: result.quiz,
                activitySuggestions: result.activitySuggestions,
                translations: result.translations
              },
              fileName: file.name,
              fileType: file.type,
              timestamp: new Date().toISOString()
            });
            setIsOpen(false);
            resetState();
            
            toast({
              title: "AI Analysis Complete",
              description: "Flashcards, quizzes, and translations have been added to the knowledge base.",
            });
          }, 800);
        } catch (err: any) {
          console.error("Pipeline Error:", err);
          toast({
            variant: "destructive",
            title: "Autonomous Pipeline Error",
            description: err.message || "The AI encountered an error processing your content."
          });
          resetState();
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("General Error:", error);
      resetState();
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim() || !youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid YouTube link."
      });
      return;
    }

    setIsUploading(true);
    setProgress(20);
    setProcessingStatus("Connecting to YouTube...");

    try {
      const result = await summarizeYoutubeLink({ youtubeUrl });
      
      setProgress(100);
      setProcessingStatus("Analysis complete!");

      setTimeout(() => {
        onProcessed({
          id: Math.random().toString(36).substring(2, 11),
          ...result,
          fileName: `YouTube: ${youtubeUrl.substring(0, 30)}...`,
          fileType: "video/youtube",
          timestamp: new Date().toISOString()
        });
        setIsOpen(false);
        resetState();
      }, 800);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Link Processing Failed",
        description: err.message || "Could not analyze the YouTube link."
      });
      resetState();
    }
  };

  const resetState = () => {
    setIsUploading(false);
    setProgress(0);
    setProcessingStatus("");
    setYoutubeUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isUploading) {
        setIsOpen(open);
        if (!open) resetState();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all font-headline text-base bg-primary">
          <Upload className="w-5 h-5" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle className="font-headline text-2xl">Autonomous AI Processing</DialogTitle>
          </div>
          <DialogDescription className="font-body text-base">
            Upload media for NoteGPT-style extraction (Flashcards, Quizzes, Translations).
          </DialogDescription>
        </DialogHeader>

        {!isUploading ? (
          <Tabs defaultValue="file" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="gap-2"><Upload className="w-4 h-4" /> File Upload</TabsTrigger>
              <TabsTrigger value="link" className="gap-2"><Youtube className="w-4 h-4" /> YouTube Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="pt-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 hover:bg-primary/5 hover:border-primary transition-all cursor-pointer relative group bg-muted/30">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept="audio/*,video/*,image/*,.pdf,.docx"
                />
                <div className="p-5 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary/20">
                  <Video className="w-10 h-10 text-primary" />
                </div>
                <p className="text-base font-bold text-center font-headline">Drop media for Autonomous Extraction</p>
                <p className="text-xs text-muted-foreground mt-2 text-center font-body">
                  Max 50MB • Video, Audio, or PDF
                </p>
              </div>
            </TabsContent>

            <TabsContent value="link" className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    className="pl-10"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full gap-2" onClick={handleYoutubeSubmit}>
                Analyze Link <Youtube className="w-4 h-4" />
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary animate-spin opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-primary font-headline text-lg">
                {progress}%
              </div>
            </div>
            <div className="w-full space-y-3">
              <Progress value={progress} className="h-3 rounded-full" />
              <p className="text-center text-sm font-medium text-primary animate-pulse font-body">
                {processingStatus}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
