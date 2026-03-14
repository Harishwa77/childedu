
"use client";

import { useState, useEffect } from "react";
import { Heart, Activity, Book, Sparkles, Home, ChevronRight, Clock, Volume2, Loader2, BrainCircuit, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateParentalLearningInsights, ParentalLearningInsightsOutput } from "@/ai/flows/generate-parental-learning-insights";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DashboardTab } from "@/app/page";

export function ParentDashboard({ searchQuery, activeTab }: { searchQuery: string, activeTab?: DashboardTab }) {
  const [insights, setInsights] = useState<ParentalLearningInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await generateParentalLearningInsights({
          childName: "Leo",
          classroomObservations: "Leo showed great curiosity during the science experiment with water today. He was able to predict which items would float or sink with 80% accuracy.",
          processedEducationalContent: "The current curriculum focuses on early scientific inquiry and causal relationships. We are using tactile experiments to foster critical thinking."
        });
        setInsights(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const handleListen = async () => {
    if (!insights || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      const res = await textToSpeech({
        text: insights.learningSummary,
        voiceName: "Algenib"
      });
      
      const audio = new Audio(res.audioDataUri);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Could not generate audio summary."
      });
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Welcome back, Sarah</h2>
          <p className="text-muted-foreground font-body flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            Leo's Learning Journey
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-1 border-primary text-primary font-bold">Preschool B</Badge>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Summary */}
          <Card className="border-none shadow-lg overflow-hidden flex flex-col">
            <CardHeader className="bg-primary text-white p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6" /> Classroom Insight
                  </CardTitle>
                  <CardDescription className="text-white/80 font-body">AI-generated summary of Leo's week</CardDescription>
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={handleListen}
                  disabled={isLoading || isSpeaking}
                >
                  {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 bg-white">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[95%]" />
                </div>
              ) : (
                <p className="text-lg font-body leading-relaxed text-muted-foreground">
                  "{insights?.learningSummary}"
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <Activity className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Participation</p>
                  <p className="text-2xl font-bold font-headline">94% Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <Book className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Milestones</p>
                  <p className="text-2xl font-bold font-headline">3 New Badges</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Home Activities / Insights Tab */}
      {(activeTab === "dashboard" || activeTab === "insights") && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-headline font-bold flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-primary" />
              Developmental Insights
            </h3>
          </div>

          {activeTab === "insights" && (
             <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <Target className="w-5 h-5" /> Learning Milestones
                  </CardTitle>
                  <CardDescription>Progress tracked against early childhood standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      { area: "Scientific Inquiry", progress: 85, color: "bg-blue-500" },
                      { area: "Fine Motor Skills", progress: 70, color: "bg-emerald-500" },
                      { area: "Emotional Resilience", progress: 90, color: "bg-purple-500" },
                    ].map(item => (
                      <div key={item.area} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-body font-medium">{item.area}</span>
                          <span className="text-muted-foreground">{item.progress}% Milestone Reach</span>
                        </div>
                        <div className="h-2 w-full bg-accent/10 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
             </Card>
          )}

          <div className="space-y-4">
            <h4 className="text-xl font-headline font-bold flex items-center gap-2">
              <Home className="w-6 h-6 text-accent" />
              Home Activity Suggestions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)
              ) : (
                insights?.homeActivitySuggestions
                  .filter(act => !searchQuery || act.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((act, idx) => (
                  <Card key={idx} className="group hover:border-accent transition-all cursor-pointer">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent group-hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <Badge variant="outline" className="text-[10px] opacity-60">Activity {idx + 1}</Badge>
                      </div>
                      <p className="font-body text-base leading-snug">
                        {act}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Updates / Resources Tab */}
      {(activeTab === "dashboard" || activeTab === "resources") && (
        <Card className="border-accent/10 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Recent Moments</CardTitle>
            <CardDescription>Classroom photos and videos shared this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[180px] space-y-2">
                  <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden relative border shadow-sm">
                    <img src={`https://picsum.photos/seed/moment${i}/400/300`} alt="Activity" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {i} day{i > 1 ? 's' : ''} ago
                    </div>
                    <Badge variant="secondary" className="text-[9px] uppercase">Activity</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
