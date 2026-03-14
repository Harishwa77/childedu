
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MessageSquare, Send, Bot, User, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askEducationalAIAssistant } from "@/ai/flows/ask-educational-ai-assistant-flow";
import { Resource } from "@/app/page";
import { Student } from "./TeacherDashboard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  resources: Resource[];
  roster: Student[];
}

export function AIAssistant({ resources, roster }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your EduSense AI assistant. I'm contextually aware of your classroom data. Ask me about your students, recent activities, or curriculum progress!",
      timestamp: new Date(),
    },
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Construct a dynamic context based on real data
  const dynamicContext = useMemo(() => {
    const resourcesText = resources.map(r => `- Activity: ${r.fileName}. Summary: ${r.summary}`).join("\n");
    const rosterText = roster.map(s => `- Student: ${s.name}. Attendance: ${s.present ? 'Present' : 'Absent'}. Engagement: ${s.engagement}`).join("\n");
    
    return `
      Classroom Resources:
      ${resourcesText || "No resources uploaded yet."}

      Student Roster & Engagement:
      ${rosterText || "No student roster available."}

      The current curriculum focus is on early scientific inquiry, tactile sensory play, and social cooperation.
    `;
  }, [resources, roster]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askEducationalAIAssistant({
        question: input,
        context: dynamicContext,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 p-0"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] shadow-2xl flex flex-col z-50 border-primary/20 animate-in slide-in-from-bottom-5">
      <CardHeader className="p-4 border-b bg-primary text-white flex flex-row items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <CardTitle className="text-lg font-headline">EduSense AI Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm font-body ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-2xl p-3 rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Processing...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Ask about your students..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full bg-accent/5 font-body"
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
