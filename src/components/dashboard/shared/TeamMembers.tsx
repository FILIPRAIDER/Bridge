"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Clock, Award, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { Loader } from "@/components/ui";
import type { TeamMember } from "@/types/api";

interface MemberWithProfile extends TeamMember {
  profile?: {
    headline?: string;
    bio?: string;
    location?: string;
    stack?: string;
    sector?: string;
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
  const [hoveredMember, setHoveredMember] = useState<MemberWithProfile | null>(null);
  const [pinnedMember, setPinnedMember] = useState<MemberWithProfile | null>(null);

  // Miembro que se muestra en el panel (hover o pinned)
  const displayedMember = hoveredMember || pinnedMember;

  useEffect(() => {
    loadMembers();
  }, [teamId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
      
      // Load profile for each member
      const membersWithProfiles = await Promise.all(
        membersData.map(async (member) => {
          try {
            const userData = await api.get<any>(`/users/${member.userId}`);
            return {
              ...member,
              profile: userData.profile || {},
              experiences: userData.experiences || [],
              certifications: userData.certifications || [],
              skills: userData.userSkills || [],
            };
          } catch (error) {
            console.error(`Error loading profile for user ${member.userId}:`, error);
            return member;
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
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
      {/* Left Panel - Member Info (Desktop only) */}
      <div className="hidden lg:block lg:w-1/3 xl:w-1/4">
        <div className="sticky top-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {displayedMember ? (
            <div className="p-6">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                {displayedMember.user?.avatarUrl ? (
                  <img
                    src={displayedMember.user.avatarUrl}
                    alt={displayedMember.user?.name || "Avatar"}
                    className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-gray-200">
                    <span className="text-white font-bold text-2xl">
                      {getInitials(displayedMember.user?.name, displayedMember.user?.email)}
                    </span>
                  </div>
                )}
              </div>

              {/* Name & Role */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {displayedMember.user?.name || "Usuario"}
                </h2>
                {displayedMember.profile?.headline && (
                  <p className="text-sm text-gray-600 mt-1">
                    {displayedMember.profile.headline}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      displayedMember.role === "LIDER"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {displayedMember.role}
                  </span>
                  {displayedMember.profile?.seniority && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {displayedMember.profile.seniority}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 mb-4">
                {displayedMember.profile?.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{displayedMember.profile.location}</span>
                  </div>
                )}
                {displayedMember.profile?.availability && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{displayedMember.profile.availability} hrs/semana</span>
                  </div>
                )}
                {displayedMember.skills && displayedMember.skills.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>{displayedMember.skills.length} skills</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {displayedMember.profile?.bio && (
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {displayedMember.profile.bio}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Pasa el mouse sobre un miembro
                  <br />
                  para ver su información
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Members Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const avatarUrl = member.user?.avatarUrl;
            const isActive = displayedMember?.id === member.id;
            
            return (
              <div
                key={member.id}
                onMouseEnter={() => {
                  setHoveredMember(member);
                  setPinnedMember(member);
                }}
                onMouseLeave={() => setHoveredMember(null)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group ${
                  isActive
                    ? "ring-4 ring-gray-900 scale-105 shadow-2xl z-10"
                    : "hover:ring-2 hover:ring-gray-400 hover:scale-102 hover:shadow-lg"
                }`}
              >
                {/* Avatar Image */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={member.user?.name || "Avatar"}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isActive ? "grayscale-0" : "grayscale"
                    }`}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center transition-all duration-300 ${
                    isActive ? "" : "grayscale"
                  }`}>
                    <span className="text-white font-bold text-3xl">
                      {getInitials(member.user?.name, member.user?.email)}
                    </span>
                  </div>
                )}

                {/* Overlay with name on hover */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  <p className="text-white font-semibold text-sm truncate">
                    {member.user?.name || "Usuario"}
                    {isCurrentUser && (
                      <span className="ml-1 text-xs opacity-75">(Tú)</span>
                    )}
                  </p>
                  {member.profile?.headline && (
                    <p className="text-white/80 text-xs truncate">
                      {member.profile.headline}
                    </p>
                  )}
                </div>

                {/* Role Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      member.role === "LIDER"
                        ? "bg-purple-600/90 text-white"
                        : "bg-white/90 text-gray-800"
                    }`}
                  >
                    {member.role === "LIDER" ? "L" : "M"}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
