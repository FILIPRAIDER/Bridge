"use client";

import { useState } from "react";
import { Users, FileText, MessageSquare, Clock, Pencil, Trash2, UserPlus } from "lucide-react";
import type { TeamArea } from "@/types/areas";
import { useAreaMembers } from "@/hooks/useAreaMembers";
import { formatDistanceToNow } from "@/utils/dates";

interface AreaCardProps {
  area: TeamArea;
  onEdit: () => void;
  onDelete: () => void;
  onAssignMember: () => void;
}

export function AreaCard({ area, onEdit, onDelete, onAssignMember }: AreaCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // 🔥 Cargar miembros del área desde el endpoint
  const { members, loading: loadingMembers } = useAreaMembers(
    area.teamId,
    area.id,
    area.name,
    undefined // teamName no es crítico para el card
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {/* Icon */}
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                style={{ 
                  backgroundColor: area.color || "#e5e7eb",
                  filter: "brightness(1.1)"
                }}
              >
                {area.icon || "📁"}
              </div>
              
              {/* Name */}
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {area.name}
              </h3>
            </div>

            {/* Description */}
            {area.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {area.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar área"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar área"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="font-medium">{area.memberCount || 0}</span>
            <span>miembros</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{area.fileCount || 0}</span>
            <span>archivos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">{area.messageCount || 0}</span>
            <span>mensajes</span>
          </div>
          {area.lastActivityAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Activo {formatDistanceToNow(area.lastActivityAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Members Section */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>Miembros del área ({area.memberCount || 0})</span>
          <svg
            className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="mt-4 space-y-2">
            {loadingMembers ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Cargando miembros...
              </p>
            ) : members && members.length > 0 ? (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-700">
                        {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.role === "LEADER" ? "Líder del área" : "Miembro"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(member.assignedAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay miembros asignados
              </p>
            )}

            <button
              onClick={onAssignMember}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Asignar Miembro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
