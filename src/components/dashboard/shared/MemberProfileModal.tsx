"use client";

import { X, MapPin, Clock, Briefcase, Award, Target } from "lucide-react";
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

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberWithProfile | null;
}

export function MemberProfileModal({ isOpen, onClose, member }: MemberProfileModalProps) {
  if (!isOpen || !member) return null;

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

  const getSeniorityLabel = (seniority?: string) => {
    switch (seniority) {
      case "JUNIOR":
        return "Junior";
      case "SEMI_SENIOR":
        return "Semi-Senior";
      case "SENIOR":
        return "Senior";
      default:
        return "Mid-level";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient background */}
          <div className="relative h-32 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-lg transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 relative">
            <div className="px-6 pb-6">
              {/* Avatar positioned over header */}
              <div className="flex items-start gap-6 -mt-16 mb-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0 z-10">
                  {member.user?.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user?.name || "Avatar"}
                      className="w-32 h-32 rounded-2xl border-4 border-white object-cover bg-white shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-xl">
                      <span className="text-white font-bold text-3xl">
                        {getInitials(member.user?.name, member.user?.email)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info next to avatar */}
                <div className="flex-1 pt-20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {member.user?.name || "Usuario"}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {member.profile?.headline || "Desarrollador"}
                      </p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {member.role && (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              member.role === "LIDER"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {member.role === "LIDER" ? "LÍDER" : "MIEMBRO"}
                          </span>
                        )}
                        {member.profile?.seniority && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            <Target className="h-3 w-3" />
                            {getSeniorityLabel(member.profile.seniority)}
                          </span>
                        )}
                        {member.profile?.sector && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {typeof member.profile.sector === 'object' 
                              ? `${member.profile.sector.icon || ''} ${member.profile.sector.nameEs}`
                              : member.profile.sector}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact info aligned to right - Desktop */}
                    <div className="hidden md:flex flex-col items-end gap-2 text-sm text-gray-600">
                      {member.profile?.seniority && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="font-medium">{getSeniorityLabel(member.profile.seniority)}</span>
                        </div>
                      )}
                      {(member.profile?.city || member.profile?.country || member.profile?.location) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {member.profile.city && member.profile.country
                              ? `${member.profile.city}, ${member.profile.country}`
                              : member.profile.city || member.profile.country || member.profile.location}
                          </span>
                        </div>
                      )}
                      {member.profile?.availability && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{member.profile.availability} hrs/semana</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile contact info */}
                  <div className="md:hidden flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                    {(member.profile?.city || member.profile?.country || member.profile?.location) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {member.profile.city && member.profile.country
                            ? `${member.profile.city}, ${member.profile.country}`
                            : member.profile.city || member.profile.country || member.profile.location}
                        </span>
                      </div>
                    )}
                    {member.profile?.availability && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{member.profile.availability} hrs/semana</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {member.profile?.bio && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Sobre mí</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {member.profile.bio}
                  </p>
                </div>
              )}

              {/* Additional Details */}
              {(member.profile?.stack || member.profile?.phone || member.profile?.address) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Información Adicional</h4>
                  <div className="space-y-2">
                    {member.profile.stack && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Stack Tecnológico:</span>
                        <p className="text-sm text-gray-900 mt-0.5">{member.profile.stack}</p>
                      </div>
                    )}
                    {member.profile.phone && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Teléfono:</span>
                        <p className="text-sm text-gray-900 mt-0.5">{member.profile.phone}</p>
                      </div>
                    )}
                    {member.profile.address && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Dirección:</span>
                        <p className="text-sm text-gray-900 mt-0.5">{member.profile.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {member.skills && member.skills.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Skills Profesionales
                    </h3>
                    <span className="text-xs text-gray-500">
                      {member.skills.length} skill{member.skills.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {member.skills.map((userSkill, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userSkill.skill?.name || "Skill"}
                          </p>
                          {userSkill.skill?.category && (
                            <p className="text-xs text-gray-500 truncate">
                              {userSkill.skill.category}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= userSkill.level
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
