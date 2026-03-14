"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Activity, Book, Sparkles, Home, ChevronRight, Volume2, Loader2, BrainCircuit, Target, UserCircle, School, FileText, Video, Music, Save, CheckCircle2, Lightbulb, Zap, HelpCircle, Layers, BookOpen, Moon, Star, MessageCircle, Send, User, Mail, Calendar, TrendingUp, History, Clock, Fingerprint, Network, ArrowRight, Info, Library, Filter, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { generateParentalLearningInsights, type ParentalLearningInsightsOutput } from "@/ai/flows/generate-parental-learning-insights";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { generateBedtimeStory, type BedtimeStoryOutput } from "@/ai/flows/generate-bedtime-story";
import { generatePersonalizedStudyPlan, type PersonalizedStudyPlanOutput } from "@/ai/flows/generate-personalized-study-plan";
import { useToast } from "@/hooks/use-toast";
import { 
  DashboardTab, 
  Resource, 
  ChildRegistrationInfo, 
  UserMessage 
} from "@/app/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Student } from "./TeacherDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TranslationSelector } from "./TranslationSelector";
import { Textarea } from "@/components/ui/textarea";

interface StudyInteraction {
  resourceId: string;
  resourceName: string;
  type: 'view' | 'quiz_complete' | 'flashcard_flip';
  performance?: number;
  timestamp: string;
}

interface TimelineEvent {
  week: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
}

interface ParentDashboardProps {
  searchQuery: string;
  activeTab?: DashboardTab;
  resources: Resource[];
  roster: Student[];
  childInfo: ChildRegistrationInfo;
  onRegisterChild: (info: ChildRegistrationInfo) => void;
  onSendMessage: (msg: { subject: string; text: string }) => void;
  messages: UserMessage[];
  onMarkRead: (id: string) => void;
}

