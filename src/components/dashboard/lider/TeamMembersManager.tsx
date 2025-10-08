"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserX,
  Shield,
  User,
  Download,
  AlertTriangle,
  Crown,
  Calendar,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { MemberProfileModal } from "@/components/dashboard/shared/MemberProfileModal";
import type { TeamMember } from "@/types/api";

interface TeamMembersManagerProps {
  teamId: string;
  currentUserId: string;
}

type ExtendedTeamMember = TeamMember & {
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
};

export function TeamMembersManager({
  teamId,
  currentUserId,
}: TeamMembersManagerProps) {
  const { show } = useToast();
  const [members, setMembers] = useState<ExtendedTeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ExtendedTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "LIDER" | "MIEMBRO">("all");
  
  // Modal states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ExtendedTeamMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [teamId]);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, roleFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get<ExtendedTeamMember[]>(
        `/teams/${teamId}/members`
      );
      
      // Cargar datos completos incluyendo profile y skills
      const membersWithFullData = await Promise.all(
        response.map(async (member) => {
          try {
            const userData = await api.get<any>(`/users/${member.userId}`);
            let userSkills = [];
            try {
              const skillsData = await api.get<any>(`/users/${member.userId}/skills`);
              userSkills = skillsData?.skills || skillsData || [];
            } catch (skillError) {
              console.error(`Error loading skills for user ${member.userId}:`, skillError);
            }
            return {
              ...member,
              profile: userData.profile || {},
              experiences: userData.experiences || [],
              certifications: userData.certifications || [],
              skills: userSkills,
            };
          } catch (error) {
            console.error(`Error loading profile for user ${member.userId}:`, error);
            return member;
          }
        })
      );
      
      setMembers(membersWithFullData);
    } catch (error: any) {
      show({
        message: error.message || "Error al cargar miembros",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (member: any) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (member) =>
          member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((member) => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    // Validaciones
    if (memberToRemove.userId === currentUserId) {
      show({
        message: "No puedes expulsarte a ti mismo",
        variant: "error",
      });
      return;
    }

    const leaderCount = members.filter((m) => m.role === "LIDER").length;
    if (memberToRemove.role === "LIDER" && leaderCount === 1) {
      show({
        message: "Debe haber al menos un líder en el equipo",
        variant: "error",
      });
      return;
    }

    try {
      setRemoving(true);
      await api.delete(`/teams/${teamId}/members/${memberToRemove.userId}`, {
        body: JSON.stringify({ byUserId: currentUserId }),
      });
      show({
        message: `${memberToRemove.user?.name || "El miembro"} ha sido expulsado del equipo`,
        variant: "success",
      });
      setShowRemoveModal(false);
      setMemberToRemove(null);
      loadMembers();
    } catch (error: any) {
      show({
        message: error.message || "Error al expulsar miembro",
        variant: "error",
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleChangeRole = async (member: ExtendedTeamMember) => {
    // Validaciones
    if (member.userId === currentUserId) {
      show({
        message: "No puedes cambiar tu propio rol",
        variant: "error",
      });
      return;
    }

    const leaderCount = members.filter((m) => m.role === "LIDER").length;
    if (member.role === "LIDER" && leaderCount === 1) {
      show({
        message: "Debe haber al menos un líder en el equipo",
        variant: "error",
      });
      return;
    }

    const newRole = member.role === "LIDER" ? "MIEMBRO" : "LIDER";

    try {
      await api.patch(`/teams/${teamId}/members/${member.userId}/role`, {
        role: newRole,
        byUserId: currentUserId,
      });
      show({
        message: `Rol actualizado a ${newRole}`,
        variant: "success",
      });
      loadMembers();
    } catch (error: any) {
      show({
        message: error.message || "Error al cambiar rol",
        variant: "error",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const csv = [
        ["Nombre", "Email", "Rol", "Fecha de Ingreso"],
        ...members.map((m) => [
          m.user?.name || "Sin nombre",
          m.user?.email || "",
          m.role,
          new Date(m.joinedAt).toLocaleDateString("es-ES"),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `miembros-equipo-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      show({
        message: "CSV exportado correctamente",
        variant: "success",
      });
    } catch (error) {
      show({
        message: "Error al exportar CSV",
        variant: "error",
      });
    }
  };

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getTimeSinceJoined = (member: ExtendedTeamMember) => {
    // Intentar usar joinedAt primero, luego createdAt como fallback
    const dateString = member.joinedAt || (member as any).createdAt;
    
    if (!dateString) {
      return "Fecha no disponible";
    }
    
    const joined = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(joined.getTime())) {
      return "Fecha inválida";
    }
    
    const now = new Date();
    const diffMs = now.getTime() - joined.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Recientemente";
    } else if (diffDays < 1) {
      return "Hoy";
    } else if (diffDays < 30) {
      return `Hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} mes${months !== 1 ? "es" : ""}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Hace ${years} año${years !== 1 ? "s" : ""}`;
    }
  };

  return (
    <>
      {/* Member Profile Modal */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        member={selectedMember}
      />

      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Miembros del Equipo
              </h2>
              <p className="text-sm text-gray-500">
                {members.length} miembro{members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as typeof roleFilter)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-sm bg-white"
          >
            <option value="all">Todos los roles</option>
            <option value="LIDER">Líderes</option>
            <option value="MIEMBRO">Miembros</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando miembros...</div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || roleFilter !== "all"
                ? "No se encontraron miembros con estos filtros"
                : "No hay miembros en el equipo"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miembro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingreso
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.userId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Member Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          {member.user?.avatarUrl ? (
                            <img
                              src={member.user.avatarUrl}
                              alt={member.user.name || "Avatar"}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-gray-200">
                              <span className="text-white font-semibold text-sm">
                                {getInitials(
                                  member.user?.name,
                                  member.user?.email || ""
                                )}
                              </span>
                            </div>
                          )}
                          {/* Name & Email */}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {member.user?.name || "Sin nombre"}
                              </p>
                              {member.userId === currentUserId && (
                                <span className="text-xs text-gray-500 italic">
                                  (Tú)
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              member.role === "LIDER"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {member.role === "LIDER" && (
                              <Crown className="h-3 w-3" />
                            )}
                            {member.role === "LIDER" ? "Líder" : "Miembro"}
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {getTimeSinceJoined(member)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Profile */}
                          <button
                            onClick={() => handleViewProfile(member)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver perfil"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Change Role */}
                          {member.userId !== currentUserId && (
                            <button
                              onClick={() => handleChangeRole(member)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title={`Cambiar a ${
                                member.role === "LIDER" ? "Miembro" : "Líder"
                              }`}
                            >
                              {member.role === "LIDER" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Shield className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {/* Remove */}
                          {member.userId !== currentUserId && (
                            <button
                              onClick={() => {
                                setMemberToRemove(member);
                                setShowRemoveModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Expulsar del equipo"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <div key={member.userId} className="p-4 space-y-3">
                  {/* Member Info */}
                  <div className="flex items-start gap-3">
                    {member.user?.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.name || "Avatar"}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-gray-200">
                        <span className="text-white font-semibold">
                          {getInitials(
                            member.user?.name,
                            member.user?.email || ""
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {member.user?.name || "Sin nombre"}
                        </p>
                        {member.userId === currentUserId && (
                          <span className="text-xs text-gray-500 italic">
                            (Tú)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Role & Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        member.role === "LIDER"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.role === "LIDER" && <Crown className="h-3 w-3" />}
                      {member.role === "LIDER" ? "Líder" : "Miembro"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getTimeSinceJoined(member)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {/* View Profile - Always show */}
                    <button
                      onClick={() => handleViewProfile(member)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Ver perfil
                    </button>

                    {/* Change Role & Remove - Only for others */}
                    {member.userId !== currentUserId && (
                      <>
                        <button
                          onClick={() => handleChangeRole(member)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          {member.role === "LIDER" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                          Cambiar rol
                        </button>
                        <button
                          onClick={() => {
                            setMemberToRemove(member);
                            setShowRemoveModal(true);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <UserX className="h-4 w-4" />
                          Expulsar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        {!loading && filteredMembers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Mostrando {filteredMembers.length} de {members.length} miembro
              {members.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Remove Member Modal */}
      {showRemoveModal && memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            {/* Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Expulsar a {memberToRemove.user?.name || "este miembro"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {memberToRemove.user?.email}
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                ¿Estás seguro de que deseas expulsar a este miembro del equipo?
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Perderá acceso inmediato al equipo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>No podrá ver proyectos ni recursos compartidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Podrá ser invitado nuevamente si es necesario</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setMemberToRemove(null);
                }}
                disabled={removing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={removing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {removing ? "Expulsando..." : "Expulsar"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
