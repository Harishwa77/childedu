"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Music, Video, Image as ImageIcon, Loader2, CheckCircle, Youtube, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summarizeMultimodalContent } from "@/ai/flows/summarize-multimodal-content";
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
    setProgress(10);
    setProcessingStatus("Reading file locally...");

    try {
      const reader = new FileReader();
      
      reader.onprogress = (data) => {
        if (data.lengthComputable) {
          const progressVal = Math.round((data.loaded / data.total) * 30);
          setProgress(10 + progressVal);
        }
      };

      reader.onload = async () => {
        const dataUri = reader.result as string;
        setProgress(40);
        setProcessingStatus("Analyzing video and audio tracks...");
        
        try {
          const result = await summarizeMultimodalContent({
            contentDataUri: dataUri,
            contentType: file.type,
          });

          setProgress(100);
          setProcessingStatus("Processing complete!");
          
          setTimeout(() => {
            onProcessed({
              id: Math.random().toString(36).substring(2, 11),
              ...result,
              fileName: file.name,
              fileType: file.type,
              timestamp: new Date().toISOString()
            });
            setIsOpen(false);
            resetState();
          }, 800);
        } catch (err: any) {
          console.error("Upload Error:", err);
          toast({
            variant: "destructive",
            title: "Processing Failed",
            description: err.message || "The AI encountered an error analyzing your file."
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
        <Button className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all font-headline text-base">
          <Upload className="w-5 h-5" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">New Educational Resource</DialogTitle>
          <DialogDescription className="font-body text-base">
            Upload classroom media or paste a YouTube link for AI analysis.
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
                <p className="text-base font-bold text-center font-headline">Drop your classroom media here</p>
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
                <p className="text-[10px] text-muted-foreground px-1">AI will analyze video content, identifying activities and key dialogue.</p>
              </div>
              <Button className="w-full gap-2" onClick={handleYoutubeSubmit}>
                Analyze Link <Youtube className="w-4 h-4" />
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            {progress < 100 ? (
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-primary font-headline text-lg">
                  {progress}%
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-100 rounded-full animate-in zoom-in">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
            )}
            <div className="w-full space-y-3">
              <Progress value={progress} className="h-3 rounded-full" />
              <p className="text-center text-sm font-medium text-primary animate-pulse font-body">
                {processingStatus}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 pt-4 mt-2 border-t">
          <div className="flex flex-col items-center space-y-1 opacity-60">
            <div className="p-2 bg-blue-50 rounded-lg"><Music className="w-4 h-4 text-blue-600" /></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Voice</span>
          </div>
          <div className="flex flex-col items-center space-y-1 opacity-60">
            <div className="p-2 bg-purple-50 rounded-lg"><Video className="w-4 h-4 text-purple-600" /></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Video</span>
          </div>
          <div className="flex flex-col items-center space-y-1 opacity-60">
            <div className="p-2 bg-orange-50 rounded-lg"><ImageIcon className="w-4 h-4 text-orange-600" /></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Photo</span>
          </div>
          <div className="flex flex-col items-center space-y-1 opacity-60">
            <div className="p-2 bg-emerald-50 rounded-lg"><FileText className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Doc</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
