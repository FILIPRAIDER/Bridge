"use client";

import { useState, useEffect } from "react";
import type { AreaMember, AreaMembersResponse, AssignMemberRequest } from "@/types/areas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

export function useAreaMembers(teamId: string | null, areaId: string | null) {
  const [members, setMembers] = useState<AreaMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar miembros
  const loadMembers = async () => {
    if (!teamId || !areaId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/members`,
        { credentials: "include" }
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
    if (!teamId || !areaId) return false;

    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Error al asignar miembro");
      }

      const newMember: AreaMember = await response.json();
      setMembers((prev) => [...prev, newMember]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar miembro");
      console.error("[useAreaMembers] Error assigning:", err);
      return false;
    }
  };

  // Remover miembro
  const removeMember = async (userId: string): Promise<boolean> => {
    if (!teamId || !areaId) return false;

    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/members/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error al remover miembro");
      }

      setMembers((prev) => prev.filter((m) => m.userId !== userId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al remover miembro");
      console.error("[useAreaMembers] Error removing:", err);
      return false;
    }
  };

  useEffect(() => {
    if (teamId && areaId) {
      loadMembers();
    }
  }, [teamId, areaId]);

  return {
    members,
    loading,
    error,
    loadMembers,
    assignMember,
    removeMember,
  };
}
