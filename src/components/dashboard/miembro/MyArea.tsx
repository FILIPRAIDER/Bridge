"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Users, FileText, MessageSquare } from "lucide-react";

interface MyAreaProps {
  userId: string;
  teamId: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

export function MyArea({ userId, teamId }: MyAreaProps) {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, teamId]);

  const loadMyAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/areas`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrar solo las áreas donde el usuario es miembro
        const myAreas = data.areas.filter((area: any) =>
          area.members?.some((member: any) => member.userId === userId)
        );
        setAreas(myAreas);
      }
    } catch (error) {
      console.error("Error loading areas:", error);
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
