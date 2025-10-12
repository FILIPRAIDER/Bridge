"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Users, FileText, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "@/utils/dates";

interface MyAreaProps {
  userId: string;
  teamId: string;
}

export function MyArea({ userId, teamId }: MyAreaProps) {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, teamId]);

  const loadMyAreas = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 Obtener todas las áreas del equipo (ahora con JWT automático)
      const data = await api.get<any>(`/teams/${teamId}/areas`);
      
      // 🔥 Para cada área, verificar si el usuario es miembro
      const myAreasWithDetails = await Promise.all(
        data.areas.map(async (area: any) => {
          try {
            // Cargar miembros del área
            const membersData = await api.get<any>(`/teams/${teamId}/areas/${area.id}/members`);
            const isMember = membersData.members.some((m: any) => m.userId === userId);
            
            if (isMember) {
              // Encontrar la info de asignación del usuario
              const myMembership = membersData.members.find((m: any) => m.userId === userId);
              return {
                ...area,
                assignedAt: myMembership?.assignedAt,
                role: myMembership?.role,
              };
            }
            return null;
          } catch (err) {
            console.error(`Error loading members for area ${area.id}:`, err);
            return null;
          }
        })
      );

      // Filtrar áreas nulas
      const myAreas = myAreasWithDetails.filter((area) => area !== null);
      setAreas(myAreas);
    } catch (error) {
      console.error("Error loading areas:", error);
      setError(error instanceof Error ? error.message : "Error al cargar áreas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        <p className="mt-2 text-gray-600">Cargando áreas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error al cargar áreas
        </h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadMyAreas}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <LayoutGrid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No estás asignado a ninguna área
        </h3>
        <p className="text-gray-600">
          Espera a que el líder del equipo te asigne a un área
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
            <LayoutGrid className="h-8 w-8" />
            Mis Áreas
          </h1>
          <p className="mt-2 text-gray-300">
            Áreas donde colaboras con tu equipo
          </p>
        </div>
      </div>

      {/* Areas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas.map((area) => (
          <div
            key={area.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: area.color || "#e5e7eb",
                    filter: "brightness(1.1)",
                  }}
                >
                  {area.icon || "📁"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{area.name}</h3>
                  {area.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {area.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{area.memberCount || 0} miembros</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>{area.fileCount || 0} archivos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>{area.messageCount || 0} mensajes</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <button
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all"
                onClick={() => {
                  // TODO: Navegar a la vista detallada del área con chat y archivos
                  alert(`Abriendo área: ${area.name}\n\nPróximamente: Chat y archivos en tiempo real`);
                }}
              >
                Abrir Área
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
