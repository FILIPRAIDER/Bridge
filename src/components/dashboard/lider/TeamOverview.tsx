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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Team Avatar */}
            <div className="flex-shrink-0">
              <TeamAvatarWithCamera
                avatarUrl={(team as any)?.profileImage}
                teamName={team?.name || "Equipo"}
                size="xl"
                showCamera={false}
                editable={false}
                className="ring-4 ring-white/30"
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
                        className="bg-white/20 border-2 border-white/30 text-white placeholder-white/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 text-xl font-bold flex-1"
                        placeholder="Nombre del equipo"
                        disabled={saving}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving || !teamName.trim()}
                        className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        title="Guardar"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        disabled={saving}
                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {team?.name || "Sin nombre"}
                      </h1>
                      <button
                        onClick={handleEditName}
                        className="p-2 text-white/80 hover:bg-white/20 rounded-lg transition-colors"
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
                        className="bg-white/20 border-2 border-white/30 text-white placeholder-white/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm w-full resize-none"
                        rows={2}
                        placeholder="Descripción del equipo..."
                        disabled={saving}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveDescription}
                          disabled={saving}
                          className="px-4 py-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => setIsEditingDescription(false)}
                          disabled={saving}
                          className="px-4 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start justify-center sm:justify-start gap-2">
                      <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
                        {team?.description || "Sin descripción. Click en editar para agregar una."}
                      </p>
                      <button
                        onClick={handleEditDescription}
                        className="p-1.5 text-white/80 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-lg"
                  >
                    <Settings className="h-4 w-4" />
                    Configurar Equipo
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-white/90">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {members.length} {members.length === 1 ? "miembro" : "miembros"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">
                    {leaders} {leaders === 1 ? "líder" : "líderes"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
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

        {/* Quick Stats */}
        <div className="p-6 sm:p-8 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-gray-900" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-lg font-bold text-gray-900">{members.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Regulares</p>
                  <p className="text-lg font-bold text-gray-900">{regularMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Líderes</p>
                  <p className="text-lg font-bold text-gray-900">{leaders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Invitaciones</p>
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

