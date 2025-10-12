"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Search } from "lucide-react";
import type { TeamArea, AreaRole } from "@/types/areas";
import { useAreaMembers } from "@/hooks/useAreaMembers";
import { AreaRole as AreaRoleEnum } from "@/types/areas";

interface AssignMemberModalProps {
  isOpen: boolean;
  area: TeamArea;
  teamId: string;
  onClose: () => void;
  onAssign: () => void;
}

// Mock de miembros del equipo - TODO: Reemplazar con datos reales
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export function AssignMemberModal({ isOpen, area, teamId, onClose, onAssign }: AssignMemberModalProps) {
  const [teamName, setTeamName] = useState<string>("");
  const { members, assignMember } = useAreaMembers(teamId, area.id, area.name, teamName);
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<AreaRole>(AreaRoleEnum.MEMBER);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar miembros disponibles del equipo
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${teamId}/members`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          // Filtrar miembros que ya están en el área
          const assignedUserIds = members.map((m) => m.userId);
          const available = data.members
            .filter((m: any) => !assignedUserIds.includes(m.userId))
            .map((m: any) => ({
              id: m.userId,
              name: m.user?.name || m.user?.email || "Usuario",
              email: m.user?.email || "",
              avatarUrl: m.user?.avatarUrl || null,
            }));
          
          setAvailableMembers(available);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
      }
    };

    const loadTeamInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${teamId}`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setTeamName(data.name || "Equipo");
        }
      } catch (error) {
        console.error("Error loading team info:", error);
        setTeamName("Equipo");
      }
    };

    if (isOpen && teamId && area.id) {
      loadTeamMembers();
      loadTeamInfo();
    }
  }, [isOpen, teamId, area.id, members]);

  const handleAssign = async () => {
    if (!selectedMember) return;

    setLoading(true);
    try {
      const success = await assignMember({
        userId: selectedMember,
        role: selectedRole,
      });

      if (success) {
        onAssign();
      }
    } catch (error) {
      console.error("Error assigning member:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = availableMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 px-6 py-5 border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Asignar Miembro</h2>
              <p className="text-sm text-gray-600 mt-1">Área: {area.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar miembro..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
            />
          </div>

          {/* Member List */}
          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchQuery ? "No se encontraron miembros" : "No hay miembros disponibles"}
              </p>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    selectedMember === member.id
                      ? "border-gray-900 bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {member.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Role Selection */}
          {selectedMember && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol en el área
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(AreaRoleEnum.MEMBER)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedRole === AreaRoleEnum.MEMBER
                      ? "border-gray-900 bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900">Miembro</p>
                  <p className="text-xs text-gray-500 mt-1">Acceso regular</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole(AreaRoleEnum.LEADER)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedRole === AreaRoleEnum.LEADER
                      ? "border-gray-900 bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900">Líder</p>
                  <p className="text-xs text-gray-500 mt-1">Permisos extra</p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedMember}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Asignando..." : "Asignar Miembro"}
          </button>
        </div>
      </div>
    </div>
  );
}
