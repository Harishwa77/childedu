
"use client";

import { useState, useMemo } from "react";
import { BookOpen, Users, Star, FileText, Video, Music, ChevronRight, Sparkles, BrainCircuit, FilePlus, Loader2, CheckCircle2, XCircle, UserCheck, PlusCircle, Save, User, Target, Layers, MessageCircle, Mail, Send, Reply, Trash2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { DashboardTab, Resource, UserMessage } from "@/app/page";
import { generateLessonPlan, LessonPlanOutput } from "@/ai/flows/generate-lesson-plan";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TranslationSelector } from "./TranslationSelector";
import { cn } from "@/lib/utils";
import { useFirestore, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

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
  roster: Student[];
  setRoster: React.Dispatch<React.SetStateAction<Student[]>>;
  messages: UserMessage[];
  onSendMessage: (msg: { subject: string; text: string }) => void;
  onMarkRead: (id: string) => void;
}

export function TeacherDashboard({ searchQuery, activeTab, resources, roster, setRoster, messages, onSendMessage, onMarkRead }: TeacherDashboardProps) {
  const { toast } = useToast();
  const db = useFirestore();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlanOutput | null>(null);
  const [planLanguage, setPlanLanguage] = useState<"English" | "Tamil" | "Hindi">("English");
  
  const [milestoneEntryStudent, setMilestoneEntryStudent] = useState<Student | null>(null);
  const [tempSkills, setTempSkills] = useState({ language: 50, numeracy: 50, social: 50, motor: 50 });

  const [replyingTo, setReplyingTo] = useState<UserMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  const teacherMessages = useMemo(() => messages.filter(m => m.to === "Teacher"), [messages]);

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

  const handleDeleteResource = (resourceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!db) return;
    
    if (confirm("Are you sure you want to delete this resource permanently?")) {
      const docRef = doc(db, "educational_resources", resourceId);
      deleteDocumentNonBlocking(docRef);
      setSelectedResource(null);
      toast({
        title: "Resource Deleted",
        description: "The resource has been permanently removed from the knowledge base."
      });
    }
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

  const handleSendReply = () => {
    if (!replyText.trim() || !replyingTo) return;
    onSendMessage({
      subject: `Re: ${replyingTo.subject}`,
      text: replyText
    });
    onMarkRead(replyingTo.id);
    toast({ title: "Reply Sent", description: "Your message has been sent to the parent." });
    setReplyingTo(null);
    setReplyText("");
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

  const unreadMessagesCount = teacherMessages.filter(m => !m.read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-primary text-white border-none overflow-hidden relative shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Star className="w-4 h-4" /> Today's Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold font-headline">Sensory Play & Art</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">85%</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{roster.filter(s => s.present).length}/{roster.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2 text-accent">
                <Mail className="w-4 h-4" /> Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{unreadMessagesCount} New</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-bold text-foreground">Teacher Hub</h2>
        <UploadModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resources" className="gap-2"><Layers className="w-4 h-4" /> Resources</TabsTrigger>
              <TabsTrigger value="messages" className="gap-2"><MessageCircle className="w-4 h-4" /> Parent Inbox</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources" className="pt-4">
              <ScrollArea className="h-[500px] rounded-xl border bg-white p-4">
                <div className="space-y-4">
                  {filteredResources.map((res) => (
                    <Card key={res.id} className="border-accent/10 hover:border-primary/20 transition-all shadow-sm cursor-pointer group" onClick={() => setSelectedResource(res)}>
                      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{getIcon(res.fileType)}</div>
                          <div className="flex flex-col">
                             <CardTitle className="text-sm font-semibold truncate max-w-[200px]">{res.fileName}</CardTitle>
                             {res.aiContent && <Badge variant="secondary" className="h-4 text-[8px] mt-1">{res.aiContent.targetAge}</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteResource(res.id, e)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-3">
                        <p className="text-sm text-muted-foreground font-body italic line-clamp-2">"{res.summary}"</p>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredResources.length === 0 && (
                    <div className="py-20 text-center opacity-40">
                      <FileText className="w-12 h-12 mx-auto mb-2" />
                      <p>No educational resources found.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="messages" className="pt-4">
              <ScrollArea className="h-[500px] rounded-xl border bg-white p-4">
                <div className="space-y-4">
                  {teacherMessages.length > 0 ? teacherMessages.map((msg) => (
                    <Card key={msg.id} className={cn("hover:bg-accent/5 transition-colors border-accent/10", !msg.read && "border-l-4 border-l-primary bg-primary/5")}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"><User className="w-4 h-4 text-accent" /></div>
                            <p className="font-bold text-sm">{msg.from}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{msg.date}</span>
                        </div>
                        <CardTitle className="text-xs mt-2">{msg.subject}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground font-body">{msg.text}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end">
                        <Button variant="ghost" size="sm" className="gap-2 text-primary" onClick={() => setReplyingTo(msg)}>
                          <Reply className="w-4 h-4" />
                          Reply
                        </Button>
                      </CardFooter>
                    </Card>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-60 py-12">
                      <Mail className="w-12 h-12" />
                      <p className="font-headline text-lg">Your inbox is empty</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
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

      <Dialog open={!!replyingTo} onOpenChange={(open) => !open && setReplyingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Reply to {replyingTo?.from}</DialogTitle>
            <DialogDescription>Your message will be sent to the parent dashboard.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg text-sm italic text-muted-foreground border-l-4 border-primary/20">
              "{replyingTo?.text}"
            </div>
            <div className="space-y-2">
              <Label>Your Reply</Label>
              <Textarea 
                placeholder="Write your response..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendReply} disabled={!replyText.trim()} className="gap-2">
              <Send className="w-4 h-4" /> Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto bg-white border-l shadow-2xl p-0">
          {selectedResource && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
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
                  <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDeleteResource(selectedResource.id)}>
                    <Trash2 className="w-4 h-4" /> Delete Permanently
                  </Button>
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
                      <div className="flex items-center justify-between">
                        <h4 className="font-headline font-bold text-lg flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5 text-accent" /> Semantic Connections
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-red-500 mt-1" />
                          <div className="flex-1">
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
                          <PlusCircle className="w-5 h-5 text-emerald-500 mt-1" />
                          <div className="flex-1">
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

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Pedagogical Summary</h4>
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
                    </div>
                    {lessonPlan && (
                      <Card className="mt-4 border-primary/20 bg-primary/5">
                        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                          <CardTitle className="text-lg font-headline">{lessonPlan.title}</CardTitle>
                          <TranslationSelector 
                            content={`${lessonPlan.title}\n\n${lessonPlan.steps.join('\n')}`} 
                            onTranslate={(val) => {
                              const lines = val.split('\n');
                              setLessonPlan({ ...lessonPlan, title: lines[0], steps: lines.slice(2) });
                            }} 
                          />
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                           <p className="text-sm font-body leading-relaxed">{lessonPlan.steps[0]}...</p>
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
