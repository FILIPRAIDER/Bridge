"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { AreaMember, AreaMembersResponse, AssignMemberRequest } from "@/types/areas";
import { sendAreaAssignmentEmail, sendAreaRemovalEmail } from "@/actions/send-area-emails";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

export function useAreaMembers(
  teamId: string | null,
  areaId: string | null,
  areaName?: string,
  teamName?: string
) {
  const { data: session } = useSession();
  const [members, setMembers] = useState<AreaMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar miembros
  const loadMembers = async () => {
    if (!teamId || !areaId || !session) return;

    setLoading(true);
    setError(null);

    try {
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/members`,
        { 
          headers,
          credentials: "include" 
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar miembros");
      }

      const data: AreaMembersResponse = await response.json();
      setMembers(data.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("[useAreaMembers] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Asignar miembro
  const assignMember = async (data: AssignMemberRequest): Promise<boolean> => {
    if (!teamId || !areaId || !session) return false;

    try {
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/members`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Error al asignar miembro");
      }

      const newMember: AreaMember = await response.json();
      setMembers((prev) => [...prev, newMember]);

      // 📧 Enviar email de notificación (no bloquea la operación si falla)
      if (newMember.user?.email && session?.user?.name && areaName && teamName) {
        sendAreaAssignmentEmail({
          to: newMember.user.email,
          userName: newMember.user.name || newMember.user.email,
          areaName,
          teamName,
          inviterName: session.user.name,
          areaId,
          teamId,
        }).catch((error) => {
          console.error("[useAreaMembers] Error enviando email de asignación:", error);
          // No fallar la operación si el email falla
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar miembro");
      console.error("[useAreaMembers] Error assigning:", err);
      return false;
    }
  };

  // Remover miembro
  const removeMember = async (userId: string): Promise<boolean> => {
    if (!teamId || !areaId || !session) return false;

    // Guardar info del miembro antes de removerlo (para el email)
    const memberToRemove = members.find((m) => m.userId === userId);

    try {
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/members/${userId}`,
        {
          method: "DELETE",
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error al remover miembro");
      }

      setMembers((prev) => prev.filter((m) => m.userId !== userId));

      // 📧 Enviar email de notificación (no bloquea la operación si falla)
      if (memberToRemove?.user?.email && session?.user?.name && areaName && teamName) {
        sendAreaRemovalEmail({
          to: memberToRemove.user.email,
          userName: memberToRemove.user.name || memberToRemove.user.email,
          areaName,
          teamName,
          removerName: session.user.name,
        }).catch((error) => {
          console.error("[useAreaMembers] Error enviando email de remoción:", error);
          // No fallar la operación si el email falla
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al remover miembro");
      console.error("[useAreaMembers] Error removing:", err);
      return false;
    }
  };

  useEffect(() => {
    if (teamId && areaId && session) {
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, areaId, session]);

  return {
    members,
    loading,
    error,
    loadMembers,
    assignMember,
    removeMember,
  };
}
