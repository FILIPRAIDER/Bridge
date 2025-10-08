"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { api } from "@/lib/api";
import { Loader } from "@/components/ui";
import { MemberProfileModal } from "./MemberProfileModal";
import type { TeamMember } from "@/types/api";

interface MemberWithProfile extends TeamMember {
  profile?: {
    headline?: string;
    bio?: string;
    // Ubicación - Nuevo formato
    country?: string;
    city?: string;
    address?: string;
    location?: string; // Fallback antiguo
    stack?: string;
    // Sector - Puede ser objeto o string (para retrocompatibilidad)
    sector?: {
      id: string;
      nameEs: string;
      icon?: string;
    } | string;
    sectorId?: string;
    seniority?: string;
    availability?: number;
    phone?: string;
  };
  experiences?: Array<{
    id: string;
    role: string;
    company: string;
    startDate: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
  }>;
  skills?: Array<{
    skill: {
      name: string;
      category?: string;
    };
    level: number;
  }>;
}

interface TeamMembersProps {
  teamId: string;
  currentUserId: string;
}

export function TeamMembers({ teamId, currentUserId }: TeamMembersProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberWithProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
      
      // Load profile for each member
      const membersWithProfiles = await Promise.all(
        membersData.map(async (member) => {
          try {
            // Cargar datos completos del usuario
            const userData = await api.get<any>(`/users/${member.userId}`);
            
            // Cargar skills del usuario específicamente
            let userSkills = [];
            try {
              const skillsData = await api.get<any>(`/users/${member.userId}/skills`);
              // El backend puede devolver { skills: [...] } o directamente [...]
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
            return {
              ...member,
              profile: {},
              experiences: [],
              certifications: [],
              skills: [],
            };
          }
        })
      );
      
      setMembers(membersWithProfiles);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  const handleViewMember = (member: MemberWithProfile) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMember(null), 300); // Delay para animación
  };

  if (loading) {
    return <Loader message="Cargando miembros del equipo..." />;
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <p className="text-gray-500 text-center py-8">
          Aún no hay miembros en el equipo
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Member Profile Modal */}
      <MemberProfileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        member={selectedMember}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Miembros del Equipo
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {members.length} miembro{members.length !== 1 ? "s" : ""} en total
          </p>
        </div>

        {/* Table - Desktop */}
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
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar + Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {member.user?.avatarUrl ? (
                          <img
                            src={member.user.avatarUrl}
                            alt={member.user?.name || "Avatar"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {getInitials(member.user?.name, member.user?.email)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.user?.name || "Usuario"}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-500">(Tú)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.user?.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.role === "LIDER"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role === "LIDER" ? "Líder" : "Miembro"}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.profile?.city && member.profile?.country
                        ? `${member.profile.city}, ${member.profile.country}`
                        : member.profile?.city || member.profile?.country || member.profile?.location || "—"}
                    </td>

                    {/* Skills count */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.skills && member.skills.length > 0
                        ? `${member.skills.length} skill${member.skills.length !== 1 ? "s" : ""}`
                        : "Sin skills"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewMember(member)}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver perfil</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            
            return (
              <div
                key={member.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {member.user?.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user?.name || "Avatar"}
                        className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium">
                          {getInitials(member.user?.name, member.user?.email)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user?.name || "Usuario"}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-gray-500">(Tú)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.user?.email || ""}
                      </p>
                      <span
                        className={`mt-1 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          member.role === "LIDER"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role === "LIDER" ? "Líder" : "Miembro"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>
                    {member.profile?.city && member.profile?.country
                      ? `${member.profile.city}, ${member.profile.country}`
                      : member.profile?.city || member.profile?.country || member.profile?.location || "Sin ubicación"}
                  </span>
                  <span>
                    {member.skills && member.skills.length > 0
                      ? `${member.skills.length} skill${member.skills.length !== 1 ? "s" : ""}`
                      : "Sin skills"}
                  </span>
                </div>
                
                <button
                  onClick={() => handleViewMember(member)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Ver perfil completo
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
