"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Activity, Book, Sparkles, Home, ChevronRight, Volume2, Loader2, BrainCircuit, Target, UserCircle, School, FileText, Video, Music, Save, CheckCircle2, Lightbulb, Zap, HelpCircle, Layers } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Student } from "./TeacherDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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

  const filteredResources = useMemo(() => {
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
          classroomObservations: `${childInfo.name} has been participating well in group activities.`,
          processedEducationalContent: "Our Knowledge Graph currently maps tactile block building to social and spatial skills.",
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
      toast({ title: "Activity Completed! 🎉", description: "Great job supporting your child's learning journey." });
    }
  };

  const connectionScore = Math.min(100, (completedActivities.length / (insights?.homeActivitySuggestions.length || 1)) * 100);

  const handleListen = async () => {
    if (!insights || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const res = await textToSpeech({ text: insights.learningSummary });
      const audio = new Audio(res.audioDataUri);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  const [tempChildInfo, setTempChildInfo] = useState<ChildRegistrationInfo>(childInfo);

  const getIcon = (type: string) => {
    if (type.includes("video")) return <Video className="w-5 h-5 text-purple-600" />;
    if (type.includes("audio")) return <Music className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Parent Dashboard</h2>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Child Registration</DialogTitle>
              <DialogDescription>Update your child's information for the Knowledge Graph.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Child's Name</Label><Input value={tempChildInfo.name} onChange={(e) => setTempChildInfo({...tempChildInfo, name: e.target.value})} /></div>
              <div className="grid gap-2"><Label>Class</Label><Input value={tempChildInfo.className} onChange={(e) => setTempChildInfo({...tempChildInfo, className: e.target.value})} /></div>
              <div className="grid gap-2"><Label>Mentor</Label><Input value={tempChildInfo.mentorName} onChange={(e) => setTempChildInfo({...tempChildInfo, mentorName: e.target.value})} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => { onRegisterChild(tempChildInfo); setIsRegDialogOpen(false); }} className="gap-2"><Save className="w-4 h-4" /> Save Registration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-primary text-white p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="w-6 h-6" /> Skill Progress</CardTitle>
                  <CardDescription className="text-white/80 font-body">Knowledge Graph Insight for {childInfo.name}</CardDescription>
                </div>
                <Button size="icon" variant="secondary" className="rounded-full bg-white/20 hover:bg-white/30 text-white" onClick={handleListen} disabled={isLoading || isSpeaking}>
                  {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? <div className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-[90%]" /></div> : (
                <div className="space-y-4">
                  <p className="text-lg font-body leading-relaxed text-muted-foreground italic">"{insights?.learningSummary}"</p>
                  <div className="flex gap-2">
                    <Badge className="bg-primary/10 text-primary border-none">Mapped to Curriculum</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Connection Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="p-4 bg-emerald-50 rounded-2xl"><Activity className="w-8 h-8 text-emerald-600" /></div>
                 <div className="text-right">
                   <p className="text-2xl font-bold font-headline">{Math.round(connectionScore)}%</p>
                   <p className="text-xs text-muted-foreground font-body">Home-School Alignment</p>
                 </div>
              </div>
              <Progress value={connectionScore} className="h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-headline font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Mapped Classroom Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <Card key={res.id} className="hover:border-primary cursor-pointer transition-all group" onClick={() => setSelectedResource(res)}>
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{getIcon(res.fileType)}</div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold truncate text-sm">{res.fileName}</p>
                  <div className="flex gap-1 mt-1">
                    {res.aiContent?.skillsMapped.slice(0, 2).map((s, i) => (
                      <Badge key={i} className="text-[8px] h-3 bg-muted border-none">{s}</Badge>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto bg-white rounded-t-[2rem]">
          {selectedResource && (
            <div className="max-w-4xl mx-auto space-y-8 py-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">{getIcon(selectedResource.fileType)}</div>
                <SheetTitle className="text-3xl font-headline font-bold text-primary">{selectedResource.fileName}</SheetTitle>
              </div>

              <Tabs defaultValue="home-kit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 max-w-md mx-auto">
                  <TabsTrigger value="home-kit" className="gap-2"><Home className="w-4 h-4" /> Home Learning Pack</TabsTrigger>
                  <TabsTrigger value="objectives" className="gap-2"><Target className="w-4 h-4" /> Learning Objectives</TabsTrigger>
                </TabsList>

                <TabsContent value="home-kit" className="pt-8 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                      <BrainCircuit className="w-6 h-6 text-primary" /> Multi-Skill Insights
                    </h4>
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-base font-body leading-relaxed">{selectedResource.aiContent?.summary || selectedResource.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-headline font-bold">Suggested Activities</h4>
                    <div className="grid gap-4">
                      {(selectedResource.aiContent?.activitySuggestions || selectedResource.keyActivities).map((act, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleActivity(i)}>
                          <CheckCircle2 className={cn("w-5 h-5 mt-0.5 shrink-0", completedActivities.includes(i) ? "text-emerald-500" : "text-muted-foreground")} />
                          <p className="font-body text-base">{act}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="objectives" className="pt-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-accent/5">
                      <CardHeader><CardTitle className="text-lg font-headline">Curriculum Standards</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {selectedResource.aiContent?.curriculumObjectives.map((obj, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-accent/10 text-sm font-body">{obj}</div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-emerald-50">
                      <CardHeader><CardTitle className="text-lg font-headline">Skill Nodes</CardTitle></CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {selectedResource.aiContent?.skillsMapped.map((skill, i) => (
                          <Badge key={i} className="bg-emerald-600 text-white border-none px-4 py-2 text-sm">{skill}</Badge>
                        ))}
                      </CardContent>
                    </Card>
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
