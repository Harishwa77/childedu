
"use client";

import { useState } from "react";
import { RoleSelector, Role } from "@/components/RoleSelector";
import { DashboardTab, DashboardLayout } from "@/components/DashboardLayout";
import { TeacherDashboard, Student } from "@/components/TeacherDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Toaster } from "@/components/ui/toaster";

export interface ResourceAnalysis {
  activityName: string;
  studentEngagement: "High" | "Medium" | "Low";
  participationPatterns: string;
  teachingEffectiveness: string;
  recommendedImprovement: string;
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
  targetStudentId?: string; // Optional link to a specific student
}

export interface ChildRegistrationInfo {
  name: string;
  className: string;
  mentorName: string;
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Persist Parent Registration Info across role switches
  const [parentSessionInfo, setParentSessionInfo] = useState<ChildRegistrationInfo>({
    name: "Leo Johnson",
    className: "Preschool Class B",
    mentorName: "Ms. Clara"
  });

  // Shared resources state between Teacher and Parent
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      fileName: "Classroom_Play_Session.mp4",
      summary: "Observation of group dynamic during tactile block play. High engagement in structural building.",
      keyActivities: ["Social interaction", "Spatial reasoning", "Cooperative play"],
      transcript: "Teacher: Okay class, let's see how high we can build this tower. Leo, can you pass that blue block? Good job. Let's work together to make sure it doesn't fall.",
      fileType: "video/mp4",
      timestamp: "2024-05-15T10:30:00Z",
      analysis: {
        activityName: "Block Building Cooperation",
        studentEngagement: "High",
        participationPatterns: "Students working in pairs, shared decision making on structural stability.",
        teachingEffectiveness: "Teacher successfully used open-ended questions to guide the activity.",
        recommendedImprovement: "Introduce varied block shapes to increase complexity of spatial reasoning."
      }
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

  // Shared Roster State with Developmental Data
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
    { 
      id: "s3", 
      name: "Noah Smith", 
      present: false, 
      engagement: "Low",
      skills: { language: 60, numeracy: 55, social: 65, motor: 70 }
    },
    { 
      id: "s4", 
      name: "Ava Garcia", 
      present: true, 
      engagement: "High",
      skills: { language: 88, numeracy: 95, social: 82, motor: 75 }
    },
    { 
      id: "s5", 
      name: "Liam Chen", 
      present: true, 
      engagement: "High",
      skills: { language: 75, numeracy: 80, social: 88, motor: 92 }
    },
  ]);

  const handleRegisterChild = (info: ChildRegistrationInfo) => {
    setParentSessionInfo(info);
    setRoster(prev => {
      const exists = prev.find(s => s.name.toLowerCase() === info.name.toLowerCase());
      if (exists) {
        return prev.map(s => s.id === exists.id ? { 
          ...s, 
          name: info.name, 
          className: info.className, 
          mentorName: info.mentorName 
        } : s);
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

  const renderDashboard = () => {
    switch (activeRole) {
      case "teacher":
        return (
          <TeacherDashboard 
            searchQuery={searchQuery} 
            activeTab={activeTab} 
            resources={resources}
            setResources={setResources}
            roster={roster}
            setRoster={setRoster}
          />
        );
      case "parent":
        return (
          <ParentDashboard 
            searchQuery={searchQuery} 
            activeTab={activeTab} 
            resources={resources}
            roster={roster}
            childInfo={parentSessionInfo}
            onRegisterChild={handleRegisterChild}
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
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      resources={resources}
      roster={roster}
    >
      {renderDashboard()}
      <Toaster />
    </DashboardLayout>
  );
}
