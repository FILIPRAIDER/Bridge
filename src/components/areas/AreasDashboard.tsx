"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { LayoutGrid, MessageSquare, Users, FileText, ArrowRight } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";
import type { TeamArea } from "@/types/areas";
import { AreaChatView } from "@/components/areas/AreaChatView";

interface AreasDashboardProps {
  teamId: string;
}

export function AreasDashboard({ teamId }: AreasDashboardProps) {
  const { data: session } = useSession();
  const { areas, loading } = useAreas(teamId);
  const [selectedArea, setSelectedArea] = useState<TeamArea | null>(null);

  if (!session?.user?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Debes iniciar sesión para ver las áreas</p>
      </div>
    );
  }

  // Si hay un área seleccionada, mostrar el chat
  if (selectedArea) {
    return (
      <AreaChatView
        teamId={teamId}
        area={selectedArea}
        userId={session.user.id}
        userName={session.user.name || session.user.email || "Usuario"}
        userRole={session.user.role as "LIDER" | "ESTUDIANTE" | "EMPRESARIO"}
        onBack={() => setSelectedArea(null)}
      />
    );
  }

  // Vista de lista de áreas
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
            <LayoutGrid className="h-8 w-8" />
            Áreas del Equipo
          </h1>
          <p className="mt-2 text-gray-300">
            Accede a cualquier área para ver su chat y colaborar con el equipo
          </p>
        </div>
      </div>

      {/* Areas Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="mt-2 text-gray-600">Cargando áreas...</p>
        </div>
      ) : areas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <LayoutGrid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay áreas creadas
          </h3>
          <p className="text-gray-600">
            Ve a "Gestionar Áreas" para crear la primera área del equipo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area)}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg transition-all text-left group"
            >
              {/* Area Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: area.color || "#6B7280" }}
                  >
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-gray-700">
                      {area.name}
                    </h3>
                    {area.description && (
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                        {area.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Area Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {area.memberCount || 0}
                  </p>
                  <p className="text-xs text-gray-600">Miembros</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {area.messageCount || 0}
                  </p>
                  <p className="text-xs text-gray-600">Mensajes</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {area.fileCount || 0}
                  </p>
                  <p className="text-xs text-gray-600">Archivos</p>
                </div>
              </div>

              {/* Quick Action */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Click para abrir chat</span>
                  <MessageSquare className="h-4 w-4 text-gray-400 group-hover:text-gray-900" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
