"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import type { TeamMember, Skill, UserSkill } from "@/types/api";

interface ManageSkillsProps {
  teamId: string;
  members: TeamMember[];
}

export function ManageSkills({ teamId, members }: ManageSkillsProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [teamSkills, setTeamSkills] = useState<Map<string, UserSkill[]>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillsData();
  }, [teamId, members]);

  const loadSkillsData = async () => {
    try {
      setLoading(true);
      const skillsData = await api.get<Skill[]>("/skills");
      setSkills(skillsData);

      // Cargar skills de cada miembro
      const skillsMap = new Map<string, UserSkill[]>();
      for (const member of members) {
        try {
          const userSkills = await api.get<UserSkill[]>(
            `/users/${member.userId}/skills`
          );
          skillsMap.set(member.userId, userSkills);
        } catch (error) {
          console.error(
            `Error loading skills for user ${member.userId}:`,
            error
          );
        }
      }
      setTeamSkills(skillsMap);
    } catch (error) {
      console.error("Error loading skills data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando skills...</div>
      </div>
    );
  }

  // Agrupar skills por miembro
  const getSkillsByMember = () => {
    return members.map((member) => ({
      member,
      skills: teamSkills.get(member.userId) || [],
    }));
  };

  // Obtener top skills del equipo
  const getTopSkills = () => {
    const skillCount = new Map<string, number>();
    const skillDetails = new Map<string, Skill>();

    teamSkills.forEach((userSkills) => {
      userSkills.forEach((us) => {
        if (us.skill) {
          skillCount.set(
            us.skillId,
            (skillCount.get(us.skillId) || 0) + us.level
          );
          skillDetails.set(us.skillId, us.skill);
        }
      });
    });

    return Array.from(skillCount.entries())
      .map(([skillId, count]) => ({
        skill: skillDetails.get(skillId)!,
        totalLevel: count,
      }))
      .sort((a, b) => b.totalLevel - a.totalLevel)
      .slice(0, 10);
  };

  const memberSkills = getSkillsByMember();
  const topSkills = getTopSkills();

  return (
    <div className="space-y-6">
      {/* Top Skills del Equipo */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">
            Top Skills del Equipo
          </h2>
        </div>

        {topSkills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aún no hay skills registrados en el equipo
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topSkills.map(({ skill, totalLevel }) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-900" />
                  <span className="font-medium text-gray-900">
                    {skill.name}
                  </span>
                  {skill.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {skill.category}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Nivel total: {totalLevel}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills por Miembro */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Skills por Miembro
        </h2>

        {memberSkills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay miembros en el equipo
          </p>
        ) : (
          <div className="space-y-6">
            {memberSkills.map(({ member, skills }) => (
              <div
                key={member.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {member.user?.name || member.user?.email || "Usuario"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {member.user?.email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.role === "LIDER"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>

                {skills.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Sin skills registrados
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {skills.map((us) => (
                      <div
                        key={us.id}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {us.skill?.name || "Unknown"}
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-3 w-3 ${
                                star <= us.level
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
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

