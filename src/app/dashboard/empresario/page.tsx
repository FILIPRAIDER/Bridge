"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ChatIA from '@/components/chat/ChatIA';
import { EmpresarioSidebar } from '@/components/dashboard/EmpresarioSidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function EmpresarioDashboard() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirigir si no está autenticado o no es empresario
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'EMPRESARIO') {
    redirect('/login');
  }

  const handleProjectCreated = (projectId: string) => {
    console.log('Proyecto creado:', projectId);
    // Aquí puedes agregar lógica para actualizar la lista de proyectos
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar con diseño de miembros/líder */}
      <EmpresarioSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenedor de navbar + contenido */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar solo en el área de contenido */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content - Chat IA */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto p-4 lg:p-6">
            <ChatIA
              userId={session.user.id}
              companyId={(session.user as any).companyId}
              onProjectCreated={handleProjectCreated}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
