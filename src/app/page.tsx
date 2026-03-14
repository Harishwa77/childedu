
"use client";

import { useState } from "react";
import { RoleSelector, Role } from "@/components/RoleSelector";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Toaster } from "@/components/ui/toaster";

export type DashboardTab = "dashboard" | "resources" | "insights";

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const renderDashboard = () => {
    switch (activeRole) {
      case "teacher":
        return <TeacherDashboard searchQuery={searchQuery} activeTab={activeTab} />;
      case "parent":
        return <ParentDashboard searchQuery={searchQuery} activeTab={activeTab} />;
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
    >
      {renderDashboard()}
      <Toaster />
    </DashboardLayout>
  );
}
