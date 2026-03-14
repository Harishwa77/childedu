"use client";

import { useState, useMemo } from "react";
import { BookOpen, Users, Star, FileText, Video, Music, Lightbulb, Clock, ChevronRight, Sparkles, TrendingUp, BrainCircuit, Wand2, FilePlus, Loader2, Languages, CheckCircle2, XCircle, UserCheck, AlertCircle, Activity, PlusCircle, Save, User, Edit2, Zap, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";
import { TranslationSelector } from "./TranslationSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DashboardTab, Resource } from "@/app/page";
import { generateLessonPlan, LessonPlanOutput } from "@/ai/flows/generate-lesson-plan";
import { generateMagicMoment } from "@/ai/flows/generate-magic-moment-flow";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Student {
  id: string;
  name: string;
  present: boolean;
  engagement: "High" | "Medium" | "Low";
  className?: string;
  mentorName?: string;
  lastActivity?: string;
  skills?: {
    language: number;
    numeracy: number;
    social: number;
    motor: number;
  };
  history?: { date: string; score: number }[];
}

interface TeacherDashboardProps {
  searchQuery: string;
  activeTab?: DashboardTab;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  roster: Student[];
  setRoster: React.Dispatch<React.SetStateAction<Student[]>>;
}

export function TeacherDashboard({ searchQuery, activeTab, resources, setResources, roster, setRoster }: TeacherDashboardProps) {
  const { toast } = useToast();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlanOutput | null>(null);
  const [magicMomentUrl, setMagicMomentUrl] = useState<string | null>(null);
  const [planLanguage, setPlanLanguage] = useState<"English" | "Tamil" | "Hindi">("English");
  
  const [manualEntryStudent, setManualEntryStudent] = useState<Student | null>(null);
  const [manualActivityText, setManualActivityText] = useState("");

  const [milestoneEntryStudent, setMilestoneEntryStudent] = useState<Student | null>(null);
  const [tempSkills, setTempSkills] = useState({
    language: 50,
    numeracy: 50,
    social: 50,
    motor: 50
  });

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const query = searchQuery.toLowerCase();
    return resources.filter(res => 
      res.fileName.toLowerCase().includes(query) ||
      res.summary.toLowerCase().includes(query) ||
      res.keyActivities?.some((act: string) => act.toLowerCase().includes(query))
    );
  }, [resources, searchQuery]);

  const toggleAttendance = (id: string) => {
    setRoster(prev => prev.map(s => s.id === id ? { ...s, present: !s.present } : s));
  };

  const handleNewProcessed = (data: any) => {
    setResources(prev => [data, ...prev]);
    setSelectedResource(data);
  };

  const handleSaveManualActivity = () => {
    if (!manualEntryStudent || !manualActivityText.trim()) return;

    const newResource: Resource = {
      id: Math.random().toString(36).substring(2, 11),
      fileName: `Manual: ${manualEntryStudent.name}`,
      summary: manualActivityText,
      keyActivities: ["Manual Observation"],
      fileType: "text/plain",
      timestamp: new Date().toISOString(),
      targetStudentId: manualEntryStudent.id
    };

    setResources(prev => [newResource, ...prev]);
    setRoster(prev => prev.map(s => s.id === manualEntryStudent.id ? { ...s, lastActivity: manualActivityText } : s));
    
    setManualEntryStudent(null);
    setManualActivityText("");
    
    toast({
      title: "Activity Logged",
      description: `Manual activity entry saved for ${manualEntryStudent.name}.`
    });
  };

  const handleOpenMilestones = (student: Student) => {
    setMilestoneEntryStudent(student);
    setTempSkills(student.skills || { language: 50, numeracy: 50, social: 50, motor: 50 });
  };

  const handleSaveMilestones = () => {
    if (!milestoneEntryStudent) return;

    const avgScore = Math.round((tempSkills.language + tempSkills.numeracy + tempSkills.social + tempSkills.motor) / 4);
    const date = new Date().toLocaleDateString('en-US', { month: 'short' });

    setRoster(prev => prev.map(s => {
      if (s.id === milestoneEntryStudent.id) {
        const newHistory = [...(s.history || [])];
        const existingIndex = newHistory.findIndex(h => h.date === date);
        if (existingIndex > -1) {
          newHistory[existingIndex] = { date, score: avgScore };
        } else {
          newHistory.push({ date, score: avgScore });
        }

        return {
          ...s,
          skills: { ...tempSkills },
          history: newHistory
        };
      }
      return s;
    }));

    setMilestoneEntryStudent(null);
    toast({
      title: "Milestones Updated",
      description: `Developmental scores for ${milestoneEntryStudent.name} have been updated.`
    });
  };

  const handleGenerateLessonPlan = async () => {
    if (!selectedResource) return;
    setIsGeneratingPlan(true);
    setLessonPlan(null);
    try {
      const plan = await generateLessonPlan({
        summary: selectedResource.summary,
        keyActivities: selectedResource.keyActivities,
        language: planLanguage,
      });
      setLessonPlan(plan);
      toast({ title: "Lesson Plan Ready", description: `A new curriculum plan has been created in ${planLanguage}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Generation Failed", description: "Could not create lesson plan." });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateMagicMoment = async () => {
    if (!selectedResource) return;
    setIsGeneratingVideo(true);
    setMagicMomentUrl(null);
    try {
      const result = await generateMagicMoment({
        prompt: `Create a heartwarming 5-second animated clip showing: ${selectedResource.summary}. Style: soft watercolors, friendly, early childhood education themed.`,
      });
      setMagicMomentUrl(result.videoDataUri);
      toast({ title: "Magic Moment Generated", description: "A high-quality AI video summary is ready." });
    } catch (error) {
      toast({ variant: "destructive", title: "Video Failed", description: "Magic Moment generation is currently at capacity." });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("video")) return <Video className="w-5 h-5 text-purple-600" />;
    if (type.includes("audio")) return <Music className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  const getEngagementBadge = (level: string) => {
    switch (level) {
      case "High": return <Badge className="bg-emerald-100 text-emerald-700 border-none">High Engagement</Badge>;
      case "Medium": return <Badge className="bg-blue-100 text-blue-700 border-none">Steady</Badge>;
      default: return <Badge className="bg-orange-100 text-orange-700 border-none">Low</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {activeTab === "dashboard" && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-headline font-bold text-foreground">Teacher Hub</h2>
              <p className="text-muted-foreground font-body">Managing {roster.length} students in Preschool Class B</p>
            </div>
            <div className="flex gap-2">
              <UploadModal onProcessed={handleNewProcessed} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-white border-none overflow-hidden relative shadow-lg">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <Star className="w-5 h-5" /> Today's Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-headline">Sensory Play & Art</p>
                <p className="text-sm opacity-80 mt-1 font-body">Integrating color theory with tactile exercises</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Curriculum Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Completed this month</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none">On Track</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" /> Today's Presence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{roster.filter(s => s.present).length}/{roster.length}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Students present</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">Live Update</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {(activeTab === "dashboard" || activeTab === "resources") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {searchQuery ? `Search Results for "${searchQuery}"` : "Processed Resources"}
              </h3>
            </div>
            <ScrollArea className="h-[600px] rounded-xl border bg-white p-4">
              <div className="space-y-4">
                {filteredResources.map((res) => (
                  <Card 
                    key={res.id} 
                    className="border-accent/10 hover:border-primary/20 transition-all shadow-sm cursor-pointer group"
                    onClick={() => {
                      setSelectedResource(res);
                      setLessonPlan(null);
                      setMagicMomentUrl(null);
                    }}
                  >
                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{getIcon(res.fileType)}</div>
                        <div className="flex flex-col">
                           <CardTitle className="text-sm font-semibold truncate max-w-[200px]">{res.fileName}</CardTitle>
                           {res.aiContent && (
                             <Badge variant="secondary" className="h-4 text-[9px] bg-primary/10 text-primary border-none">
                               <Zap className="w-2 h-2 mr-1" /> NoteGPT Active
                             </Badge>
                           )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <p className="text-sm text-muted-foreground font-body italic line-clamp-2">"{res.summary}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {(activeTab === "dashboard" || activeTab === "insights") && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-headline font-bold">Classroom Roster</h3>
              </div>
            </div>
            
            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-headline">Student Name</TableHead>
                    <TableHead className="font-headline">Actions</TableHead>
                    <TableHead className="font-headline">Engagement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-accent/5">
                      <TableCell className="font-medium font-body">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="cursor-pointer hover:text-primary transition-colors font-bold" onClick={() => setSelectedStudent(student)}>
                              {student.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleAttendance(student.id)}
                            className={student.present ? "text-emerald-600" : "text-red-500"}
                          >
                            {student.present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setManualEntryStudent(student)} className="h-7 text-[10px] gap-1 px-2">
                            <PlusCircle className="w-3 h-3" /> Entry
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getEngagementBadge(student.engagement)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>

      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto bg-white border-l shadow-2xl p-0">
          {selectedResource && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b bg-primary/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    {getIcon(selectedResource.fileType)}
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-headline font-bold text-primary">{selectedResource.fileName}</SheetTitle>
                    <SheetDescription className="font-body text-base">NoteGPT-style Study Content</SheetDescription>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="concepts">Concepts</TabsTrigger>
                    <TabsTrigger value="study">Study Kit</TabsTrigger>
                    <TabsTrigger value="multilingual">Translate</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-headline font-bold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" /> AI Pedagogical Analysis
                      </h4>
                      <p className="text-lg font-body leading-relaxed text-muted-foreground italic bg-accent/5 p-4 rounded-xl border border-accent/10">
                        "{selectedResource.aiContent?.summary || selectedResource.summary}"
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Activity Suggestions</h4>
                      <div className="grid gap-3">
                        {(selectedResource.aiContent?.activitySuggestions || selectedResource.keyActivities).map((act, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">{i+1}</div>
                            <span className="text-sm font-body">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="concepts" className="pt-6 space-y-4">
                    <h4 className="font-headline font-bold text-lg">Key Educational Concepts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedResource.aiContent?.keyConcepts.map((concept, i) => (
                        <Card key={i} className="bg-primary/5 border-none">
                          <CardContent className="p-4 flex items-center gap-3">
                            <BrainCircuit className="w-5 h-5 text-primary" />
                            <span className="font-bold text-sm">{concept}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="study" className="pt-6 space-y-8">
                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-500" /> Interactive Flashcards
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedResource.aiContent?.flashcards.map((card, i) => (
                          <Card key={i} className="border-primary/20 hover:border-primary transition-all cursor-pointer group h-32 flex flex-col justify-center text-center">
                            <CardContent className="p-4">
                              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Question</p>
                              <p className="text-sm font-body font-bold">{card.question}</p>
                              <div className="mt-2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">Hover to reveal answer</div>
                              <p className="hidden group-hover:block absolute inset-0 bg-primary text-white p-4 text-xs font-body flex items-center justify-center rounded-lg">{card.answer}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-lg flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-500" /> Quick Quiz
                      </h4>
                      <div className="space-y-4">
                        {selectedResource.aiContent?.quiz.map((q, i) => (
                          <Card key={i} className="bg-muted/30">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-sm font-body">{q.question}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 grid grid-cols-2 gap-2">
                              {q.options.map((opt, oi) => (
                                <Button key={oi} variant="outline" className="text-[10px] h-8 justify-start px-2 font-body hover:bg-primary hover:text-white">
                                  {opt}
                                </Button>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="multilingual" className="pt-6 space-y-6">
                    <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-2xl border">
                        <h5 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                          <Languages className="w-4 h-4" /> Tamil Version (தமிழ்)
                        </h5>
                        <p className="text-sm font-body leading-relaxed mb-4">{selectedResource.aiContent?.translations.Tamil.summary}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedResource.aiContent?.translations.Tamil.concepts.map((c, i) => (
                            <Badge key={i} variant="secondary" className="bg-white border text-[10px]">{c}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-2xl border">
                        <h5 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                          <Languages className="w-4 h-4" /> Hindi Version (हिन्दी)
                        </h5>
                        <p className="text-sm font-body leading-relaxed mb-4">{selectedResource.aiContent?.translations.Hindi.summary}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedResource.aiContent?.translations.Hindi.concepts.map((c, i) => (
                            <Badge key={i} variant="secondary" className="bg-white border text-[10px]">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="p-6 border-t bg-white">
                <div className="grid grid-cols-2 gap-4">
                   <Button variant="outline" className="gap-2" onClick={handleGenerateLessonPlan} disabled={isGeneratingPlan}>
                     {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
                     Curriculum Plan
                   </Button>
                   <Button className="gap-2 bg-accent" onClick={handleGenerateMagicMoment} disabled={isGeneratingVideo}>
                     {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                     Magic Moment
                   </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
