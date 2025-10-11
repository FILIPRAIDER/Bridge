"use client";

import { useState } from "react";
import { Users, TrendingUp, Mail, Award, Edit2, Check, X, Calendar, Settings } from "lucide-react";
import { TeamAvatarWithCamera } from "@/components/shared/TeamAvatarWithCamera";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import type { Team, TeamMember } from "@/types/api";

interface TeamOverviewProps {
  team: Team | null;
  members: TeamMember[];
  onRefresh: () => void;
}

export function TeamOverview({ team, members, onRefresh }: TeamOverviewProps) {
  const { show } = useToast();
  const router = useRouter();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [saving, setSaving] = useState(false);
  
  const regularMembers = members.filter((m) => m.role === "MIEMBRO").length;
  const leaders = members.filter((m) => m.role === "LIDER").length;

  const handleEditDescription = () => {
    setDescription(team?.description || "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (!team?.id) return;
    
    setSaving(true);
    try {
      await api.patch(`/teams/${team.id}`, { description });
      show({ message: "Descripción actualizada", variant: "success" });
      setIsEditingDescription(false);
      onRefresh();
    } catch (error: any) {
      show({ message: error.message || "Error al guardar", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditName = () => {
    setTeamName(team?.name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!team?.id || !teamName.trim()) return;
    
    setSaving(true);
    try {
      await api.patch(`/teams/${team.id}`, { name: teamName });
      show({ message: "Nombre actualizado", variant: "success" });
      setIsEditingName(false);
      onRefresh();
    } catch (error: any) {
      show({ message: error.message || "Error al guardar", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Header Card with Photo */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-md overflow-hidden relative">
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Header Content */}
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Team Avatar */}
            <div className="flex-shrink-0">
              <TeamAvatarWithCamera
                avatarUrl={(team as any)?.profileImage}
                teamName={team?.name || "Equipo"}
                size="xl"
                showCamera={false}
                editable={false}
                className="ring-4 ring-white/10 shadow-2xl"
              />
            </div>

            {/* Team Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="bg-white/10 border-2 border-gray-500/30 text-white placeholder-white/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/50 text-xl font-bold flex-1 backdrop-blur-sm"
                        placeholder="Nombre del equipo"
                        disabled={saving}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving || !teamName.trim()}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 backdrop-blur-sm border border-gray-500/20"
                        title="Guardar"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        disabled={saving}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm border border-gray-500/20"
                        title="Cancelar"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                        {team?.name || "Sin nombre"}
                      </h1>
                      <button
                        onClick={handleEditName}
                        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
                        title="Editar nombre"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {isEditingDescription ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-white/10 border-2 border-gray-500/30 text-white placeholder-white/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/50 text-sm w-full resize-none backdrop-blur-sm"
                        rows={2}
                        placeholder="Descripción del equipo..."
                        disabled={saving}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveDescription}
                          disabled={saving}
                          className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm border border-gray-500/20"
                        >
                          <Check className="h-4 w-4" />
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => setIsEditingDescription(false)}
                          disabled={saving}
                          className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm border border-gray-500/20"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start justify-center sm:justify-start gap-2">
                      <p className="text-gray-300 text-sm sm:text-base max-w-2xl">
                        {team?.description || "Sin descripción. Click en editar para agregar una."}
                      </p>
                      <button
                        onClick={handleEditDescription}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 backdrop-blur-sm"
                        title="Editar descripción"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col items-center sm:items-end gap-2">
                  <button
                    onClick={() => router.push('/dashboard/lider/equipo/configuracion')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all text-sm font-medium shadow-lg border border-gray-500/30 backdrop-blur-sm"
                  >
                    <Settings className="h-4 w-4" />
                    Configurar Equipo
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {members.length} {members.length === 1 ? "miembro" : "miembros"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">
                    {leaders} {leaders === 1 ? "líder" : "líderes"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Desde {team?.createdAt
                      ? new Date(team.createdAt).toLocaleDateString("es-ES", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Chrome/Silver Effect */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-t border-gray-300/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Users className="h-5 w-5 text-gray-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium">Total</p>
                  <p className="text-lg font-bold text-gray-900">{members.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <TrendingUp className="h-5 w-5 text-green-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium">Regulares</p>
                  <p className="text-lg font-bold text-gray-900">{regularMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Award className="h-5 w-5 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium">Líderes</p>
                  <p className="text-lg font-bold text-gray-900">{leaders}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Mail className="h-5 w-5 text-orange-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium">Invitaciones</p>
                  <p className="text-lg font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Members List */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Miembros</h2>
        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            Aún no hay miembros en el equipo
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {member.user?.name || member.user?.email || "Usuario"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span
                    className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                      member.role === "LIDER"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {member.role}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                    Desde{" "}
                    {member.joinedAt && !isNaN(new Date(member.joinedAt).getTime())
                      ? new Date(member.joinedAt).toLocaleDateString("es-ES", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

