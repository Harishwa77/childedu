
"use client";

import { useState, useRef } from "react";
import { Upload, Video, ImageIcon, Loader2, CheckCircle, Youtube, Link as LinkIcon, Sparkles, Mic, Square, Trash2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processEducationalContent } from "@/ai/flows/process-educational-content-pipeline";
import { summarizeYoutubeLink } from "@/ai/flows/summarize-youtube-link";
import { voiceToLesson } from "@/ai/flows/voice-to-lesson-flow";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

export function UploadModal({ onProcessed }: { onProcessed?: (data: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const persistResource = (resourceData: any) => {
    if (!db || !user?.uid) {
      console.warn("Cannot persist resource: Firestore or User UID not available.");
      return;
    }

    const resourceId = resourceData.id;
    const docRef = doc(db, "educational_resources", resourceId);
    
    const finalData = {
      ...resourceData,
      uploaderId: user.uid,
      authorizedUids: {
        [user.uid]: true
      },
      createdAt: new Date().toISOString()
    };

    setDocumentNonBlocking(docRef, finalData, { merge: true });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceSubmit = async () => {
    if (!audioBlob || !user) return;

    setIsUploading(true);
    setProgress(20);
    setProcessingStatus("Transcribing your idea...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUri = reader.result as string;
        
        const result = await voiceToLesson({
          audioDataUri: dataUri,
          language: "English"
        });

        setProgress(100);
        setProcessingStatus("Lesson Plan Ready!");

        const resourceId = Math.random().toString(36).substring(2, 11);
        const resourceData = {
          id: resourceId,
          fileName: `Voice Plan: ${result.lessonPlan.title}`,
          summary: result.parentSummary,
          keyActivities: result.lessonPlan.steps,
          transcript: result.transcript,
          fileType: "audio/wav",
          timestamp: new Date().toISOString(),
          aiContent: {
            summary: result.parentSummary,
            keyConcepts: [result.lessonPlan.title],
            curriculumObjectives: result.lessonPlan.objectives,
            targetAge: "3-5 Years",
            skillsMapped: [],
            flashcards: result.lessonPlan.objectives.map(obj => ({ question: "Learning Objective", answer: obj })),
            quiz: [],
            activitySuggestions: result.lessonPlan.steps,
            translations: {
              Tamil: { summary: "", concepts: [] },
              Hindi: { summary: "", concepts: [] }
            }
          }
        };

        persistResource(resourceData);
        onProcessed?.(resourceData);

        setTimeout(() => {
          setIsOpen(false);
          resetState();
          toast({
            title: "Voice-to-Lesson Complete",
            description: `Generated: ${result.lessonPlan.title}`,
          });
        }, 800);
      };
      reader.readAsDataURL(audioBlob);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: err.message
      });
      resetState();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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
          
          const result = await processEducationalContent({
            contentDataUri: dataUri,
            contentType: file.type,
            resourceId: resourceId,
          });

          setProgress(90);
          setProcessingStatus("Generating Flashcards & Quiz...");
          
          setProgress(100);
          setProcessingStatus("Knowledge Base Updated!");
          
          const resourceData = {
            id: resourceId,
            ...result,
            aiContent: {
              summary: result.summary,
              keyConcepts: result.keyConcepts,
              curriculumObjectives: result.curriculumObjectives,
              targetAge: result.targetAge,
              skillsMapped: result.skillsMapped,
              flashcards: result.flashcards,
              quiz: result.quiz,
              activitySuggestions: result.activitySuggestions,
              translations: result.translations
            },
            fileName: file.name,
            fileType: file.type,
            timestamp: new Date().toISOString()
          };

          persistResource(resourceData);
          onProcessed?.(resourceData);

          setTimeout(() => {
            setIsOpen(false);
            resetState();
            toast({
              title: "AI Analysis Complete",
              description: "Flashcards, quizzes, and translations have been saved permanently.",
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
    if (!user) return;

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

      const resourceId = Math.random().toString(36).substring(2, 11);
      const resourceData = {
        id: resourceId,
        ...result,
        fileName: `YouTube: ${youtubeUrl.substring(0, 30)}...`,
        fileType: "video/youtube",
        timestamp: new Date().toISOString()
      };

      persistResource(resourceData);
      onProcessed?.(resourceData);

      setTimeout(() => {
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
    setAudioBlob(null);
    setIsRecording(false);
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
        <Button 
          disabled={!user || isUserLoading}
          className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all font-headline text-base bg-primary"
        >
          {isUserLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          {isUserLoading ? "Initializing..." : "Add Resource"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle className="font-headline text-2xl">Autonomous AI Processing</DialogTitle>
          </div>
          <DialogDescription className="font-body text-base">
            Upload media or record a voice idea for instant structured lessons.
          </DialogDescription>
        </DialogHeader>

        {!isUploading ? (
          <Tabs defaultValue="voice" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="voice" className="gap-2"><Mic className="w-4 h-4" /> Voice Idea</TabsTrigger>
              <TabsTrigger value="file" className="gap-2"><Upload className="w-4 h-4" /> File</TabsTrigger>
              <TabsTrigger value="link" className="gap-2"><Youtube className="w-4 h-4" /> Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="voice" className="pt-4 space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl bg-muted/30">
                {!audioBlob ? (
                  <div className="space-y-4 text-center">
                    <div className={`p-6 rounded-full transition-all ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary/10'}`}>
                      {isRecording ? (
                        <Square className="w-12 h-12 text-red-600 cursor-pointer" onClick={stopRecording} />
                      ) : (
                        <Mic className="w-12 h-12 text-primary cursor-pointer" onClick={startRecording} />
                      )}
                    </div>
                    <p className="font-headline font-bold">{isRecording ? "Recording your idea..." : "Tap mic to speak your idea"}</p>
                    <p className="text-xs text-muted-foreground font-body max-w-[200px]">"Tomorrow we will teach shapes using paper cutouts."</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-center w-full">
                    <div className="p-4 bg-emerald-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-body">Voice recorded</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setAudioBlob(null)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button className="w-full gap-2" onClick={handleVoiceSubmit}>
                      Generate Lesson Plan <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

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
