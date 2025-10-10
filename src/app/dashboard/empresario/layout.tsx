"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { EmpresarioSidebar } from "@/components/dashboard/EmpresarioSidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function EmpresarioLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verificar autenticación
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "EMPRESARIO") {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Sidebar con diseño consistente */}
      <EmpresarioSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenedor de navbar + contenido */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
