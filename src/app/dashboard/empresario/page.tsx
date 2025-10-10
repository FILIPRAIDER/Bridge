"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ChatIA from '@/components/chat/ChatIA';
import { api } from '@/lib/api';

export default function EmpresarioDashboard() {
  const { data: session, update } = useSession();
  const [avatarChecked, setAvatarChecked] = useState(false);

  const handleProjectCreated = (projectId: string) => {
    console.log('Proyecto creado:', projectId);
  };

  // 🔥 AUTO-FIX: Cargar avatarUrl si falta en la sesión
  useEffect(() => {
    const loadAvatarIfMissing = async () => {
      if (session?.user?.id && !session.user.avatarUrl && !avatarChecked) {
        console.log('[Empresario Dashboard] 🔄 Avatar faltante, consultando backend...');
        
        try {
          const userData = await api.get<any>(`/users/${session.user.id}`);
          
          // 🔥 DEBUG: Ver estructura completa de la respuesta
          console.log('[Empresario Dashboard] 🔍 Respuesta completa del backend:', userData);
          console.log('[Empresario Dashboard] 🔍 Campos disponibles:', Object.keys(userData));
          
          // Intentar obtener avatarUrl de diferentes ubicaciones posibles
          const avatarUrl = userData.avatarUrl || userData.profile?.avatarUrl || userData.avatar || null;
          
          if (avatarUrl) {
            console.log('[Empresario Dashboard] ✅ Avatar encontrado en backend:', avatarUrl);
            
            // Actualizar sesión con el avatarUrl
            await update({
              user: {
                ...session.user,
                avatarUrl: avatarUrl,
              }
            });
            
            console.log('[Empresario Dashboard] ✅ Sesión actualizada con avatar');
          } else {
            console.log('[Empresario Dashboard] ℹ️ Usuario no tiene avatar en backend');
            console.log('[Empresario Dashboard] 🔍 Estructura de userData:', JSON.stringify(userData, null, 2));
          }
        } catch (error) {
          console.error('[Empresario Dashboard] ❌ Error obteniendo avatar:', error);
        } finally {
          setAvatarChecked(true);
        }
      }
    };

    loadAvatarIfMissing();
  }, [session, update, avatarChecked]);

  // 🔥 LOG: Verificar que companyId está disponible en sesión
  useEffect(() => {
    if (session?.user) {
      console.log('[Empresario Dashboard] 📊 Sesión del usuario:', {
        userId: session.user.id,
        role: session.user.role,
        companyId: session.user.companyId,
        avatarUrl: session.user.avatarUrl,
        hasCompanyId: !!session.user.companyId,
        hasAvatar: !!session.user.avatarUrl,
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
