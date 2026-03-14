/**
 * @fileOverview Shared types and interfaces for the EduSense AI platform.
 * Centrally managed to avoid circular dependencies.
 */

export type DashboardTab = "dashboard" | "magic-games";

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
