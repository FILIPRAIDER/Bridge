"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Users, FileText, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "@/utils/dates";
import { AreaChatView } from "@/components/areas/AreaChatView";
import { useSession } from "next-auth/react";
import { useAreaMembers } from "@/hooks/useAreaMembers";

interface MyAreaProps {
  userId: string;
  teamId: string;
}

export function MyArea({ userId, teamId }: MyAreaProps) {
  const { data: session } = useSession();
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);

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
          } catch (err: any) {
            // 403 es normal - significa que no eres miembro de esa área
            // Solo logueamos otros errores
            if (err?.status !== 403 && !err?.message?.includes("No tienes acceso")) {
              console.error(`Error loading members for area ${area.id}:`, err);
            }
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

  // 🔥 Si hay un área seleccionada, mostrar el chat completo
  if (selectedArea && session?.user) {
    return (
      <AreaChatView
        teamId={teamId}
        area={selectedArea}
        userId={session.user.id}
        userName={session.user.name || session.user.email || "Usuario"}
        onBack={() => setSelectedArea(null)}
      />
    );
  }

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
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
              <button
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                onClick={() => setSelectedArea(area)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Abrir Chat y Archivos</span>
              </button>

              {/* Toggle Members */}
              <button
                onClick={() =>
                  setExpandedAreaId(
                    expandedAreaId === area.id ? null : area.id
                  )
                }
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Ver Miembros</span>
                {expandedAreaId === area.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Members List */}
              {expandedAreaId === area.id && (
                <AreaMembersList teamId={teamId} areaId={area.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Función helper para traducir roles
function translateRole(role: string): string {
  const translations: Record<string, string> = {
    'LEADER': 'Líder',
    'MEMBER': 'Miembro',
    'ESTUDIANTE': 'Estudiante',
    'LIDER': 'Líder',
  };
  return translations[role] || role;
}

// Componente interno para mostrar miembros (sin botón de eliminar)
function AreaMembersList({ teamId, areaId }: { teamId: string; areaId: string }) {
  const { members, loading, error } = useAreaMembers(teamId, areaId);

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 text-sm text-red-600 text-center">
        Error al cargar miembros
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="py-4 text-sm text-gray-500 text-center">
        No hay miembros asignados
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-lg"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {member.user?.avatarUrl ? (
              <img
                src={member.user.avatarUrl}
                alt={member.user.name || "Usuario"}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {member.user?.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {member.user?.name || member.user?.email || "Usuario"}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{translateRole(member.role)}</span>
              <span>•</span>
              <span>{formatDistanceToNow(member.assignedAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
