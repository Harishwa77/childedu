
"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Activity, Book, Sparkles, Home, ChevronRight, Clock, Volume2, Loader2, BrainCircuit, Target, UserCircle, School, Search, FileText, Video, Music, Edit3, Save, CheckCircle2, TrendingUp, Star } from "lucide-react";
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
import { DashboardTab, Resource } from "@/app/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Student } from "./TeacherDashboard";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from "recharts";

interface ParentDashboardProps {
  searchQuery: string;
  activeTab?: DashboardTab;
  resources: Resource[];
  roster: Student[];
  onRegisterChild: (name: string, className: string, mentorName: string) => void;
}

interface ChildInfo {
  name: string;
  className: string;
  mentorName: string;
}

export function ParentDashboard({ searchQuery, activeTab, resources, roster, onRegisterChild }: ParentDashboardProps) {
  const [insights, setInsights] = useState<ParentalLearningInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);
  
  // Child Profile State
  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: "Leo Johnson",
    className: "Preschool Class B",
    mentorName: "Ms. Clara"
  });
  
  // Find child in roster for developmental data
  const childData = useMemo(() => {
    return roster.find(s => s.name.toLowerCase() === childInfo.name.toLowerCase());
  }, [roster, childInfo.name]);

  // Temp state for editing
  const [tempChildInfo, setTempChildInfo] = useState<ChildInfo>(childInfo);

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
          classroomObservations: `${childInfo.name} showed great curiosity during the science experiment with water today. He was able to predict which items would float or sink with 80% accuracy.`,
          processedEducationalContent: "The current curriculum focuses on early scientific inquiry and causal relationships. We are using tactile experiments to foster critical thinking."
        });
        setInsights(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, [childInfo.name]);

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
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Could not generate audio summary."
      });
      setIsSpeaking(false);
    }
  };

  const handleSaveRegistration = () => {
    setChildInfo(tempChildInfo);
    onRegisterChild(tempChildInfo.name, tempChildInfo.className, tempChildInfo.mentorName);
    setIsRegDialogOpen(false);
    toast({
      title: "Profile Updated",
      description: "Student registration details have been saved and shared with the teacher."
    });
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
          <h2 className="text-3xl font-headline font-bold text-foreground">Welcome back, Sarah</h2>
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
              <div className="font-body text-sm relative">
                <p className="font-bold text-primary">{childInfo.name}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <School className="w-3 h-3" /> {childInfo.className} • Mentor: {childInfo.mentorName}
                </div>
                <Edit3 className="w-3 h-3 absolute -right-4 top-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Register Student Details</DialogTitle>
              <DialogDescription>
                Update your child's information for personalized insights. This will appear in the teacher dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Child's Name</Label>
                <Input 
                  id="name" 
                  value={tempChildInfo.name} 
                  onChange={(e) => setTempChildInfo({...tempChildInfo, name: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class">Class / Section</Label>
                <Input 
                  id="class" 
                  value={tempChildInfo.className} 
                  onChange={(e) => setTempChildInfo({...tempChildInfo, className: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mentor">Mentor / Teacher Name</Label>
                <Input 
                  id="mentor" 
                  value={tempChildInfo.mentorName} 
                  onChange={(e) => setTempChildInfo({...tempChildInfo, mentorName: e.target.value})}
                  className="bg-muted/30"
                />
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
          {/* Learning Summary */}
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
                  <Skeleton className="h-4 w-[95%]" />
                </div>
              ) : (
                <p className="text-lg font-body leading-relaxed text-muted-foreground">
                  "{insights?.learningSummary}"
                </p>
              )}
            </CardContent>
          </Card>

          {/* Connection Stats */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Home-School Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="p-4 bg-emerald-50 rounded-2xl">
                    <Activity className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-headline">{Math.round(connectionScore)}%</p>
                    <p className="text-xs text-muted-foreground font-body">Activity Alignment</p>
                  </div>
                </div>
                <Progress value={connectionScore} className="h-2" />
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <Book className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Milestones</p>
                  <p className="text-2xl font-bold font-headline">Scientific Inquiry</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Shared Classroom Resources Search Results */}
      {searchQuery.trim() !== "" && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Classroom Search Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeacherResources.length > 0 ? (
              filteredTeacherResources.map((res) => (
                <Card 
                  key={res.id} 
                  className="hover:border-primary cursor-pointer transition-all"
                  onClick={() => setSelectedResource(res)}
                >
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="p-2 bg-muted rounded-lg">{getIcon(res.fileType)}</div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold truncate text-sm">{res.fileName}</p>
                      <p className="text-xs text-muted-foreground truncate">{res.summary}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No shared resources found matching your search.</p>
            )}
          </div>
        </div>
      )}

      {/* Home Activities / Insights Tab */}
      {(activeTab === "dashboard" || activeTab === "insights") && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-headline font-bold flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-primary" />
              Developmental Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <Target className="w-5 h-5" /> Learning Milestones
                  </CardTitle>
                  <CardDescription>Progress tracked across core skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-6">
                    {[
                      { area: "Language Skills", progress: childData?.skills?.language || 0, color: "bg-blue-500" },
                      { area: "Numeracy Skills", progress: childData?.skills?.numeracy || 0, color: "bg-emerald-500" },
                      { area: "Social Interaction", progress: childData?.skills?.social || 0, color: "bg-purple-500" },
                      { area: "Motor Skills", progress: childData?.skills?.motor || 0, color: "bg-orange-500" },
                    ].map(item => (
                      <div key={item.area} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                          <span className="font-body text-muted-foreground">{item.area}</span>
                          <span className="text-primary">{item.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-accent/10 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
             </Card>

             <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Learning Progress Over Time
                  </CardTitle>
                  <CardDescription>Developmental score aggregated monthly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={childData?.history || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis hide domain={[0, 100]} />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: "hsl(var(--primary))" }} 
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-headline font-bold flex items-center gap-2">
              <Home className="w-6 h-6 text-accent" />
              Home Activity Suggestions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)
              ) : (
                insights?.homeActivitySuggestions
                  .filter(act => !searchQuery || act.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((act, idx) => (
                  <Card 
                    key={idx} 
                    className={cn(
                      "group hover:border-accent transition-all cursor-pointer relative overflow-hidden",
                      completedActivities.includes(idx) ? "bg-accent/10 border-accent" : ""
                    )}
                    onClick={() => toggleActivity(idx)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          completedActivities.includes(idx) ? "bg-accent text-white" : "bg-accent/10 group-hover:bg-accent group-hover:text-white"
                        )}>
                          {completedActivities.includes(idx) ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        <Badge variant="outline" className="text-[10px] opacity-60">
                          {completedActivities.includes(idx) ? "Completed" : `Activity ${idx + 1}`}
                        </Badge>
                      </div>
                      <p className={cn(
                        "font-body text-base leading-snug transition-colors",
                        completedActivities.includes(idx) ? "text-accent font-bold" : "text-foreground"
                      )}>
                        {act}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Resource Modal */}
      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedResource && (
            <div className="space-y-6 py-6">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    {getIcon(selectedResource.fileType)}
                  </div>
                  <div>
                    <SheetTitle>{selectedResource.fileName}</SheetTitle>
                    <SheetDescription>Shared by Teacher {childInfo.mentorName}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-4">
                <h4 className="font-headline font-bold text-lg">Activity Summary</h4>
                <div className="p-4 bg-muted/50 rounded-xl font-body text-lg italic">
                  "{selectedResource.summary}"
                </div>
                <div className="space-y-2">
                  <h4 className="font-headline font-bold">Key Activities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.keyActivities.map((act, i) => (
                      <Badge key={i} variant="secondary">{act}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
