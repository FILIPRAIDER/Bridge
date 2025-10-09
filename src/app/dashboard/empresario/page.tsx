"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import ChatIA from '@/components/chat/ChatIA';

export default function EmpresarioDashboard() {
  const { data: session } = useSession();

  const handleProjectCreated = (projectId: string) => {
    console.log('Proyecto creado:', projectId);
  };

  // 🔥 LOG: Verificar que companyId está disponible en sesión
  useEffect(() => {
    if (session?.user) {
      console.log('[Empresario Dashboard] 📊 Sesión del usuario:', {
        userId: session.user.id,
        role: session.user.role,
        companyId: session.user.companyId,
        hasCompanyId: !!session.user.companyId,
      });

      if (!session.user.companyId) {
        console.warn('[Empresario Dashboard] ⚠️ Usuario sin companyId - No podrá crear proyectos');
      }
    }
  }, [session]);

  return (
    <div className="h-full max-w-5xl mx-auto p-4 lg:p-6">
      {/* Advertencia si no tiene companyId */}
      {session?.user && !session.user.companyId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Atención:</strong> No tienes una empresa asociada. 
            Completa tu perfil en la sección de <a href="/dashboard/empresario/profile" className="underline font-semibold">Mi Perfil</a> para poder crear proyectos.
          </p>
        </div>
      )}

      <ChatIA
        userId={session?.user?.id}
        companyId={session?.user?.companyId ?? undefined}
        onProjectCreated={handleProjectCreated}
        userAvatarUrl={session?.user?.avatarUrl ?? null} // 🔥 NUEVO: Avatar del usuario
        userName={session?.user?.name ?? null} // 🔥 NUEVO: Nombre del usuario
      />
    </div>
  );
}
