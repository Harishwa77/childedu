
"use client";

import { useState } from "react";
import { Upload, FileText, Music, Video, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";
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
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(10);
    setProcessingStatus("Uploading to storage...");

    try {
      // Simulate upload delay
      await new Promise(r => setTimeout(r, 800));
      setProgress(40);
      setProcessingStatus("Analyzing content with AI...");

      // Convert file to data URI for Genkit flow
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        
        try {
          const result = await summarizeMultimodalContent({
            contentDataUri: dataUri,
            contentType: file.type,
          });

          setProgress(100);
          setProcessingStatus("Processing complete!");
          
          setTimeout(() => {
            onProcessed({
              ...result,
              fileName: file.name,
              fileType: file.type,
              timestamp: new Date().toISOString()
            });
            setIsOpen(false);
            resetState();
          }, 500);
        } catch (err) {
          toast({
            variant: "destructive",
            title: "AI Processing Error",
            description: "We couldn't process this file. Please try again with a different format."
          });
          resetState();
        }
      };
    } catch (error) {
      resetState();
    }
  };

  const resetState = () => {
    setIsUploading(false);
    setProgress(0);
    setProcessingStatus("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Multimodal Upload</DialogTitle>
          <DialogDescription className="font-body">
            Share audio recordings, classroom videos, activity photos, or lesson documents.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {!isUploading ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 hover:bg-accent/5 hover:border-primary transition-all cursor-pointer relative group">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="audio/*,video/*,image/*,.pdf,.docx"
              />
              <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-center">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-2">Support for PDF, DOCX, MP3, MP4, JPEG, PNG</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              {progress < 100 ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              )}
              <div className="w-full space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm font-medium text-primary animate-pulse">
                  {processingStatus}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
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
