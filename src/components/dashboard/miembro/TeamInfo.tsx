"use client";

import { Users, Mail, Calendar } from "lucide-react";
import type { Team, TeamMember } from "@/types/api";

interface TeamInfoProps {
  team: Team | null;
  members: TeamMember[];
  userId: string;
}

export function TeamInfo({ team, members, userId }: TeamInfoProps) {
  if (!team) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <p className="text-gray-500 text-center py-8">
          No estás asignado a ningún equipo
        </p>
      </div>
    );
  }

  const currentMember = members.find((m) => m.userId === userId);
  const leaders = members.filter((m) => m.role === "LIDER");
  const regularMembers = members.filter((m) => m.role === "MIEMBRO");

  return (
    <div className="space-y-6">
      {/* Team Info Card */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Información del Equipo
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-900" />
            <div>
              <span className="text-sm text-gray-600">Nombre:</span>
              <span className="ml-2 font-medium text-gray-900">
                {team.name}
              </span>
            </div>
          </div>
          {team.description && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-900 mt-0.5" />
              <div>
                <span className="text-sm text-gray-600">Descripción:</span>
                <p className="text-gray-900 mt-1">{team.description}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-900" />
            <div>
              <span className="text-sm text-gray-600">Creado:</span>
              <span className="ml-2 text-gray-900">
                {new Date(team.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          {currentMember && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-900" />
              <div>
                <span className="text-sm text-gray-600">Tu rol:</span>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                    currentMember.role === "LIDER"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {currentMember.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaders */}
      {leaders.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Líderes del Equipo
          </h2>
          <div className="space-y-3">
            {leaders.map((leader) => (
              <div
                key={leader.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {leader.user?.name || leader.user?.email}
                  </p>
                  <p className="text-sm text-gray-500">{leader.user?.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  LÍDER
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Miembros ({regularMembers.length})
        </h2>
        {regularMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aún no hay otros miembros
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {regularMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-900" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {member.user?.name || member.user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Desde{" "}
                    {new Date(member.joinedAt).toLocaleDateString("es-ES", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

