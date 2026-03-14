/**
 * @fileOverview Shared types and interfaces for the EduSense AI platform.
 * Centrally managed to avoid circular dependencies.
 */

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
