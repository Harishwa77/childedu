"use client";

import { useState, useMemo } from "react";
import { Heart, Activity, School, MessageCircle, Send, Mail, Fingerprint, Save, CheckCircle2, UserCircle, Settings } from "lucide-react";
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
  UserMessage 
} from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Student } from "./TeacherDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ParentDashboardProps {
  searchQuery: string;
  activeTab?: DashboardTab;
  roster: Student[];
  childInfo: ChildRegistrationInfo;
  onRegisterChild: (info: ChildRegistrationInfo) => void;
  onSendMessage: (msg: { subject: string; text: string }) => void;
  messages: UserMessage[];
  onMarkRead: (id: string) => void;
}

export function ParentDashboard({ searchQuery, activeTab, roster, childInfo, onRegisterChild, onSendMessage, messages, onMarkRead }: ParentDashboardProps) {
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [isMessaging, setIsMessaging] = useState(false);
  const [isMsgDialogOpen, setIsMsgDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const childData = useMemo(() => {
    return roster.find(s => s.name.toLowerCase() === childInfo.name.toLowerCase());
  }, [roster, childInfo.name]);

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

function Loader2(props: any) {
  return <Activity {...props} className={cn("animate-spin", props.className)} />;
}
