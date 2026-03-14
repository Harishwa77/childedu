
"use client";

import { useState, useMemo } from "react";
import { BookOpen, Users, Star, FileText, Video, Music, Lightbulb, Clock, ChevronRight, Sparkles, TrendingUp, BrainCircuit, Wand2, FilePlus, Loader2, Languages, CheckCircle2, XCircle, UserCheck, AlertCircle, Activity, PlusCircle, Save, User } from "lucide-react";
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
import { DashboardTab, Resource } from "@/app/page";
import { generateLessonPlan, LessonPlanOutput } from "@/ai/flows/generate-lesson-plan";
import { generateMagicMoment } from "@/ai/flows/generate-magic-moment-flow";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";

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
              <span className="text-xs text-muted-foreground font-body">{filteredResources.length} items found</span>
            </div>
            <ScrollArea className="h-[600px] rounded-xl border bg-white p-4">
              <div className="space-y-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map((res) => (
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
                             {res.analysis && <span className="text-[10px] text-primary font-bold">AI Analysis Available</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-3 space-y-3">
                        <p className="text-sm text-muted-foreground font-body italic leading-relaxed line-clamp-2">
                          "{res.summary}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {res.keyActivities?.slice(0, 2).map((act: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[10px] uppercase font-bold text-accent border-accent/20">
                              {act}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-2">
                    <div className="p-4 bg-muted rounded-full">
                      <FileText className="w-8 h-8 text-muted-foreground opacity-20" />
                    </div>
                    <p className="font-headline font-bold text-lg text-muted-foreground">No matching resources</p>
                  </div>
                )}
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
              <Badge variant="outline" className="font-body">Synced with Parent Portal</Badge>
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
                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedStudent(student)}>
                              {student.name}
                            </p>
                            {student.className && <p className="text-[10px] text-muted-foreground">{student.className}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleAttendance(student.id)}
                            className={student.present ? "text-emerald-600 p-1" : "text-red-500 p-1"}
                          >
                            {student.present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setManualEntryStudent(student)}
                            className="h-7 text-[10px] gap-1 px-2"
                          >
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

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Weekly Skill Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Growth Area</p>
                    <p className="text-lg font-bold">Social Cooperation</p>
                    <p className="text-sm text-emerald-600 font-bold">+24% improvement</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Focus Needed</p>
                    <p className="text-lg font-bold">Early Literacy</p>
                    <p className="text-sm text-orange-600 font-bold">-5% engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Manual Activity Entry Dialog */}
      <Dialog open={!!manualEntryStudent} onOpenChange={(open) => !open && setManualEntryStudent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Manual Activity Entry</DialogTitle>
            <DialogDescription>
              Log an observation or activity directly for <strong>{manualEntryStudent?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activity">Observation / Activity Note</Label>
              <Textarea 
                id="activity" 
                placeholder="Describe what the student did today..."
                value={manualActivityText}
                onChange={(e) => setManualActivityText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveManualActivity} className="gap-2" disabled={!manualActivityText.trim()}>
              <Save className="w-4 h-4" /> Log Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Profile Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                 {selectedStudent?.name[0]}
               </div>
               <div>
                 <DialogTitle className="font-headline text-3xl">{selectedStudent?.name}</DialogTitle>
                 <DialogDescription className="font-body text-base">
                   {selectedStudent?.className || "General Preschool"} • {selectedStudent?.mentorName || "Ms. Clara"}
                 </DialogDescription>
               </div>
            </div>
          </DialogHeader>
          
          <div className="py-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Skill Breakdown */}
              <div className="space-y-4">
                <h4 className="font-headline font-bold text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" /> Developmental Skills
                </h4>
                <div className="space-y-4">
                  {[
                    { label: "Language", value: selectedStudent?.skills?.language || 0, color: "bg-blue-500" },
                    { label: "Numeracy", value: selectedStudent?.skills?.numeracy || 0, color: "bg-emerald-500" },
                    { label: "Social", value: selectedStudent?.skills?.social || 0, color: "bg-purple-500" },
                    { label: "Motor", value: selectedStudent?.skills?.motor || 0, color: "bg-orange-500" },
                  ].map((skill) => (
                    <div key={skill.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span>{skill.label}</span>
                        <span>{skill.value}%</span>
                      </div>
                      <Progress value={skill.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Progress Chart */}
              <div className="space-y-4">
                <h4 className="font-headline font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Learning Progress
                </h4>
                <div className="h-48 w-full bg-muted/20 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedStudent?.history || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[0, 100]} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-center text-muted-foreground font-body">Aggregated development score over 5 months</p>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> AI Mentor Note
              </h4>
              <p className="text-sm font-body text-muted-foreground italic">
                "{selectedStudent?.name} is showing exceptional growth in {selectedStudent?.skills && selectedStudent.skills.social > 80 ? 'social dynamics' : 'tactile exploration'}. Recommend introducing more complex group-based problem solving tasks next month."
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedResource} onOpenChange={(open) => {
        if (!open) {
          setSelectedResource(null);
          setLessonPlan(null);
          setMagicMomentUrl(null);
        }
      }}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto bg-white border-l shadow-2xl">
          {selectedResource && (
            <div className="space-y-8 py-6">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    {getIcon(selectedResource.fileType)}
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-headline font-bold text-primary">Resource Insights</SheetTitle>
                    <SheetDescription className="font-body text-base">
                      {selectedResource.fileName}
                    </SheetDescription>
                  </div>
                </div>
                <div className="flex items-center justify-between border-y py-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(selectedResource.timestamp).toLocaleString()}
                  </div>
                  <TranslationSelector 
                    content={selectedResource.summary} 
                    onTranslate={(val) => {
                      setResources(prev => prev.map(p => p.id === selectedResource.id ? { ...p, summary: val } : p));
                      setSelectedResource({ ...selectedResource, summary: val });
                    }} 
                  />
                </div>
              </SheetHeader>

              {/* AI Video Analysis Section */}
              {selectedResource.analysis && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                   <h4 className="font-headline font-bold text-lg flex items-center gap-2 text-primary">
                    <Activity className="w-5 h-5" />
                    Classroom Video Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Activity</p>
                        <p className="text-sm font-bold">{selectedResource.analysis.activityName}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Engagement</p>
                        <Badge variant="outline" className="mt-1">{selectedResource.analysis.studentEngagement}</Badge>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                      <p className="text-xs font-bold text-muted-foreground">Participation Patterns</p>
                      <p className="text-sm font-body">{selectedResource.analysis.participationPatterns}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                      <p className="text-xs font-bold text-muted-foreground">Teaching Effectiveness</p>
                      <p className="text-sm font-body">{selectedResource.analysis.teachingEffectiveness}</p>
                    </div>
                    <Alert className="bg-emerald-50 border-emerald-200">
                      <AlertCircle className="h-4 w-4 text-emerald-600" />
                      <AlertTitle className="text-emerald-800 font-bold">Recommended Improvement</AlertTitle>
                      <AlertDescription className="text-emerald-700">
                        {selectedResource.analysis.recommendedImprovement}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-headline font-bold text-lg flex items-center gap-2 text-foreground">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Summary
                </h4>
                <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 relative">
                  <p className="text-lg font-body leading-relaxed text-foreground italic">
                    "{selectedResource.summary}"
                  </p>
                </div>
              </div>

              {magicMomentUrl && (
                <div className="space-y-3 animate-in fade-in zoom-in duration-500">
                  <h4 className="font-headline font-bold text-lg flex items-center gap-2 text-primary">
                    <Video className="w-5 h-5" />
                    Generated Magic Moment
                  </h4>
                  <div className="rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl bg-black aspect-video">
                    <video src={magicMomentUrl} controls className="w-full h-full" autoPlay />
                  </div>
                </div>
              )}

              {lessonPlan && (
                <Card className="border-primary/20 bg-primary/5 animate-in slide-in-from-right-5 duration-500">
                  <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">{lessonPlan.title}</CardTitle>
                    <CardDescription>Target: 3-5 years</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Objectives</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {lessonPlan.objectives.map((o, i) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Steps</p>
                      <ol className="list-decimal pl-5 text-sm space-y-2">
                        {lessonPlan.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </div>
                    <div className="pt-2 border-t text-xs italic text-muted-foreground">
                      Generated in {planLanguage}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="pt-6 space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Lesson Plan Language</label>
                      <Select value={planLanguage} onValueChange={(val: any) => setPlanLanguage(val)}>
                        <SelectTrigger className="w-full bg-muted/30">
                          <Languages className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
                          <SelectItem value="Hindi">Hindi (हिन्दी)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleGenerateLessonPlan} 
                      disabled={isGeneratingPlan}
                      variant="outline" 
                      className="font-headline font-bold gap-2"
                    >
                      {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
                      Generate Lesson Plan
                    </Button>
                    <Button 
                      onClick={handleGenerateMagicMoment}
                      disabled={isGeneratingVideo}
                      className="font-headline font-bold bg-accent hover:bg-accent/90 gap-2"
                    >
                      {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      Create Magic Moment
                    </Button>
                  </div>
                </div>
              </div>

              {selectedResource.transcript && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-headline font-bold text-lg flex items-center gap-2 text-foreground">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Transcript
                  </h4>
                  <ScrollArea className="h-48 rounded-2xl border bg-muted/20 p-6">
                    <p className="font-body text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {selectedResource.transcript}
                    </p>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