export function ParentDashboard({ searchQuery, activeTab, resources, roster, childInfo, onRegisterChild, onSendMessage, messages, onMarkRead }: ParentDashboardProps) {
  const [insights, setInsights] = useState<ParentalLearningInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [isMessaging, setIsMessaging] = useState(false);
  const [isMsgDialogOpen, setIsMsgDialogOpen] = useState(false);
  
  const [bedtimeStory, setBedtimeStory] = useState<BedtimeStoryOutput | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const [studyHistory, setStudyHistory] = useState<StudyInteraction[]>([]);
  const [studyPlan, setStudyPlan] = useState<PersonalizedStudyPlanOutput | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const { toast } = useToast();

  const timelineEvents: TimelineEvent[] = [
    { week: 1, title: "Mastered Numbers 1-10", description: "Leo can now identify and count objects up to 10 with 90% accuracy.", icon: <TrendingUp className="w-4 h-4" />, status: 'completed' },
    { week: 3, title: "Started Phonics A-M", description: "Began phonemic awareness with focus on initial letter sounds.", icon: <BookOpen className="w-4 h-4" />, status: 'completed' },
    { week: 5, title: "Collaborative Storytelling", description: "Leo is currently learning to contribute plot ideas in group story time.", icon: <Sparkles className="w-4 h-4" />, status: 'current' },
    { week: 7, title: "Shape Logic & Sorting", description: "Next focus will be on geometric classification and pattern recognition.", icon: <BrainCircuit className="w-4 h-4" />, status: 'upcoming' },
  ];

  const curiosityGraph = useMemo(() => {
    const allConcepts = resources.flatMap(r => r.aiContent?.keyConcepts || []);
    const uniqueConcepts = Array.from(new Set(allConcepts)).slice(0, 8);
    
    const nodes = uniqueConcepts.map((concept, i) => ({
      id: concept,
      strength: Math.floor(Math.random() * 40) + 60,
      connections: uniqueConcepts.slice(i + 1, i + 3)
    }));
    
    return nodes;
  }, [resources]);

  const childData = useMemo(() => {
    return roster.find(s => s.name.toLowerCase() === childInfo.name.toLowerCase());
  }, [roster, childInfo.name]);

  const parentMessages = useMemo(() => messages.filter(m => m.to === "Parent"), [messages]);

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const query = searchQuery.toLowerCase();
    return resources.filter(res => 
      res.fileName.toLowerCase().includes(query) ||
      res.summary.toLowerCase().includes(query)
    );
  }, [resources, searchQuery]);

  // Recommendation Engine: Suggest resources based on interaction history
  const recommendations = useMemo(() => {
    if (studyHistory.length === 0) return resources.slice(0, 3);

    // Get concepts from viewed resources
    const interactedResourceIds = new Set(studyHistory.map(h => h.resourceId));
    const viewedConcepts = new Set(
      studyHistory.flatMap(h => {
        const res = resources.find(r => r.id === h.resourceId);
        return res?.aiContent?.keyConcepts || [];
      })
    );

    // Find resources that share concepts but haven't been viewed yet
    return resources
      .filter(r => !interactedResourceIds.has(r.id))
      .filter(r => r.aiContent?.keyConcepts.some(c => viewedConcepts.has(c)))
      .slice(0, 3);
  }, [resources, studyHistory]);

  // Similarity Engine for selected resource
  const similarResources = useMemo(() => {
    if (!selectedResource) return [];
    
    return resources
      .filter(r => r.id !== selectedResource.id)
      .filter(r => {
        const sharedConcepts = r.aiContent?.keyConcepts.filter(c => 
          selectedResource.aiContent?.keyConcepts.includes(c)
        );
        const sharedSkills = r.aiContent?.skillsMapped.filter(s => 
          selectedResource.aiContent?.skillsMapped.includes(s)
        );
        return (sharedConcepts?.length || 0) > 0 || (sharedSkills?.length || 0) > 0;
      })
      .slice(0, 3);
  }, [selectedResource, resources]);

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
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "AI Analysis Limited",
          description: "We're experiencing high demand. Some insights may be generic until traffic subsides.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, [childInfo.name, childData?.skills, toast]);

  const trackInteraction = (resourceId: string, resourceName: string, type: StudyInteraction['type'], performance?: number) => {
    const newInteraction: StudyInteraction = {
      resourceId,
      resourceName,
      type,
      performance,
      timestamp: new Date().toISOString(),
    };
    setStudyHistory(prev => [newInteraction, ...prev]);
  };

  const handleGenerateStudyPlan = async () => {
    if (studyHistory.length < 1) {
      toast({ title: "More Data Needed", description: "Interact with some resources first so the AI can analyze learning patterns!" });
      return;
    }
    setIsGeneratingPlan(true);
    try {
      const plan = await generatePersonalizedStudyPlan({
        childName: childInfo.name,
        history: studyHistory.map(h => ({
          resourceName: h.resourceName,
          type: h.type,
          performance: h.performance,
          timestamp: h.timestamp
        })),
        currentSkills: childData?.skills
      });
      setStudyPlan(plan);
      toast({ title: "Adaptive Plan Ready", description: "We've created a study path based on your child's interests." });
    } catch (error) {
      toast({ variant: "destructive", title: "Generation Failed", description: "The AI analyst is busy. Try again in a minute." });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!selectedResource) return;
    setIsGeneratingStory(true);
    setBedtimeStory(null);
    try {
      const story = await generateBedtimeStory({
        childName: childInfo.name,
        activitySummary: selectedResource.summary,
        theme: "Magic"
      });
      setBedtimeStory(story);
      toast({ title: "Bedtime Story Ready! 🌙", description: `A unique story for ${childInfo.name} has been created.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Story Failed", description: "The storytelling engine is currently at capacity. Please try again soon." });
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setIsMessaging(true);
    onSendMessage({
      subject: messageSubject || `Regarding ${childInfo.name}`,
      text: messageText
    });
    setTimeout(() => {
      toast({ title: "Message Sent", description: `Your message has been sent to ${childInfo.mentorName}.` });
      setMessageText("");
      setMessageSubject("");
      setIsMessaging(false);
      setIsMsgDialogOpen(false);
    }, 1000);
  };

  const handleListen = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const res = await textToSpeech({ text });
      const audio = new Audio(res.audioDataUri);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("video") || type.includes("youtube")) return <Video className="w-5 h-5 text-purple-600" />;
    if (type.includes("audio")) return <Music className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  const ResourceList = ({ items }: { items: Resource[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.length > 0 ? items.map((res) => (
        <Card key={res.id} className="border-accent/10 hover:border-primary/20 transition-all shadow-sm cursor-pointer group bg-white" onClick={() => {
          setSelectedResource(res);
          trackInteraction(res.id, res.fileName, 'view');
        }}>
          <CardHeader className="p-4 flex flex-row items-center gap-3">
            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{getIcon(res.fileType)}</div>
            <div className="flex flex-col truncate">
               <CardTitle className="text-sm font-semibold truncate">{res.fileName}</CardTitle>
               <span className="text-[10px] text-muted-foreground">{new Date(res.timestamp).toLocaleDateString()}</span>
            </div>
          </CardHeader>
        </Card>
      )) : (
        <div className="col-span-full text-center py-12 opacity-40">
          <Filter className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-body">No resources in this format.</p>
        </div>
      )}
    </div>
  );

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
        
        <div className="flex items-center gap-3">
          <Dialog open={isMsgDialogOpen} onOpenChange={setIsMsgDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full border-primary/20">
                <MessageCircle className="w-4 h-4 text-primary" />
                Teacher Center
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Message {childInfo.mentorName}</DialogTitle>
                <DialogDescription>Discuss {childInfo.name}'s progress or view replies.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="send">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="send">Send Message</TabsTrigger>
                  <TabsTrigger value="inbox" className="gap-2">
                    Inbox {parentMessages.some(m => !m.read) && <Badge className="w-2 h-2 p-0 bg-red-500" />}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="send" className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input 
                      placeholder="e.g. Activity Question" 
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Message</Label>
                    <Textarea 
                      placeholder="How did the counting activity go today?" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSendMessage} disabled={isMessaging || !messageText.trim()} className="gap-2 w-full">
                      {isMessaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Message
                    </Button>
                  </DialogFooter>
                </TabsContent>
                <TabsContent value="inbox" className="py-4">
                  <ScrollArea className="h-[300px] rounded-lg border p-4 bg-muted/10">
                    <div className="space-y-4">
                      {parentMessages.length > 0 ? parentMessages.map((msg) => (
                        <Card key={msg.id} className={cn("border-accent/10", !msg.read && "border-l-4 border-l-primary bg-primary/5")}>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                              <p className="font-bold text-sm flex items-center gap-2 text-primary">
                                <School className="w-3 h-3" /> Teacher Reply
                              </p>
                              <span className="text-[10px] text-muted-foreground">{msg.date}</span>
                            </div>
                            <CardTitle className="text-xs mt-1">{msg.subject}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground font-body">{msg.text}</p>
                          </CardContent>
                          {!msg.read && (
                            <CardFooter className="p-4 pt-0 flex justify-end">
                              <Button variant="ghost" size="sm" onClick={() => onMarkRead(msg.id)}>Mark as Read</Button>
                            </CardFooter>
                          )}
                        </Card>
                      )) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Mail className="w-8 h-8 mx-auto opacity-20 mb-2" />
                          <p>No messages yet.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-primary/20 bg-primary/5 flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors group">
                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20">
                  <Fingerprint className="w-6 h-6 text-primary" />
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
                <div className="grid gap-2"><Label>Child's Name</Label><Input defaultValue={childInfo.name} id="regName" /></div>
                <div className="grid gap-2"><Label>Class</Label><Input defaultValue={childInfo.className} id="regClass" /></div>
                <div className="grid gap-2"><Label>Mentor</Label><Input defaultValue={childInfo.mentorName} id="regMentor" /></div>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                   const n = (document.getElementById('regName') as HTMLInputElement).value;
                   const c = (document.getElementById('regClass') as HTMLInputElement).value;
                   const m = (document.getElementById('regMentor') as HTMLInputElement).value;
                   onRegisterChild({ name: n, className: c, mentorName: m });
                   setIsRegDialogOpen(false);
                }} className="gap-2"><Save className="w-4 h-4" /> Save Registration</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto h-12">
          <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm">Growth Map</TabsTrigger>
          <TabsTrigger value="dna" className="gap-2 text-xs sm:text-sm">Learning DNA</TabsTrigger>
          <TabsTrigger value="study-plan" className="gap-2 text-xs sm:text-sm">Adaptive Plan</TabsTrigger>
          <TabsTrigger value="vault" className="gap-2 text-xs sm:text-sm"><Library className="w-4 h-4" /> Library</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 pt-4">
          {/* Recommendations Header */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" /> Recommended for {childInfo.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map(res => (
                  <Card key={res.id} className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => {
                    setSelectedResource(res);
                    trackInteraction(res.id, res.fileName, 'view');
                  }}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">{getIcon(res.fileType)}</div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-bold truncate">{res.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">Matches curiosity graph</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg overflow-hidden flex flex-col">
              <CardHeader className="bg-primary text-white p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Skill Progress</CardTitle>
                    <CardDescription className="text-white/80 font-body">Current developmental proficiency</CardDescription>
                  </div>
                  <Button size="icon" variant="secondary" className="rounded-full bg-white/20 hover:bg-white/30 text-white" onClick={() => handleListen(insights?.learningSummary || "")} disabled={isLoading || isSpeaking}>
                    {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1">
                {isLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="space-y-2"><div className="h-3 w-24 bg-muted animate-pulse rounded" /><div className="h-2 w-full bg-muted animate-pulse rounded" /></div>)}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {[
                      { label: "Language Skills", val: childData?.skills?.language || 0, color: "bg-blue-500" },
                      { label: "Numbers & Logic", val: childData?.skills?.numeracy || 0, color: "bg-emerald-500" },
                      { label: "Social Interaction", val: childData?.skills?.social || 0, color: "bg-orange-500" },
                      { label: "Motor & Creativity", val: childData?.skills?.motor || 0, color: "bg-purple-500" },
                    ].map((skill, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-body">
                          <span className="font-semibold text-muted-foreground">{skill.label}</span>
                          <span className="font-bold text-foreground">{skill.val}%</span>
                        </div>
                        <Progress value={skill.val} className="h-1.5" />
                      </div>
                    ))}
                    <Separator />
                    <p className="text-sm font-body italic text-muted-foreground">"{insights?.learningSummary}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Classroom Connection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="p-4 bg-emerald-50 rounded-2xl"><Network className="w-8 h-8 text-emerald-600" /></div>
                     <div className="text-right">
                       <p className="text-2xl font-bold font-headline">88%</p>
                       <p className="text-xs text-muted-foreground font-body">Curriculum Alignment</p>
                     </div>
                  </div>
                  <Progress value={88} className="h-2" />
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
                <div className="absolute top-2 right-2 opacity-10">
                  <Lightbulb className="w-20 h-20 text-primary" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" /> Recommended Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-body text-sm">
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-primary/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">Based on {childInfo.name}'s interest in animals, we recommend a tactile "Texture Sorting" activity at home.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl font-headline">Smart Learning Timeline</CardTitle>
              </div>
              <CardDescription className="font-body">Leo's growth milestones over the weeks</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-accent before:to-muted">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
                      event.status === 'completed' ? "bg-emerald-500 text-white" : 
                      event.status === 'current' ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
                    )}>
                      {event.icon}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-primary font-headline">Week {event.week}</div>
                        {event.status === 'completed' && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px]">Achieved</Badge>}
                        {event.status === 'current' && <Badge className="bg-primary/10 text-primary border-none text-[10px]">In Progress</Badge>}
                      </div>
                      <div className="text-sm font-bold text-foreground mb-1">{event.title}</div>
                      <div className="text-xs text-muted-foreground font-body leading-relaxed">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dna" className="pt-4 space-y-6">
           <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-900 to-primary text-white overflow-hidden">
             <CardHeader>
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                   <Fingerprint className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center justify-between">
                     <div>
                       <CardTitle className="text-3xl font-headline font-bold">{childInfo.name}'s Learning DNA</CardTitle>
                       <CardDescription className="text-indigo-100">AI Curiosity & Interest Map</CardDescription>
                     </div>
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                             <Info className="w-5 h-5" />
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent className="max-w-xs p-4 space-y-2">
                           <p className="font-bold">What is Learning DNA?</p>
                           <p className="text-xs">It identifies your child's core "Learning Identity" by mapping semantic connections between their favorite topics and developing skills. It explains the "What" and "Why" of their curiosity.</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </div>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div className="relative aspect-square max-w-[400px] mx-auto">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-24 h-24 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
                       <BrainCircuit className="w-16 h-16 text-white relative z-10 opacity-80" />
                    </div>
                    {curiosityGraph.map((node, i) => {
                      const angle = (i / curiosityGraph.length) * 2 * Math.PI;
                      const x = 50 + 35 * Math.cos(angle);
                      const y = 50 + 35 * Math.sin(angle);
                      return (
                        <div 
                          key={node.id}
                          className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all cursor-default group"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div className="text-[10px] font-bold uppercase tracking-tighter opacity-60 mb-1">Concept</div>
                          <div className="text-xs font-headline font-bold text-center leading-tight">{node.id}</div>
                          <div className="mt-1 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: `${node.strength}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                 </div>

                 <div className="space-y-6">
                    <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                      <h4 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-400" /> AI DNA Insights
                      </h4>
                      <div className="space-y-4 font-body">
                         <div className="flex gap-4">
                           <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                             <TrendingUp className="w-5 h-5 text-emerald-400" />
                           </div>
                           <div>
                             <p className="font-bold text-sm">Primary Learning Mode</p>
                             <p className="text-xs text-white/70">Leo shows high visual-tactile affinity, excelling in activities that combine storytelling with physical manipulation.</p>
                           </div>
                         </div>
                         <div className="flex gap-4">
                           <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center shrink-0">
                             <Target className="w-5 h-5 text-orange-400" />
                           </div>
                           <div>
                             <p className="font-bold text-sm">Expanding Curiosity</p>
                             <p className="text-xs text-white/70">Interest in 'Animals' is successfully bridging into 'Conservation' and 'Empathy' skill sets.</p>
                           </div>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                       <p className="text-sm font-bold uppercase tracking-widest text-white/50">Next Recommended Interests</p>
                       <div className="flex flex-wrap gap-2">
                         {['Environmental Care', 'Geometric Patterns', 'Puppetry', 'Sequence Logic'].map((tag) => (
                           <Badge key={tag} className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm cursor-pointer transition-colors">
                             {tag} <ArrowRight className="w-3 h-3 ml-2" />
                           </Badge>
                         ))}
                       </div>
                    </div>
                 </div>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="study-plan" className="pt-4 space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-white">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-headline flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> Adaptive AI Plan</CardTitle>
                      <CardDescription className="text-white/80">Actionable Roadmap for Parent Engagement.</CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                            <Info className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-4 space-y-2">
                          <p className="font-bold">What is an Adaptive Plan?</p>
                          <p className="text-xs">This is the "How" and "When." It translates the Learning DNA into a forward-looking weekly schedule with specific tasks to accelerate development through high-interest zones.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="ml-4">
                  <Button variant="secondary" onClick={handleGenerateStudyPlan} disabled={isGeneratingPlan} className="gap-2">
                    {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    Generate Path
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {studyPlan ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
                  <div className="p-6 bg-muted/30 rounded-2xl border-l-4 border-primary">
                    <h4 className="font-headline font-bold text-lg mb-2">Cognitive Roadmap</h4>
                    <p className="text-muted-foreground font-body leading-relaxed">{studyPlan.analysis}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xl font-headline font-bold flex items-center gap-2"><Target className="w-5 h-5 text-red-500" /> High-Priority Nodes</h4>
                      {studyPlan.recommendedPath.map((rec, i) => (
                        <Card key={i} className="border-accent/10">
                          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold">{rec.topic}</CardTitle>
                            <Badge className={cn("text-[10px]", rec.priority === 'High' ? 'bg-red-500' : 'bg-blue-500')}>{rec.priority}</Badge>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <p className="text-xs text-muted-foreground font-body">{rec.reason}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-headline font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-500" /> Weekly Path</h4>
                      <div className="space-y-3">
                        {studyPlan.weeklySchedule.map((day, i) => (
                          <div key={i} className="flex gap-4 items-start p-3 bg-white rounded-xl border shadow-sm">
                            <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg text-xs min-w-[50px] text-center">{day.day.substring(0, 3)}</div>
                            <div>
                              <p className="text-sm font-bold">{day.activity}</p>
                              <p className="text-[10px] text-muted-foreground italic">Obj: {day.objective}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                    <Fingerprint className="w-10 h-10 text-muted-foreground opacity-20" />
                  </div>
                  <div>
                    <h4 className="text-xl font-headline font-bold">Roadmap Awaiting Data</h4>
                    <p className="text-muted-foreground max-w-sm mx-auto font-body">Tap "Generate Path" to translate {childInfo.name}'s Curiosity Graph into a weekly actionable roadmap.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vault" className="pt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-headline font-bold flex items-center gap-2">
              <Library className="w-6 h-6 text-primary" /> Resource Vault
            </h3>
          </div>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-10 bg-muted/30 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
            </TabsList>
            <div className="min-h-[400px]">
              <TabsContent value="all" className="m-0">
                <ResourceList items={filteredResources} />
              </TabsContent>
              <TabsContent value="video" className="m-0">
                <ResourceList items={filteredResources.filter(r => r.fileType.includes("video") || r.fileType.includes("youtube"))} />
              </TabsContent>
              <TabsContent value="audio" className="m-0">
                <ResourceList items={filteredResources.filter(r => r.fileType.includes("audio"))} />
              </TabsContent>
              <TabsContent value="docs" className="m-0">
                <ResourceList items={filteredResources.filter(r => !r.fileType.includes("video") && !r.fileType.includes("audio") && !r.fileType.includes("youtube"))} />
              </TabsContent>
            </div>
          </Tabs>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto bg-white rounded-t-[2rem]">
          {selectedResource && (
            <div className="max-w-4xl mx-auto space-y-8 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">{getIcon(selectedResource.fileType)}</div>
                  <SheetTitle className="text-3xl font-headline font-bold text-primary">{selectedResource.fileName}</SheetTitle>
                </div>
                <Button variant="outline" className="gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={handleGenerateStory} disabled={isGeneratingStory}>
                  {isGeneratingStory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Moon className="w-4 h-4" />}
                  Generate Bedtime Story
                </Button>
              </div>

              <Tabs defaultValue="home-kit" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/30 max-w-lg mx-auto">
                  <TabsTrigger value="home-kit" className="gap-2"><Home className="w-4 h-4" /> Home Pack</TabsTrigger>
                  <TabsTrigger value="study-kit" className="gap-2"><BookOpen className="w-4 h-4" /> Study Kit</TabsTrigger>
                  <TabsTrigger value="objectives" className="gap-2"><Target className="w-4 h-4" /> Knowledge Map</TabsTrigger>
                </TabsList>

                <TabsContent value="home-kit" className="pt-8 space-y-8">
                  {/* Bedtime Story Result */}
                  {bedtimeStory && (
                    <Card className="border-none bg-indigo-50/50 shadow-sm animate-in zoom-in-95 duration-500 overflow-hidden">
                      <CardHeader className="bg-indigo-600 text-white flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Moon className="w-6 h-6" />
                          <div>
                            <CardTitle className="font-headline text-xl">{bedtimeStory.title}</CardTitle>
                            <CardDescription className="text-indigo-100">A personalized bedtime tale for {childInfo.name}</CardDescription>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleListen(bedtimeStory.story)}>
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-8 space-y-6">
                        <p className="text-lg font-body leading-relaxed text-indigo-900 first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left whitespace-pre-wrap">
                          {bedtimeStory.story}
                        </p>
                        <Alert className="bg-white border-indigo-200">
                          <Star className="h-4 w-4 text-indigo-600" />
                          <AlertTitle className="font-headline font-bold text-indigo-900">Moral of the Story</AlertTitle>
                          <AlertDescription className="text-indigo-700 italic">"{bedtimeStory.moral}"</AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-primary" /> Multi-Skill Insights
                      </h4>
                      <TranslationSelector 
                        content={selectedResource.aiContent?.summary || selectedResource.summary} 
                        onTranslate={(val) => {
                          if (selectedResource.aiContent) {
                            setSelectedResource({
                              ...selectedResource,
                              aiContent: { ...selectedResource.aiContent, summary: val }
                            });
                          } else {
                            setSelectedResource({ ...selectedResource, summary: val });
                          }
                        }}
                      />
                    </div>
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-base font-body leading-relaxed">{selectedResource.aiContent?.summary || selectedResource.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-headline font-bold">Suggested Activities</h4>
                    <div className="grid gap-4">
                      {(selectedResource.aiContent?.activitySuggestions || selectedResource.keyActivities).map((act, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setCompletedActivities(prev => prev.includes(i) ? prev.filter(a => a !== i) : [...prev, i])}>
                          <CheckCircle2 className={cn("w-5 h-5 mt-0.5 shrink-0", completedActivities.includes(i) ? "text-emerald-500" : "text-muted-foreground")} />
                          <p className="font-body text-base">{act}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similarity Recommendations */}
                  {similarResources.length > 0 && (
                    <div className="space-y-4">
                      <Separator />
                      <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                        <ThumbsUp className="w-6 h-6 text-primary" /> You Might Also Like
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {similarResources.map(res => (
                          <Card key={res.id} className="border-accent/10 hover:border-primary/20 transition-all shadow-sm cursor-pointer" onClick={() => {
                            setSelectedResource(res);
                            trackInteraction(res.id, res.fileName, 'view');
                          }}>
                            <CardHeader className="p-4 flex flex-col items-center gap-2 text-center">
                              <div className="p-2 bg-muted rounded-lg">{getIcon(res.fileType)}</div>
                              <CardTitle className="text-xs font-bold truncate w-full">{res.fileName}</CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="study-kit" className="pt-8 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-primary" /> Interactive Flashcards
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedResource.aiContent?.flashcards?.map((card, i) => (
                        <Card key={i} className="p-6 bg-muted/20 border-none hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden h-32 flex flex-col justify-center" onClick={() => trackInteraction(selectedResource.id, selectedResource.fileName, 'flashcard_flip')}>
                           <div className="absolute top-0 right-0 p-2 opacity-10"><BookOpen className="w-8 h-8" /></div>
                           <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Question</p>
                           <p className="text-sm font-bold leading-tight group-hover:hidden">{card.question}</p>
                           <div className="hidden group-hover:block animate-in fade-in duration-300">
                             <p className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-widest">Answer</p>
                             <p className="text-sm font-body italic text-muted-foreground">{card.answer}</p>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {selectedResource.aiContent?.quiz && selectedResource.aiContent.quiz.length > 0 && (
                    <div className="space-y-6">
                      <Separator />
                      <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-orange-500" /> Knowledge Check Quiz
                      </h4>
                      <div className="grid gap-6">
                        {selectedResource.aiContent.quiz.map((q, i) => (
                          <div key={i} className="space-y-3">
                            <p className="font-bold text-lg font-headline">{i + 1}. {q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {q.options.map((opt, idx) => (
                                <Button 
                                  key={idx} 
                                  variant="outline" 
                                  className="justify-start font-body h-auto py-3 px-4 text-left whitespace-normal hover:bg-primary/5 hover:border-primary/50"
                                  onClick={() => {
                                    const isCorrect = opt === q.correctAnswer;
                                    trackInteraction(selectedResource.id, selectedResource.fileName, 'quiz_complete', isCorrect ? 100 : 0);
                                    if (isCorrect) {
                                      toast({ title: "Correct! 🌟", description: "That's exactly right." });
                                    } else {
                                      toast({ variant: "destructive", title: "Try again", description: "Not quite, but keep exploring!" });
                                    }
                                  }}
                                >
                                  {opt}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="objectives" className="pt-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-accent/5">
                      <CardHeader><CardTitle className="text-lg font-headline">Knowledge Graph Nodes</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {selectedResource.aiContent?.keyConcepts?.map((concept, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-accent/10 text-sm font-body flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-primary" /> {concept}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-emerald-50">
                      <CardHeader><CardTitle className="text-lg font-headline">Skill DNA</CardTitle></CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {selectedResource.aiContent?.skillsMapped?.map((skill, i) => (
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
