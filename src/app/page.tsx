
"use client";

import { useState, useEffect } from "react";
import { RoleSelector, Role } from "@/components/RoleSelector";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TeacherDashboard, Student } from "@/components/TeacherDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { KinderLearningHub } from "@/components/KinderLearningHub";
import { Toaster } from "@/components/ui/toaster";
import { useCollection, useUser, useFirestore, useMemoFirebase, initiateAnonymousSignIn } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export type DashboardTab = "dashboard" | "resources" | "insights" | "learning-hub";

export interface ResourceAnalysis {
  activityName: string;
  studentEngagement: "High" | "Medium" | "Low";
  participationPatterns: string;
  teachingEffectiveness: string;
  recommendedImprovement: string;
}

export interface AILessonContent {
  summary: string;
  keyConcepts: string[];
  curriculumObjectives: string[];
  targetAge: string;
  skillsMapped: string[];
  flashcards: { question: string; answer: string }[];
  quiz: { question: string; options: string[]; correctAnswer: string }[];
  activitySuggestions: string[];
  translations: {
    Tamil: { summary: string; concepts: string[] };
    Hindi: { summary: string; concepts: string[] };
  };
}

export interface Resource {
  id: string;
  fileName: string;
  summary: string;
  keyActivities: string[];
  transcript?: string;
  fileType: string;
  timestamp: string;
  analysis?: ResourceAnalysis;
  targetStudentId?: string;
  aiContent?: AILessonContent;
  uploaderId?: string;
}

export interface ChildRegistrationInfo {
  name: string;
  className: string;
  mentorName: string;
}

export interface UserMessage {
  id: string;
  from: string;
  to: string; // "Teacher" or "Parent" or specific name
  subject: string;
  text: string;
  date: string;
  read: boolean;
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user, isUserLoading, auth } = useUser();
  const db = useFirestore();

  // Sign in anonymously if not logged in
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Fetch resources from Firestore
  const resourcesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "educational_resources"), orderBy("timestamp", "desc"));
  }, [db]);

  const { data: firestoreResources, isLoading: isResourcesLoading } = useCollection<Resource>(resourcesQuery);

  const [parentSessionInfo, setParentSessionInfo] = useState<ChildRegistrationInfo>({
    name: "Leo Johnson",
    className: "Preschool Class B",
    mentorName: "Ms. Clara"
  });

  const [messages, setMessages] = useState<UserMessage[]>([
    { id: "m1", from: "Mrs. Johnson", to: "Teacher", subject: "Leo's Progress", text: "How did the counting activity go today?", date: "10 mins ago", read: false },
    { id: "m2", from: "Mr. Wong", to: "Teacher", subject: "Mia's Attendance", text: "Mia will be 30 mins late tomorrow for a dentist appointment.", date: "2 hours ago", read: true },
  ]);

  const [roster, setRoster] = useState<Student[]>([
    { 
      id: "s1", 
      name: "Leo Johnson", 
      present: true, 
      engagement: "High",
      skills: { language: 85, numeracy: 72, social: 90, motor: 78 },
      history: [
        { date: "Jan", score: 65 },
        { date: "Feb", score: 68 },
        { date: "Mar", score: 75 },
        { date: "Apr", score: 78 },
        { date: "May", score: 85 },
      ]
    },
    { 
      id: "s2", 
      name: "Mia Wong", 
      present: true, 
      engagement: "Medium",
      skills: { language: 92, numeracy: 65, social: 75, motor: 88 },
      history: [
        { date: "Jan", score: 70 },
        { date: "Feb", score: 72 },
        { date: "Mar", score: 78 },
        { date: "Apr", score: 80 },
        { date: "May", score: 82 },
      ]
    },
    { id: "s3", name: "Noah Smith", present: false, engagement: "Low", skills: { language: 60, numeracy: 55, social: 65, motor: 70 } },
    { id: "s4", name: "Ava Garcia", present: true, engagement: "High", skills: { language: 88, numeracy: 95, social: 82, motor: 75 } },
    { id: "s5", name: "Liam Chen", present: true, engagement: "High", skills: { language: 75, numeracy: 80, social: 88, motor: 92 } },
  ]);

  const handleRegisterChild = (info: ChildRegistrationInfo) => {
    setParentSessionInfo(info);
    setRoster(prev => {
      const exists = prev.find(s => s.name.toLowerCase() === info.name.toLowerCase());
      if (exists) {
        return prev.map(s => s.id === exists.id ? { ...s, name: info.name, className: info.className, mentorName: info.mentorName } : s);
      }
      return [...prev, {
        id: `s${prev.length + 1}`,
        name: info.name,
        present: true,
        engagement: "Medium",
        className: info.className,
        mentorName: info.mentorName,
        skills: { language: 50, numeracy: 50, social: 50, motor: 50 },
        history: [{ date: "May", score: 50 }]
      }];
    });
  };

  const handleSendMessage = (msg: { to: string; subject: string; text: string }) => {
    const newMsg: UserMessage = {
      id: Math.random().toString(36).substring(2, 11),
      from: activeRole === "teacher" ? "Teacher" : `Parent of ${parentSessionInfo.name}`,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      date: "Just now",
      read: false
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const renderDashboard = () => {
    if (activeTab === "learning-hub") {
      return <KinderLearningHub />;
    }

    const currentResources = firestoreResources || [];

    switch (activeRole) {
      case "teacher":
        return (
          <TeacherDashboard 
            searchQuery={searchQuery} 
            activeTab={activeTab} 
            resources={currentResources} 
            roster={roster} 
            setRoster={setRoster}
            messages={messages}
            onSendMessage={(msg) => handleSendMessage({ ...msg, to: "Parent" })}
            onMarkRead={handleMarkAsRead}
          />
        );
      case "parent":
        return (
          <ParentDashboard 
            searchQuery={searchQuery} 
            activeTab={activeTab} 
            resources={currentResources} 
            roster={roster} 
            childInfo={parentSessionInfo} 
            onRegisterChild={handleRegisterChild}
            onSendMessage={(msg) => handleSendMessage({ ...msg, to: "Teacher" })}
            messages={messages}
            onMarkRead={handleMarkAsRead}
          />
        );
      case "admin":
        return <AdminDashboard searchQuery={searchQuery} activeTab={activeTab} />;
      default:
        return null;
    }
  };

  if (!activeRole) {
    return (
      <main>
        <RoleSelector onSelect={setActiveRole} />
        <Toaster />
      </main>
    );
  }

  return (
    <DashboardLayout 
      role={activeRole} 
      onLogout={() => setActiveRole(null)}
      onRoleSwitch={(role) => setActiveRole(role)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      resources={firestoreResources || []}
      roster={roster}
    >
      {renderDashboard()}
      <Toaster />
    </DashboardLayout>
  );
}
