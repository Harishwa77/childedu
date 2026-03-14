
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

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Shared Roster State
  const [roster, setRoster] = useState<Student[]>([
    { id: "s1", name: "Leo Johnson", present: true, engagement: "High" },
    { id: "s2", name: "Mia Wong", present: true, engagement: "Medium" },
    { id: "s3", name: "Noah Smith", present: false, engagement: "Low" },
    { id: "s4", name: "Ava Garcia", present: true, engagement: "High" },
    { id: "s5", name: "Liam Chen", present: true, engagement: "High" },
  ]);

  const handleRegisterChild = (name: string, className: string, mentorName: string) => {
    // For prototype, we check if student exists by name, or add new
    setRoster(prev => {
      const exists = prev.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        return prev.map(s => s.id === exists.id ? { ...s, name } : s);
      }
      return [...prev, {
        id: `s${prev.length + 1}`,
        name,
        present: true,
        engagement: "Medium",
        className,
        mentorName
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
