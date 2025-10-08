"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Clock, Target, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { MemberProfile, UserSkill } from "@/types/api";

interface ProfileCardProps {
  profile: MemberProfile | null;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { data: session } = useSession();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSkills = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const userSkills = await api.get<UserSkill[]>(`/users/${session.user.id}/skills`);
      setSkills(Array.isArray(userSkills) ? userSkills : []);
    } catch (error) {
      console.error("Error loading skills:", error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadSkills();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Get seniority label
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

  // Render star rating
  const renderStars = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-3 w-3 ${
              star <= level
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (!profile && !session?.user) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
      {/* Header Background */}
      <div className="relative h-32 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar positioned over header */}
        <div className="flex items-start gap-6 -mt-16">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={session?.user?.avatarUrl || "/default-avatar.png"}
              alt={session?.user?.name || "Usuario"}
              className="w-32 h-32 rounded-2xl border-4 border-white object-cover bg-white shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
              }}
            />
          </div>

          {/* Info next to avatar */}
          <div className="flex-1 pt-20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {session?.user?.name || "Usuario"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {profile?.headline || "Desarrollador Full Stack"}
                </p>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {getSeniorityLabel(profile?.seniority)}
                  </span>
                  {profile?.sector && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {typeof profile.sector === 'object' 
                        ? `${profile.sector.icon || ''} ${profile.sector.nameEs}`
                        : profile.sector}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact info aligned to right */}
              <div className="hidden md:flex flex-col items-end gap-2 text-sm text-gray-600">
                {profile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.availability && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{profile.availability} hrs/semana</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile contact info */}
            <div className="md:hidden flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.availability && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{profile.availability} hrs/semana</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Skills Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skills Profesionales
            </h3>
            {skills.length > 0 && (
              <span className="text-xs text-gray-500">
                {skills.length} skill{skills.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Target className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                No has agregado skills aún
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((userSkill) => (
                <div
                  key={userSkill.id}
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
                    {renderStars(userSkill.level)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
