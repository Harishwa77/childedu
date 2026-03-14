
"use client";

import { useState, useMemo } from "react";
import { Heart, Activity, School, MessageCircle, Send, Mail, Fingerprint, Save, CheckCircle2, UserCircle, Settings, LayoutGrid, FileVideo, FileAudio, FileText, Star, Sparkles, BrainCircuit, Lightbulb, Compass, Loader2, HelpCircle, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  DashboardTab, 
  ChildRegistrationInfo, 
  UserMessage,
  Resource,
  Insight
} from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Student } from "./TeacherDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TranslationSelector } from "./TranslationSelector";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ParentDashboardProps {
  searchQuery: string;
  activeTab?: DashboardTab;
  roster: Student[];
  childInfo: ChildRegistrationInfo;
  onRegisterChild: (info: ChildRegistrationInfo) => void;
  onSendMessage: (msg: { subject: string; text: string }) => void;
  messages: UserMessage[];
  onMarkRead: (id: string) => void;
  resources: Resource[];
  insights: Insight[];
}

export function ParentDashboard({ 
  searchQuery, 
  activeTab, 
  roster, 
  childInfo, 
  onRegisterChild, 
  onSendMessage, 
  messages, 
  onMarkRead,
  resources,
  insights
}: ParentDashboardProps) {
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [isMessaging, setIsMessaging] = useState(false);
  const [isMsgDialogOpen, setIsMsgDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizWon, setIsQuizWon] = useState(false);

  const { toast } = useToast();

  const childData = useMemo(() => {
    return roster.find(s => s.name.toLowerCase() === childInfo.name.toLowerCase());
  }, [roster, childInfo.name]);

  const skillData = useMemo(() => {
    if (!childData?.skills) return [];
    return [
      { subject: 'Language', value: childData.skills.language, fullMark: 100 },
      { subject: 'Numeracy', value: childData.skills.numeracy, fullMark: 100 },
      { subject: 'Social', value: childData.skills.social, fullMark: 100 },
      { subject: 'Motor', value: childData.skills.motor, fullMark: 100 },
    ];
  }, [childData]);

  const parentMessages = useMemo(() => messages.filter(m => m.to === "Parent"), [messages]);

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

  const getResourceIcon = (type: string) => {
    if (type.includes('video')) return <FileVideo className="w-5 h-5 text-blue-500" />;
    if (type.includes('audio')) return <FileAudio className="w-5 h-5 text-emerald-500" />;
    return <FileText className="w-5 h-5 text-orange-500" />;
  };

  const handleQuizAnswer = (answer: string) => {
    const quiz = selectedResource?.aiContent?.quiz;
    if (!quiz) return;

    if (answer === quiz[currentQuizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
      toast({ title: "Spot On!", description: "That is the correct answer! ✨", variant: "default" });
      
      if (currentQuizIndex < quiz.length - 1) {
        setTimeout(() => setCurrentQuizIndex(prev => prev + 1), 800);
      } else {
        setIsQuizWon(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#FBBF24', '#FB7185']
        });
      }
    } else {
      toast({ variant: "destructive", title: "Almost!", description: "Try another one, you can do it! 🌈" });
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setIsQuizWon(false);
  };

  if (activeTab === "resources") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-headline font-bold">Classroom Library</h2>
            <p className="text-muted-foreground font-body">Browse lessons shared by Ms. Clara</p>
          </div>
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
                {resources
                  .filter(r => tab === "all" || r.fileType.includes(tab === "docs" ? "application" : tab))
                  .map((res) => (
                    <Card key={res.id} onClick={() => { setSelectedResource(res); resetQuiz(); }} className="cursor-pointer group hover:shadow-lg transition-all border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="p-3 bg-muted/50 rounded-2xl w-fit">
                          {getResourceIcon(res.fileType)}
                        </div>
                        <CardTitle className="text-lg font-headline mt-4">{res.fileName}</CardTitle>
                        <CardDescription className="line-clamp-2 font-body text-sm">{res.summary}</CardDescription>
                      </CardHeader>
                      <CardFooter className="bg-muted/30 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <Compass className="w-3 h-3" /> Explore Topic
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
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
              
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="bg-muted/50 p-1 rounded-full h-11 mb-6">
                  <TabsTrigger value="overview" className="rounded-full px-6">Overview</TabsTrigger>
                  <TabsTrigger value="quiz" className="rounded-full px-6 gap-2">
                    <HelpCircle className="w-4 h-4" /> Quick Quiz
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> At-Home Extension</h4>
                        <p className="text-muted-foreground leading-relaxed font-body">
                          {selectedResource.aiContent?.activitySuggestions?.[0] || "Continue exploring this topic through play!"}
                        </p>
                      </div>
                      <Card className="bg-primary/5 border-none p-4">
                        <h4 className="font-bold text-sm mb-2">Learning Highlights</h4>
                        <ul className="space-y-2">
                          {selectedResource.aiContent?.keyConcepts?.map(c => (
                            <li key={c} className="text-sm flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-primary" /> {c}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold">Recommended Similar Content</h4>
                      {resources.filter(r => r.id !== selectedResource.id).slice(0, 2).map(r => (
                        <div key={r.id} className="p-3 bg-muted/50 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-muted" onClick={() => { setSelectedResource(r); resetQuiz(); }}>
                          {getResourceIcon(r.fileType)}
                          <span className="text-sm font-bold truncate">{r.fileName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quiz">
                  <div className="min-h-[300px] flex items-center justify-center">
                    {isQuizWon ? (
                      <div className="text-center space-y-6 animate-in zoom-in duration-500 py-12 w-full bg-emerald-50 rounded-[2rem] border-4 border-emerald-100">
                         <Trophy className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
                         <h3 className="text-4xl font-headline font-bold text-emerald-600">Amazing Explorer!</h3>
                         <p className="text-xl font-body text-emerald-700">You mastered the quiz for {selectedResource.fileName}!</p>
                         <Button onClick={resetQuiz} variant="outline" className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-100">
                           Play Again
                         </Button>
                      </div>
                    ) : selectedResource.aiContent?.quiz && selectedResource.aiContent.quiz.length > 0 ? (
                      <div className="w-full space-y-8 animate-in slide-in-from-bottom-5">
                        <div className="text-center space-y-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20">Question {currentQuizIndex + 1} of {selectedResource.aiContent.quiz.length}</Badge>
                          <h3 className="text-2xl font-headline font-bold">{selectedResource.aiContent.quiz[currentQuizIndex].question}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                          {selectedResource.aiContent.quiz[currentQuizIndex].options.map((option, idx) => (
                            <Button 
                              key={idx}
                              variant="outline"
                              className="h-auto py-4 px-6 text-lg font-body rounded-2xl border-2 border-primary/10 hover:border-primary hover:bg-primary/5 bouncy-hover whitespace-normal"
                              onClick={() => handleQuizAnswer(option)}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center opacity-40 space-y-4">
                        <HelpCircle className="w-16 h-16 mx-auto" />
                        <p className="font-headline text-xl">The AI is still thinking of questions...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  if (activeTab === "insights") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-headline font-bold">Smart Insights</h2>
            <p className="text-muted-foreground font-body">Personalized progress for {childInfo.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-primary" /> Learning DNA Radar
              </CardTitle>
              <CardDescription>Current skill profile visualization</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                  <Radar
                    name={childInfo.name}
                    dataKey="value"
                    stroke="#38BDF8"
                    fill="#38BDF8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-xl font-headline font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Recent Growth Highlights
            </h3>
            {insights.map((insight) => (
              <Card key={insight.id} className={cn("border-l-4", insight.priority === 'high' ? "border-l-orange-400" : "border-l-primary")}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-headline">{insight.title}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{insight.date}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground font-body">{insight.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Parent Dashboard</h2>
          <p className="text-muted-foreground font-body flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            {childInfo.name}'s Connection Center
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
                <DialogDescription>Discuss {childInfo.name}'s school day or view replies.</DialogDescription>
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
                      placeholder="e.g. Schedule Update" 
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Message</Label>
                    <Textarea 
                      placeholder="Type your message here..." 
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
                <DialogTitle className="font-headline text-2xl">Child Profile</DialogTitle>
                <DialogDescription>Update your child's information.</DialogDescription>
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
                }} className="gap-2"><Save className="w-4 h-4" /> Save Profile</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-primary" /> Profile Overview
            </CardTitle>
            <CardDescription>Basic information and attendance status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Attendance Today</p>
                  <p className="text-2xl font-bold font-headline">{childData?.present ? "Present" : "Absent"}</p>
                </div>
                <div className={cn("p-3 rounded-full", childData?.present ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                   {childData?.present ? <CheckCircle2 className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-2xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Classroom</p>
                  <p className="font-bold">{childInfo.className}</p>
                </div>
                <div className="p-4 border rounded-2xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Mentor</p>
                  <p className="font-bold">{childInfo.mentorName}</p>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-primary">
              <Settings className="w-5 h-5" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <Button variant="outline" className="w-full justify-start gap-3 rounded-xl border-primary/10 hover:bg-primary/5">
                <Activity className="w-4 h-4 text-primary" /> View Attendance History
             </Button>
             <Button variant="outline" className="w-full justify-start gap-3 rounded-xl border-primary/10 hover:bg-primary/5">
                <UserCircle className="w-4 h-4 text-primary" /> Update Contact Info
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
