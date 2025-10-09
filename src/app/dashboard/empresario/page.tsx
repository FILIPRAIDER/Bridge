"use client";

import { useSession } from 'next-auth/react';
import ChatIA from '@/components/chat/ChatIA';

export default function EmpresarioDashboard() {
  const { data: session } = useSession();

  const handleProjectCreated = (projectId: string) => {
    console.log('Proyecto creado:', projectId);
  };

  return (
    <div className="h-full max-w-5xl mx-auto p-4 lg:p-6">
      <ChatIA
        userId={session?.user?.id}
        companyId={(session?.user as any)?.companyId}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
