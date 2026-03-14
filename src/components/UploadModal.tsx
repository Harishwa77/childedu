
"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Music, Video, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { summarizeMultimodalContent } from "@/ai/flows/summarize-multimodal-content";
import { useToast } from "@/hooks/use-toast";

export function UploadModal({ onProcessed }: { onProcessed: (data: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size client-side (50MB limit)
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
      
      // Track file reading progress
      reader.onprogress = (data) => {
        if (data.lengthComputable) {
          const progressVal = Math.round((data.loaded / data.total) * 30);
          setProgress(10 + progressVal);
        }
      };

      reader.onload = async () => {
        const dataUri = reader.result as string;
        setProgress(40);
        setProcessingStatus("Sending to AI engine (this may take a moment for large videos)...");
        
        try {
          // The AI processing happens here
          const result = await summarizeMultimodalContent({
            contentDataUri: dataUri,
            contentType: file.type,
          });

          setProgress(100);
          setProcessingStatus("Processing complete!");
          
          setTimeout(() => {
            onProcessed({
              id: Math.random().toString(36).substring(2, 11), // Generate a unique ID for React keys
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
            description: err.message || "The AI encountered an error analyzing your file. Ensure it's a valid media format."
          });
          resetState();
        }
      };

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not read the file from your device."
        });
        resetState();
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("General Error:", error);
      resetState();
    }
  };

  const resetState = () => {
    setIsUploading(false);
    setProgress(0);
    setProcessingStatus("");
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
          Upload & Analyze
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Educational Resource Upload</DialogTitle>
          <DialogDescription className="font-body text-base">
            Upload classroom media (up to 50MB). Our AI will summarize the session and identify key learning activities.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {!isUploading ? (
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
              <p className="text-base font-bold text-center font-headline">Drop your classroom video here</p>
              <p className="text-xs text-muted-foreground mt-2 text-center font-body">
                Max 50MB • MP4, MOV, WAV, PDF, JPEG
              </p>
            </div>
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

          <div className="grid grid-cols-4 gap-4 pt-2 border-t">
            <div className="flex flex-col items-center space-y-1">
              <div className="p-2 bg-blue-50 rounded-lg"><Music className="w-4 h-4 text-blue-600" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Voice</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="p-2 bg-purple-50 rounded-lg"><Video className="w-4 h-4 text-purple-600" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Video</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="p-2 bg-orange-50 rounded-lg"><ImageIcon className="w-4 h-4 text-orange-600" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Photo</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="p-2 bg-emerald-50 rounded-lg"><FileText className="w-4 h-4 text-emerald-600" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Doc</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
