
"use client";

import { useState } from "react";
import { RoleSelector, Role } from "@/components/RoleSelector";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role>(null);

  const renderDashboard = () => {
    switch (activeRole) {
      case "teacher":
        return <TeacherDashboard />;
      case "parent":
        return <ParentDashboard />;
      case "admin":
        return <AdminDashboard />;
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
    <DashboardLayout role={activeRole} onLogout={() => setActiveRole(null)}>
      {renderDashboard()}
      <Toaster />
    </DashboardLayout>
  );
}
