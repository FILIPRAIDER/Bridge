"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

/**
 * Hook que carga el avatar del usuario desde el backend
 * y actualiza la sesión de NextAuth automáticamente
 */
export function useLoadAvatar() {
  const { data: session, update, status } = useSession();

  useEffect(() => {
    const loadAvatar = async () => {
      // Solo cargar si:
      // 1. La sesión está lista
      // 2. Hay un usuario
      // 3. No tiene avatar cargado todavía
      if (
        status === "authenticated" &&
        session?.user?.id &&
        !session.user.avatarUrl
      ) {
        try {
          const userData = await api.get<any>(`/users/${session.user.id}`);
          
          // Priorizar avatarUrl de User, luego de Profile
          const avatarUrl = userData.avatarUrl || userData.profile?.avatarUrl || null;
          
          if (avatarUrl) {
            // Actualizar sesión con el avatar
            await update({
              ...session,
              user: {
                ...session.user,
                avatarUrl,
              },
            });
          }
        } catch (error) {
          console.error("Error loading user avatar:", error);
        }
      }
    };

    loadAvatar();
  }, [session?.user?.id, session?.user?.avatarUrl, status]);
}
