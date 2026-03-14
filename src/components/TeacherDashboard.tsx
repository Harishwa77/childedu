
"use client";

import { useState, useMemo } from "react";
import { Users, Star, UserCheck, PlusCircle, Save, School, Mail, Send, Reply, MessageCircle, CheckCircle2, XCircle, Trash2, FileVideo, FileAudio, FileText, LayoutGrid, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { DashboardTab, UserMessage, Resource } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadModal } from "./UploadModal";
import { TranslationSelector } from "./TranslationSelector";
import { cn } from "@/lib/utils";

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
  roster: Student[];
  setRoster: React.Dispatch<React.SetStateAction<Student[]>>;
  messages: UserMessage[];
  onSendMessage: (msg: { subject: string; text: string }) => void;
  onMarkRead: (id: string) => void;
  resources: Resource[];
  onUploadResource: (res: Resource) => void;
  onDeleteResource: (id: string) => void;
}

export function TeacherDashboard({ 
  searchQuery, 
  activeTab, 
  roster, 
  setRoster, 
  messages, 
  onSendMessage, 
  onMarkRead,
  resources,
  onUploadResource,
  onDeleteResource
}: TeacherDashboardProps) {
  const { toast } = useToast();
  
  const [milestoneEntryStudent, setMilestoneEntryStudent] = useState<Student | null>(null);
  const [tempSkills, setTempSkills] = useState({ language: 50, numeracy: 50, social: 50, motor: 50 });

  const [replyingTo, setReplyingTo] = useState<UserMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const teacherMessages = useMemo(() => messages.filter(m => m.to === "Teacher"), [messages]);

  const filteredResources = useMemo(() => {
    return resources.filter(r => 
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [resources, searchQuery]);

  const toggleAttendance = (id: string) => {
    setRoster(prev => prev.map(s => s.id === id ? { ...s, present: !s.present } : s));
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

  const getEngagementBadge = (level: string) => {
    switch (level) {
      case "High": return <Badge className="bg-emerald-100 text-emerald-700 border-none">High Engagement</Badge>;
      case "Medium": return <Badge className="bg-blue-100 text-blue-700 border-none">Steady</Badge>;
      default: return <Badge className="bg-orange-100 text-orange-700 border-none">Low</Badge>;
    }
  };

  const getResourceIcon = (type: string) => {
    if (type.includes('video')) return <FileVideo className="w-5 h-5 text-blue-500" />;
    if (type.includes('audio')) return <FileAudio className="w-5 h-5 text-emerald-500" />;
    return <FileText className="w-5 h-5 text-orange-500" />;
  };

  if (activeTab === "resources") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-headline font-bold text-foreground">Resource Library</h2>
            <p className="text-muted-foreground font-body">Manage classroom lessons and activities.</p>
          </div>
          <UploadModal onUpload={onUploadResource} />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-full h-12">
            <TabsTrigger value="all" className="rounded-full px-6 gap-2"><LayoutGrid className="w-4 h-4" /> All</TabsTrigger>
            <TabsTrigger value="video" className="rounded-full px-6 gap-2"><FileVideo className="w-4 h-4" /> Videos</TabsTrigger>
            <TabsTrigger value="audio" className="rounded-full px-6 gap-2"><FileAudio className="w-4 h-4" /> Audio</TabsTrigger>
            <TabsTrigger value="docs" className="rounded-full px-6 gap-2"><FileText className="w-4 h-4" /> Documents</TabsTrigger>
          </TabsList>

          {["all", "video", "audio", "docs"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources
                  .filter(r => tab === "all" || r.fileType.includes(tab === "docs" ? "application" : tab))
                  .map((res) => (
                    <Card key={res.id} className="group hover:shadow-lg transition-all border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className="p-3 bg-muted/50 rounded-2xl">
                            {getResourceIcon(res.fileType)}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onDeleteResource(res.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg font-headline mt-4">{res.fileName}</CardTitle>
                        <CardDescription className="line-clamp-2 font-body text-sm">{res.summary}</CardDescription>
                      </CardHeader>
                      <CardFooter className="bg-muted/30 p-4 flex justify-between">
                        <Badge variant="outline" className="border-primary/20 text-primary">{res.aiContent?.targetAge || "3-5 Years"}</Badge>
                        <Button size="sm" onClick={() => setSelectedResource(res)}>View Details</Button>
                      </CardFooter>
                    </Card>
                  ))}
                {filteredResources.length === 0 && (
                  <div className="col-span-full py-24 text-center space-y-4 opacity-50">
                    <LayoutGrid className="w-16 h-16 mx-auto" />
                    <p className="text-xl font-headline">No resources found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedResource && (
          <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-headline">{selectedResource.fileName}</DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary">{selectedResource.aiContent?.targetAge}</Badge>
                  <TranslationSelector 
                    content={selectedResource.summary || ""} 
                    onTranslate={(t) => setSelectedResource({...selectedResource, summary: t})}
                  />
                </div>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Summary</h4>
                    <p className="text-muted-foreground leading-relaxed font-body">{selectedResource.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResource.aiContent?.skillsMapped?.map(s => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <Card className="bg-muted/50 border-none">
                    <CardHeader><CardTitle className="text-base">Learning Objectives</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {selectedResource.aiContent?.curriculumObjectives?.map((obj, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  if (activeTab === "insights") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h2 className="text-3xl font-headline font-bold">Classroom Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle className="font-headline">Engagement Trends</CardTitle>
               <CardDescription>Average participation across current activities</CardDescription>
             </CardHeader>
             <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground italic">
               <div className="text-center">
                 <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p>AI is analyzing engagement patterns from recent videos...</p>
               </div>
             </CardContent>
           </Card>
           <Card className="bg-primary text-white border-none shadow-lg">
             <CardHeader>
               <CardTitle className="font-headline">Teacher Recommendation</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <p className="text-lg font-body">"Based on today's Sensory Play activity, students showed high engagement with tactile materials but struggled with verbal turn-taking."</p>
                <div className="p-4 bg-white/10 rounded-xl">
                  <p className="font-bold text-sm uppercase tracking-wider mb-2">Pro Tip:</p>
                  <p className="text-sm">Try introducing a 'Magic Talking Wand' during the next group session to facilitate sharing.</p>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  const unreadMessagesCount = teacherMessages.filter(m => !m.read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-bold text-foreground">Teacher Hub</h2>
        <div className="flex items-center gap-4">
           <UploadModal onUpload={onUploadResource} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden h-[500px] flex flex-col">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline text-xl">Parent Inbox</CardTitle>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {teacherMessages.length > 0 ? teacherMessages.map((msg) => (
                  <Card key={msg.id} className={cn("hover:bg-accent/5 transition-colors border-accent/10", !msg.read && "border-l-4 border-l-primary bg-primary/5")}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"><Users className="w-4 h-4 text-accent" /></div>
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
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline text-xl">Classroom Roster</CardTitle>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
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
          <Card className="bg-primary/5 border-dashed border-2 border-primary/20 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <Upload className="w-10 h-10 text-primary opacity-50" />
              <div>
                <p className="font-bold text-primary">Quick Action: Add Lesson</p>
                <p className="text-xs text-muted-foreground">Upload a photo or record a voice idea to generate a plan.</p>
              </div>
              <UploadModal onUpload={onUploadResource} />
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
