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
  
  const activeMembers = members.filter((m) => m.role === "MIEMBRO").length;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Miembros</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {members.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-900" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Miembros Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {activeMembers}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Líderes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{leaders}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Invitaciones</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Información del Equipo
        </h2>
        <div className="space-y-4">
          {/* Nombre editable */}
          <div>
            <span className="text-sm text-gray-600 block mb-2">Nombre:</span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input flex-1"
                  placeholder="Nombre del equipo"
                  disabled={saving}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !teamName.trim()}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  title="Guardar"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  disabled={saving}
                  className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  title="Cancelar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-medium flex-1">
                  {team?.name || "Sin nombre"}
                </span>
                <button
                  onClick={handleEditName}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Editar nombre"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Descripción editable */}
          <div>
            <span className="text-sm text-gray-600 block mb-2">Descripción:</span>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none w-full"
                  rows={3}
                  placeholder="Descripción del equipo..."
                  disabled={saving}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDescription}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setIsEditingDescription(false)}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-gray-900 flex-1">
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
            <span className="text-sm text-gray-600">Creado:</span>
            <span className="ml-2 text-gray-900">
              {team?.createdAt
                ? new Date(team.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Miembros</h2>
        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aún no hay miembros en el equipo
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user?.name || member.user?.email || "Usuario"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.role === "LIDER"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {member.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    Desde{" "}
                    {new Date(member.joinedAt).toLocaleDateString("es-ES", {
                      month: "short",
                      year: "numeric",
                    })}
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

