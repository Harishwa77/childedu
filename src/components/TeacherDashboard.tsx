"use client";

import { useState, useMemo } from "react";
import { BookOpen, Users, Star, FileText, Video, Music, Lightbulb, Clock, ChevronRight, Sparkles, TrendingUp, BrainCircuit, Wand2, FilePlus, Loader2, Languages, CheckCircle2, XCircle, UserCheck, AlertCircle, Activity, PlusCircle, Save, User, Edit2, Zap, HelpCircle, Target, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DashboardTab, Resource } from "@/app/page";
import { generateLessonPlan, LessonPlanOutput } from "@/ai/flows/generate-lesson-plan";
import { generateMagicMoment } from "@/ai/flows/generate-magic-moment-flow";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
  
  const [milestoneEntryStudent, setMilestoneEntryStudent] = useState<Student | null>(null);
  const [tempSkills, setTempSkills] = useState({ language: 50, numeracy: 50, social: 50, motor: 50 });

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
        return { ...s, skills: { ...tempSkills }, history: newHistory };
      }
      return s;
    }));

    setMilestoneEntryStudent(null);
    toast({ title: "Milestones Updated", description: `Developmental scores for ${milestoneEntryStudent.name} have been updated.` });
  };

  const handleGenerateLessonPlan = async () => {
    if (!selectedResource) return;
    setIsGeneratingPlan(true);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-white border-none overflow-hidden relative shadow-lg">
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
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none">On Track</Badge>
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
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none">Live Update</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-bold text-foreground">Teacher Hub</h2>
        <UploadModal onProcessed={handleNewProcessed} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Knowledge Graph Resources
          </h3>
          <ScrollArea className="h-[500px] rounded-xl border bg-white p-4">
            <div className="space-y-4">
              {filteredResources.map((res) => (
                <Card 
                  key={res.id} 
                  className="border-accent/10 hover:border-primary/20 transition-all shadow-sm cursor-pointer group"
                  onClick={() => setSelectedResource(res)}
                >
                  <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{getIcon(res.fileType)}</div>
                      <div className="flex flex-col">
                         <CardTitle className="text-sm font-semibold truncate max-w-[200px]">{res.fileName}</CardTitle>
                         {res.aiContent && (
                           <div className="flex gap-1 mt-1">
                             <Badge variant="secondary" className="h-4 text-[8px] bg-primary/10 text-primary border-none">
                               {res.aiContent.targetAge}
                             </Badge>
                             <Badge variant="secondary" className="h-4 text-[8px] bg-emerald-50 text-emerald-700 border-none">
                               {res.aiContent.skillsMapped?.length || 0} Skills
                             </Badge>
                           </div>
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

        <div className="space-y-6">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Classroom Roster
          </h3>
          <Card className="border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-headline">Student</TableHead>
                  <TableHead className="font-headline">Actions</TableHead>
                  <TableHead className="font-headline">Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.map((student) => (
                  <TableRow key={student.id} className="group hover:bg-accent/5">
                    <TableCell className="font-medium font-body">
                      <p className="font-bold">{student.name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleAttendance(student.id)} className={student.present ? "text-emerald-600" : "text-red-500"}>
                          {student.present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setMilestoneEntryStudent(student)} className="h-7 text-[10px] gap-1 px-2">
                          <PlusCircle className="w-3 h-3" /> Skills
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
      </div>

      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto bg-white border-l shadow-2xl p-0">
          {selectedResource && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    {getIcon(selectedResource.fileType)}
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-headline font-bold text-primary">{selectedResource.fileName}</SheetTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-primary/20 text-primary border-none">{selectedResource.aiContent?.targetAge || "All Ages"}</Badge>
                      <Badge className="bg-emerald-100 text-emerald-700 border-none">Autonomous Logic</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6">
                <Tabs defaultValue="knowledge" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                    <TabsTrigger value="knowledge">Knowledge Map</TabsTrigger>
                    <TabsTrigger value="study">Study Kit</TabsTrigger>
                    <TabsTrigger value="lesson">AI Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="knowledge" className="pt-6 space-y-6">
                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl space-y-4">
                      <h4 className="font-headline font-bold text-lg flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-accent" /> Semantic Connections
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-red-500 mt-1" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Curriculum Objectives</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedResource.aiContent?.curriculumObjectives?.map((obj, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] bg-white">{obj}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-start gap-3">
                          <Activity className="w-5 h-5 text-emerald-500 mt-1" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skills Mapped</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedResource.aiContent?.skillsMapped?.map((skill, i) => (
                                <Badge key={i} className="bg-emerald-50 text-emerald-700 border-none text-[10px]">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Pedagogical Summary</h4>
                      <p className="text-sm font-body leading-relaxed italic">"{selectedResource.aiContent?.summary || selectedResource.summary}"</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="study" className="pt-6 space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-lg">Key Concepts</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResource.aiContent?.keyConcepts?.map((concept, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-none">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-lg">Interactive Flashcards</h4>
                      <div className="grid gap-4">
                        {selectedResource.aiContent?.flashcards?.map((card, i) => (
                          <Card key={i} className="p-4 bg-muted/20 border-none hover:bg-muted/40 transition-colors cursor-pointer group">
                             <p className="text-xs font-bold text-primary mb-1">Q: {card.question}</p>
                             <p className="text-sm font-body opacity-0 group-hover:opacity-100 transition-opacity">A: {card.answer}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lesson" className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Button className="w-full gap-2 h-12" onClick={handleGenerateLessonPlan} disabled={isGeneratingPlan}>
                        {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-5 h-5" />}
                        Generate Structural Lesson Plan
                      </Button>
                      <Button variant="secondary" className="w-full gap-2 h-12" onClick={handleGenerateMagicMoment} disabled={isGeneratingVideo}>
                        {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        Generate Magic Moment Video
                      </Button>
                    </div>
                    {lessonPlan && (
                      <Card className="mt-4 border-primary/20 bg-primary/5">
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg font-headline">{lessonPlan.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                           <p className="text-sm font-body leading-relaxed">{lessonPlan.steps[0]}...</p>
                           <Button variant="link" className="p-0 text-xs h-auto">View full PDF</Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!milestoneEntryStudent} onOpenChange={(open) => !open && setMilestoneEntryStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Update Milestones: {milestoneEntryStudent?.name}</DialogTitle>
            <DialogDescription>Manually update skill scores for developmental tracking.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {['Language', 'Numeracy', 'Social', 'Motor'].map((skill) => (
              <div key={skill} className="space-y-3">
                <div className="flex justify-between">
                  <Label className="capitalize font-bold">{skill} Skills</Label>
                  <span className="text-sm font-bold text-primary">{tempSkills[skill.toLowerCase() as keyof typeof tempSkills]}%</span>
                </div>
                <Slider 
                  value={[tempSkills[skill.toLowerCase() as keyof typeof tempSkills]]}
                  onValueChange={([val]) => setTempSkills(prev => ({ ...prev, [skill.toLowerCase()]: val }))}
                  max={100} step={1}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveMilestones} className="gap-2"><Save className="w-4 h-4" /> Save Milestones</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
