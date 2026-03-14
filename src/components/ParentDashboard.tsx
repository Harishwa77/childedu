"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Activity, Book, Sparkles, Home, ChevronRight, Clock, Volume2, Loader2, BrainCircuit, Target, UserCircle, School, Search, FileText, Video, Music, Edit3, Save, CheckCircle2, TrendingUp, AlertCircle, Lightbulb, Zap, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { generateParentalLearningInsights, ParentalLearningInsightsOutput } from "@/ai/flows/generate-parental-learning-insights";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DashboardTab, Resource, ChildRegistrationInfo } from "@/app/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Student } from "./TeacherDashboard";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ParentDashboardProps {
  searchQuery: string;
  activeTab?: DashboardTab;
  resources: Resource[];
  roster: Student[];
  childInfo: ChildRegistrationInfo;
  onRegisterChild: (info: ChildRegistrationInfo) => void;
}

export function ParentDashboard({ searchQuery, activeTab, resources, roster, childInfo, onRegisterChild }: ParentDashboardProps) {
  const [insights, setInsights] = useState<ParentalLearningInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);
  
  const childData = useMemo(() => {
    return roster.find(s => s.name.toLowerCase() === childInfo.name.toLowerCase());
  }, [roster, childInfo.name]);

  const { toast } = useToast();

  const filteredTeacherResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const query = searchQuery.toLowerCase();
    return resources.filter(res => 
      res.fileName.toLowerCase().includes(query) ||
      res.summary.toLowerCase().includes(query)
    );
  }, [resources, searchQuery]);

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      try {
        const res = await generateParentalLearningInsights({
          childName: childInfo.name,
          classroomObservations: `${childInfo.name} has been participating well in group activities. We've noticed consistent engagement with tactile learning tools recently.`,
          processedEducationalContent: "Our current module explores 'Physicality and Patterns' through hands-on building and sorting exercises.",
          skills: childData?.skills
        });
        setInsights(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, [childInfo.name, childData?.skills]);

  const toggleActivity = (idx: number) => {
    if (completedActivities.includes(idx)) {
      setCompletedActivities(prev => prev.filter(i => i !== idx));
    } else {
      setCompletedActivities(prev => [...prev, idx]);
      toast({
        title: "Activity Completed! 🎉",
        description: `Great job supporting ${childInfo.name}'s learning journey at home.`,
      });
    }
  };

  const connectionScore = Math.min(100, (completedActivities.length / (insights?.homeActivitySuggestions.length || 1)) * 100);

  const handleListen = async () => {
    if (!insights || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      const res = await textToSpeech({
        text: insights.learningSummary,
        voiceName: "Algenib"
      });
      
      const audio = new Audio(res.audioDataUri);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  const [tempChildInfo, setTempChildInfo] = useState<ChildRegistrationInfo>(childInfo);

  const handleSaveRegistration = () => {
    onRegisterChild(tempChildInfo);
    setIsRegDialogOpen(false);
    toast({ title: "Profile Updated", description: "Student registration details have been saved." });
  };

  const getIcon = (type: string) => {
    if (type.includes("video")) return <Video className="w-5 h-5 text-purple-600" />;
    if (type.includes("audio")) return <Music className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Welcome back, Parent</h2>
          <p className="text-muted-foreground font-body flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            {childInfo.name}'s Learning Journey
          </p>
        </div>
        
        <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
          <DialogTrigger asChild>
            <Card className="border-primary/20 bg-primary/5 flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors group">
              <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="font-body text-sm">
                <p className="font-bold text-primary">{childInfo.name}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <School className="w-3 h-3" /> {childInfo.className}
                </div>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Child Registration</DialogTitle>
              <DialogDescription>Update your child's information for personalized AI recommendations.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Child's Name</Label>
                <Input id="name" value={tempChildInfo.name} onChange={(e) => setTempChildInfo({...tempChildInfo, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class">Class</Label>
                <Input id="class" value={tempChildInfo.className} onChange={(e) => setTempChildInfo({...tempChildInfo, className: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mentor">Mentor Name</Label>
                <Input id="mentor" value={tempChildInfo.mentorName} onChange={(e) => setTempChildInfo({...tempChildInfo, mentorName: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveRegistration} className="gap-2">
                <Save className="w-4 h-4" /> Save Registration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg overflow-hidden flex flex-col">
            <CardHeader className="bg-primary text-white p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6" /> Classroom Insight
                  </CardTitle>
                  <CardDescription className="text-white/80 font-body">AI-generated summary of {childInfo.name}'s week</CardDescription>
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={handleListen}
                  disabled={isLoading || isSpeaking}
                >
                  {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 bg-white">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                </div>
              ) : (
                <p className="text-lg font-body leading-relaxed text-muted-foreground italic">
                  "{insights?.learningSummary}"
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Connection Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="p-4 bg-emerald-50 rounded-2xl">
                    <Activity className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-headline">{Math.round(connectionScore)}%</p>
                    <p className="text-xs text-muted-foreground font-body">Home Alignment</p>
                  </div>
                </div>
                <Progress value={connectionScore} className="h-2" />
              </CardContent>
            </Card>

            {insights?.targetedIntervention && (
              <Alert className="bg-blue-50 border-blue-200 border-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-800 font-headline font-bold">Personalized Recommendation</AlertTitle>
                <AlertDescription className="text-blue-700 font-body mt-2">
                  {insights.targetedIntervention}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {(activeTab === "dashboard" || activeTab === "resources") && (
        <div className="space-y-4">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" />
            Classroom Activity Pack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.filter(r => !searchQuery || r.fileName.toLowerCase().includes(searchQuery.toLowerCase())).map((res) => (
              <Card 
                key={res.id} 
                className="hover:border-primary cursor-pointer transition-all group"
                onClick={() => setSelectedResource(res)}
              >
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{getIcon(res.fileType)}</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold truncate text-sm">{res.fileName}</p>
                    <p className="text-xs text-muted-foreground truncate italic">"{res.summary}"</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto bg-white rounded-t-[2rem]">
          {selectedResource && (
            <div className="max-w-4xl mx-auto space-y-8 py-8">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    {getIcon(selectedResource.fileType)}
                  </div>
                  <SheetTitle className="text-3xl font-headline font-bold text-primary">{selectedResource.fileName}</SheetTitle>
                </div>
              </SheetHeader>

              <Tabs defaultValue="home-kit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 max-w-md mx-auto">
                  <TabsTrigger value="home-kit" className="gap-2"><Home className="w-4 h-4" /> Home Learning Pack</TabsTrigger>
                  <TabsTrigger value="study-kit" className="gap-2"><Book className="w-4 h-4" /> Child Review Kit</TabsTrigger>
                </TabsList>

                <TabsContent value="home-kit" className="pt-8 space-y-8">
                  <div className="space-y-4">
                     <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                       <Zap className="w-5 h-5 text-accent" /> Multilingual Classroom Summary
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-primary/5 border-none p-6">
                           <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">English</p>
                           <p className="text-sm font-body leading-relaxed">{selectedResource.aiContent?.summary || selectedResource.summary}</p>
                        </Card>
                        <Card className="bg-primary/5 border-none p-6">
                           <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Tamil (தமிழ்)</p>
                           <p className="text-sm font-body leading-relaxed">{selectedResource.aiContent?.translations.Tamil.summary || "கிடைக்கவில்லை"}</p>
                        </Card>
                        <Card className="bg-primary/5 border-none p-6">
                           <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Hindi (हिन्दी)</p>
                           <p className="text-sm font-body leading-relaxed">{selectedResource.aiContent?.translations.Hindi.summary || "उपलब्ध नहीं है"}</p>
                        </Card>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-headline font-bold">Suggested Activities for You</h4>
                    <div className="grid gap-4">
                      {(selectedResource.aiContent?.activitySuggestions || selectedResource.keyActivities).map((act, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="font-body text-base">{act}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="study-kit" className="pt-8 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                      <HelpCircle className="w-6 h-6 text-blue-500" /> interactive Flashcards for {childInfo.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {selectedResource.aiContent?.flashcards.map((card, i) => (
                         <Card key={i} className="border-2 border-primary/20 hover:border-primary transition-all p-8 text-center cursor-pointer group relative h-48 flex items-center justify-center">
                            <p className="font-headline font-bold text-lg group-hover:opacity-0 transition-opacity">{card.question}</p>
                            <div className="absolute inset-0 bg-primary text-white p-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                               <p className="font-body text-lg italic">"{card.answer}"</p>
                            </div>
                         </Card>
                       ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
