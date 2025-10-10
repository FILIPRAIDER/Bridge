"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Briefcase, 
  Award, 
  Star, 
  Calendar,
  X,
  Mail,
  Phone,
  Globe,
  TrendingUp,
  Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { Loader } from "@/components/ui";
import type { TeamMember } from "@/types/api";

interface MemberWithProfile extends TeamMember {
  profile?: {
    headline?: string;
    bio?: string;
    country?: string;
    city?: string;
    address?: string;
    location?: string;
    stack?: string;
    sector?: {
      id: string;
      nameEs: string;
      icon?: string;
    } | string;
    sectorId?: string;
    seniority?: string;
    availability?: number;
    phone?: string;
    website?: string;
    linkedin?: string;
  };
  experiences?: Array<{
    id: string;
    role: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date?: string;
  }>;
  skills?: Array<{
    skill: {
      name: string;
      category?: string;
    };
    level: number;
  }>;
}

interface TeamMembersPortfolioProps {
  teamId: string;
  currentUserId: string;
}

export function TeamMembersPortfolio({ teamId, currentUserId }: TeamMembersPortfolioProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberWithProfile | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // Auto-select first member on desktop
  useEffect(() => {
    if (members.length > 0 && !selectedMember && window.innerWidth >= 1024) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
      
      const membersWithProfiles = await Promise.all(
        membersData.map(async (member) => {
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

  const handleMemberClick = (member: MemberWithProfile) => {
    if (window.innerWidth < 1024) {
      // Mobile: Open modal
      setSelectedMember(member);
      setIsMobileModalOpen(true);
    } else {
      // Desktop: Update left panel
      setSelectedMember(member);
    }
  };

  const getSeniorityLabel = (seniority?: string) => {
    const labels: Record<string, string> = {
      JUNIOR: "Junior",
      MID: "Mid-Level",
      SENIOR: "Senior",
      LEAD: "Lead",
      EXPERT: "Expert",
    };
    return seniority ? labels[seniority] || seniority : "—";
  };

  const getAvailabilityLabel = (availability?: number) => {
    if (!availability) return "—";
    return `${availability}h/semana`;
  };

  if (loading) {
    return <Loader message="Cargando equipo..." />;
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500">Aún no hay miembros en el equipo</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Selected Member Profile */}
        <div className="col-span-7 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedMember && (
              <motion.div
                key={selectedMember.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl">
                  <div className="flex items-start gap-6">
                    {selectedMember.user?.avatarUrl ? (
                      <img
                        src={selectedMember.user.avatarUrl}
                        alt={selectedMember.user?.name || "Avatar"}
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/20">
                        <span className="text-4xl font-bold">
                          {getInitials(selectedMember.user?.name, selectedMember.user?.email)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">
                          {selectedMember.user?.name || "Usuario"}
                        </h1>
                        <p className="text-lg text-white/80">
                          {selectedMember.profile?.headline || selectedMember.profile?.stack || "Sin título"}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          selectedMember.role === "LIDER"
                            ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                            : "bg-white/10 text-white/90 border border-white/20"
                        }`}>
                          {selectedMember.role === "LIDER" ? "Líder del Equipo" : "Miembro"}
                        </span>
                        
                        {selectedMember.profile?.seniority && (
                          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/90 border border-white/20">
                            {getSeniorityLabel(selectedMember.profile.seniority)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedMember.profile?.bio && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre mí</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedMember.profile.bio}</p>
                  </div>
                )}

                {/* Quick Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedMember.profile?.city || selectedMember.profile?.country) && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Ubicación</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedMember.profile.city && selectedMember.profile.country
                              ? `${selectedMember.profile.city}, ${selectedMember.profile.country}`
                              : selectedMember.profile.city || selectedMember.profile.country}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMember.profile?.availability && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Disponibilidad</p>
                          <p className="text-sm font-medium text-gray-900">
                            {getAvailabilityLabel(selectedMember.profile.availability)}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMember.profile?.sector && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Sector</p>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof selectedMember.profile.sector === 'string' 
                              ? selectedMember.profile.sector 
                              : selectedMember.profile.sector.nameEs}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMember.user?.email && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedMember.user.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Habilidades
                    </h3>
                    <div className="space-y-3">
                      {selectedMember.skills.slice(0, 8).map((skill, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {skill.skill.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {skill.level}/5
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level * 20}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.05 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedMember.experiences && selectedMember.experiences.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Experiencia
                    </h3>
                    <div className="space-y-4">
                      {selectedMember.experiences.slice(0, 3).map((exp) => (
                        <div key={exp.id} className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(exp.startDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                              {" - "}
                              {exp.endDate 
                                ? new Date(exp.endDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                                : "Actual"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {selectedMember.certifications && selectedMember.certifications.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      Certificaciones
                    </h3>
                    <div className="space-y-3">
                      {selectedMember.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{cert.name}</h4>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Member Grid */}
        <div className="col-span-5 overflow-y-auto pl-2 custom-scrollbar">
          <div className="sticky top-0 bg-gray-50 pb-4 z-10">
            <h2 className="text-xl font-bold text-gray-900">
              Team Members
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {members.map((member) => {
              const isSelected = selectedMember?.id === member.id;
              const isHovered = hoveredMemberId === member.id;
              
              return (
                <motion.button
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  onMouseEnter={() => setHoveredMemberId(member.id)}
                  onMouseLeave={() => setHoveredMemberId(null)}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-2xl transition-all text-left ${
                    isSelected
                      ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl ring-2 ring-gray-900 ring-offset-2"
                      : "bg-white hover:shadow-lg border border-gray-200"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    {member.user?.avatarUrl ? (
                      <div className={`relative w-24 h-24 rounded-2xl overflow-hidden ${
                        isSelected ? "ring-4 ring-white/30" : "ring-2 ring-gray-200"
                      }`}>
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user?.name || "Avatar"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
                        isSelected 
                          ? "bg-white/10 ring-4 ring-white/30" 
                          : "bg-gradient-to-br from-gray-700 to-gray-900 ring-2 ring-gray-200"
                      }`}>
                        <span className={`text-3xl font-bold ${
                          isSelected ? "text-white" : "text-white"
                        }`}>
                          {getInitials(member.user?.name, member.user?.email)}
                        </span>
                      </div>
                    )}
                    
                    {/* Name */}
                    <div className="w-full">
                      <p className={`font-semibold text-sm truncate ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}>
                        {member.user?.name || "Usuario"}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${
                        isSelected ? "text-white/70" : "text-gray-500"
                      }`}>
                        {member.profile?.headline || (member.role === "LIDER" ? "Líder" : "Miembro")}
                      </p>
                    </div>

                    {/* Role badge */}
                    {member.role === "LIDER" && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isSelected
                          ? "bg-purple-500/20 text-purple-200"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        Líder
                      </span>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <AnimatePresence>
                    {isHovered && !isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Grid of Cards */}
      <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-4">
        {members.map((member) => (
          <motion.button
            key={member.id}
            onClick={() => handleMemberClick(member)}
            whileTap={{ scale: 0.95 }}
            className="relative p-4 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {member.user?.avatarUrl ? (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gray-200">
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user?.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ring-2 ring-gray-200">
                  <span className="text-2xl font-bold text-white">
                    {getInitials(member.user?.name, member.user?.email)}
                  </span>
                </div>
              )}
              
              <div className="w-full">
                <p className="font-semibold text-sm truncate text-gray-900">
                  {member.user?.name || "Usuario"}
                </p>
                <p className="text-xs truncate text-gray-500 mt-0.5">
                  {member.profile?.headline || (member.role === "LIDER" ? "Líder" : "Miembro")}
                </p>
              </div>

              {member.role === "LIDER" && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  Líder
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {isMobileModalOpen && selectedMember && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileModalOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Handle bar */}
              <div className="sticky top-0 bg-white pt-3 pb-2 px-6 border-b border-gray-200 flex items-center justify-between z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 pb-safe">
                {/* Header */}
                <div className="flex items-start gap-4">
                  {selectedMember.user?.avatarUrl ? (
                    <img
                      src={selectedMember.user.avatarUrl}
                      alt={selectedMember.user?.name || "Avatar"}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {getInitials(selectedMember.user?.name, selectedMember.user?.email)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedMember.user?.name || "Usuario"}
                    </h2>
                    <p className="text-gray-600">
                      {selectedMember.profile?.headline || selectedMember.profile?.stack || "Sin título"}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedMember.role === "LIDER"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {selectedMember.role === "LIDER" ? "Líder" : "Miembro"}
                      </span>
                      
                      {selectedMember.profile?.seniority && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {getSeniorityLabel(selectedMember.profile.seniority)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedMember.profile?.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Sobre mí</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedMember.profile.bio}</p>
                  </div>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {(selectedMember.profile?.city || selectedMember.profile?.country) && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-900">Ubicación</p>
                      </div>
                      <p className="text-sm text-blue-700">
                        {selectedMember.profile.city && selectedMember.profile.country
                          ? `${selectedMember.profile.city}, ${selectedMember.profile.country}`
                          : selectedMember.profile.city || selectedMember.profile.country}
                      </p>
                    </div>
                  )}

                  {selectedMember.profile?.availability && (
                    <div className="p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-green-600" />
                        <p className="text-xs font-medium text-green-900">Disponibilidad</p>
                      </div>
                      <p className="text-sm text-green-700">
                        {getAvailabilityLabel(selectedMember.profile.availability)}
                      </p>
                    </div>
                  )}

                  {selectedMember.profile?.sector && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        <p className="text-xs font-medium text-purple-900">Sector</p>
                      </div>
                      <p className="text-sm text-purple-700">
                        {typeof selectedMember.profile.sector === 'string' 
                          ? selectedMember.profile.sector 
                          : selectedMember.profile.sector.nameEs}
                      </p>
                    </div>
                  )}

                  {selectedMember.user?.email && (
                    <div className="p-3 bg-orange-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-orange-600" />
                        <p className="text-xs font-medium text-orange-900">Email</p>
                      </div>
                      <p className="text-xs text-orange-700 truncate">
                        {selectedMember.user.email}
                      </p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Habilidades
                    </h3>
                    <div className="space-y-2">
                      {selectedMember.skills.slice(0, 5).map((skill, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {skill.skill.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {skill.level}/5
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${skill.level * 20}%` }}
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedMember.experiences && selectedMember.experiences.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Experiencia
                    </h3>
                    <div className="space-y-3">
                      {selectedMember.experiences.slice(0, 2).map((exp) => (
                        <div key={exp.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900">{exp.role}</h4>
                            <p className="text-xs text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : "Actual"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {selectedMember.certifications && selectedMember.certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      Certificaciones
                    </h3>
                    <div className="space-y-2">
                      {selectedMember.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Award className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900">{cert.name}</h4>
                            <p className="text-xs text-gray-600">{cert.issuer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
