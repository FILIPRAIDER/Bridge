"use client";

import { useState } from "react";
import { Users, TrendingUp, Mail, Award, Edit2, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { Team, TeamMember } from "@/types/api";

interface TeamOverviewProps {
  team: Team | null;
  members: TeamMember[];
  onRefresh: () => void;
}

export function TeamOverview({ team, members, onRefresh }: TeamOverviewProps) {
  const { show } = useToast();
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Miembros</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {members.length}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Miembros Regulares</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {regularMembers}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Líderes</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{leaders}</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Invitaciones</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Información del Equipo
        </h2>
        <div className="space-y-4">
          {/* Nombre editable */}
          <div>
            <span className="text-xs sm:text-sm text-gray-600 block mb-2">Nombre:</span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input flex-1 text-sm sm:text-base"
                  placeholder="Nombre del equipo"
                  disabled={saving}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !teamName.trim()}
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex-shrink-0"
                  title="Guardar"
                >
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  disabled={saving}
                  className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex-shrink-0"
                  title="Cancelar"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-medium flex-1 text-sm sm:text-base break-words">
                  {team?.name || "Sin nombre"}
                </span>
                <button
                  onClick={handleEditName}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="Editar nombre"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Descripción editable */}
          <div>
            <span className="text-xs sm:text-sm text-gray-600 block mb-2">Descripción:</span>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none w-full text-sm sm:text-base"
                  rows={3}
                  placeholder="Descripción del equipo..."
                  disabled={saving}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleSaveDescription}
                    disabled={saving}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setIsEditingDescription(false)}
                    disabled={saving}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-gray-900 flex-1 text-sm sm:text-base break-words">
                  {team?.description || "Sin descripción. Click en editar para agregar una."}
                </p>
                <button
                  onClick={handleEditDescription}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="Editar descripción"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs sm:text-sm text-gray-600">Creado:</span>
            <span className="ml-2 text-gray-900 text-sm sm:text-base">
              {team?.createdAt
                ? new Date(team.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
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

