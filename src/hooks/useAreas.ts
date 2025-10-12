"use client";

import { useState, useEffect } from "react";
import type {
  TeamArea,
  AreasListResponse,
  CreateAreaRequest,
  UpdateAreaRequest,
  AreaStats
} from "@/types/areas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

export function useAreas(teamId: string | null) {
  const [areas, setAreas] = useState<TeamArea[]>([]);
  const [stats, setStats] = useState<AreaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar áreas
  const loadAreas = async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/areas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar áreas");
      }

      const data: AreasListResponse = await response.json();
      setAreas(data.areas);

      // Calcular stats
      const totalMembers = data.areas.reduce((acc, area) => acc + (area.memberCount || 0), 0);
      const totalFiles = data.areas.reduce((acc, area) => acc + (area.fileCount || 0), 0);
      const totalMessages = data.areas.reduce((acc, area) => acc + (area.messageCount || 0), 0);

      setStats({
        totalAreas: data.areas.length,
        totalMembers,
        unassignedMembers: 0, // TODO: Obtener del backend
        totalFiles,
        totalMessages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("[useAreas] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Crear área
  const createArea = async (data: CreateAreaRequest): Promise<TeamArea | null> => {
    if (!teamId) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear área");
      }

      const newArea: TeamArea = await response.json();
      setAreas((prev) => [...prev, newArea]);
      
      // Actualizar stats
      if (stats) {
        setStats({
          ...stats,
          totalAreas: stats.totalAreas + 1,
        });
      }

      return newArea;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear área");
      console.error("[useAreas] Error creating:", err);
      return null;
    }
  };

  // Actualizar área
  const updateArea = async (areaId: string, data: UpdateAreaRequest): Promise<boolean> => {
    if (!teamId) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/areas/${areaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar área");
      }

      const updatedArea: TeamArea = await response.json();
      setAreas((prev) => prev.map((a) => (a.id === areaId ? updatedArea : a)));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar área");
      console.error("[useAreas] Error updating:", err);
      return false;
    }
  };

  // Eliminar área
  const deleteArea = async (areaId: string): Promise<boolean> => {
    if (!teamId) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/areas/${areaId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar área");
      }

      setAreas((prev) => prev.filter((a) => a.id !== areaId));
      
      // Actualizar stats
      if (stats) {
        setStats({
          ...stats,
          totalAreas: stats.totalAreas - 1,
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar área");
      console.error("[useAreas] Error deleting:", err);
      return false;
    }
  };

  useEffect(() => {
    if (teamId) {
      loadAreas();
    }
  }, [teamId]);

  return {
    areas,
    stats,
    loading,
    error,
    loadAreas,
    createArea,
    updateArea,
    deleteArea,
  };
}
