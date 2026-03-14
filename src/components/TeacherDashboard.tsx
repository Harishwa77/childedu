"use client";

import { useState } from "react";
import { BookOpen, Users, Star, FileText, Video, Music, Lightbulb, Clock, ChevronRight, Sparkles, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";
import { TranslationSelector } from "./TranslationSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function TeacherDashboard() {
  const [resources, setResources] = useState<any[]>([
    {
      id: "1",
      fileName: "Classroom_Play_Session.mp4",
      summary: "Observation of group dynamic during tactile block play. High engagement in structural building.",
      keyActivities: ["Social interaction", "Spatial reasoning", "Cooperative play"],
      transcript: "Teacher: Okay class, let's see how high we can build this tower. Leo, can you pass that blue block? Good job. Let's work together to make sure it doesn't fall.",
      fileType: "video/mp4",
      timestamp: "2024-05-15T10:30:00Z"
    },
    {
      id: "2",
      fileName: "Math_Lesson_VoiceNote.wav",
      summary: "Reflection on early numeracy curriculum. Students showed difficulty with subtraction but excelled in pattern recognition.",
      keyActivities: ["Pattern sorting", "Counting 1-10", "Reflection"],
      transcript: "In today's lesson, we covered basic pattern recognition. Most students were able to identify ABAB patterns. We struggled a bit with the introduction of subtraction concepts...",
      fileType: "audio/wav",
      timestamp: "2024-05-14T14:45:00Z"
    }
  ]);

  const [selectedResource, setSelectedResource] = useState<any | null>(null);

  const handleNewProcessed = (data: any) => {
    setResources(prev => [data, ...prev]);
    // Automatically "go into" the resource to study it
    setSelectedResource(data);
  };

  const getIcon = (type: string) => {
    if (type.includes("video")) return <Video className="w-5 h-5 text-purple-600" />;
    if (type.includes("audio")) return <Music className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Teacher Hub</h2>
          <p className="text-muted-foreground font-body">Managing 24 students in Preschool Class B</p>
        </div>
        <UploadModal onProcessed={handleNewProcessed} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none overflow-hidden relative">
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

        <Card>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Student Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold">High</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Across all segments</p>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">+12% vs last week</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Resources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-bold">Processed Resources</h3>
            <span className="text-xs text-muted-foreground font-body">{resources.length} total items</span>
          </div>
          <ScrollArea className="h-[500px] rounded-xl border bg-white p-4">
            <div className="space-y-4">
              {resources.map((res) => (
                <Card 
                  key={res.id} 
                  className="border-accent/10 hover:border-primary/20 transition-all shadow-sm cursor-pointer group"
                  onClick={() => setSelectedResource(res)}
                >
                  <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{getIcon(res.fileType)}</div>
                      <CardTitle className="text-sm font-semibold truncate max-w-[200px]">{res.fileName}</CardTitle>
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
                      {res.keyActivities?.length > 2 && (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
                          +{res.keyActivities.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-2">
                      <Clock className="w-3 h-3" />
                      {new Date(res.timestamp).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Suggested Activities
          </h3>
          <div className="space-y-4">
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-accent/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline font-bold text-primary">Sensory Texture Sorting</h4>
                      <Badge className="bg-accent">Cognitive</Badge>
                    </div>
                    <p className="text-sm font-body text-muted-foreground">Based on recent tactile play observations, introduce varying textures (sand, silk, bark) to enhance descriptive language skills.</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-accent/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline font-bold text-primary">Cooperative Block Bridge</h4>
                      <Badge className="bg-accent">Social</Badge>
                    </div>
                    <p className="text-sm font-body text-muted-foreground">Utilize the high engagement in block building to create team goals: building a bridge that spans across two tables.</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-accent/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline font-bold text-primary">Rhythmic Counting</h4>
                      <Badge className="bg-accent">Math</Badge>
                    </div>
                    <p className="text-sm font-body text-muted-foreground">Combine counting exercises with rhythmic clapping to address the challenges observed in pattern recognition today.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Resource Study View - Sheet */}
      <Sheet open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto bg-white border-l shadow-2xl">
          {selectedResource && (
            <div className="space-y-8 py-6">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    {getIcon(selectedResource.fileType)}
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-headline font-bold text-primary">Study Insights</SheetTitle>
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

              {/* Summary Section */}
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

              {/* Key Activities */}
              <div className="space-y-3">
                <h4 className="font-headline font-bold text-lg text-foreground">Identified Learning Activities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.keyActivities?.map((act: string, idx: number) => (
                    <Badge key={idx} className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {act}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Transcript Section */}
              {selectedResource.transcript && (
                <div className="space-y-3 pt-4">
                  <h4 className="font-headline font-bold text-lg flex items-center gap-2 text-foreground">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Full Transcript
                  </h4>
                  <ScrollArea className="h-64 rounded-2xl border bg-muted/20 p-6">
                    <p className="font-body text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {selectedResource.transcript}
                    </p>
                  </ScrollArea>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <Button variant="outline" className="font-headline font-bold">
                  Print Report
                </Button>
                <Button className="font-headline font-bold bg-primary hover:bg-primary/90">
                  Add to Lesson Plan
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
