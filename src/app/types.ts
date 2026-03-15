/**
 * @fileOverview Shared types and interfaces for the EduSense AI platform.
 * Centrally managed to avoid circular dependencies.
 */

import { ProcessEducationalContentOutput } from "@/ai/flows/process-educational-content-pipeline";

export type DashboardTab = "dashboard" | "resources" | "insights" | "magic-games";

export interface Resource extends Partial<ProcessEducationalContentOutput> {
  id: string;
  fileName: string;
  fileType: string;
  timestamp: string;
  thumbnailUrl?: string;
  aiContent?: ProcessEducationalContentOutput;
  originalSummary?: string; // Anchor for high-fidelity translation
}

export interface Insight {
  id: string;
  type: "academic" | "social" | "recommendation";
  title: string;
  content: string;
  date: string;
  read: boolean;
  priority: "high" | "medium" | "low";
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
