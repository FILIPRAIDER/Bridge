"use client";

import { useState } from "react";
import { Save, Edit2, Check, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { Team } from "@/types/api";

interface TeamManagementProps {
  team: Team | null;
  onUpdate: () => void;
}

export function TeamManagement({ team, onUpdate }: TeamManagementProps) {
  const { show } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [teamName, setTeamName] = useState(team?.name || "");
  const [description, setDescription] = useState(team?.description || "");
  const [saving, setSaving] = useState(false);

  const handleEditName = () => {
    setTeamName(team?.name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!team?.id || !teamName.trim()) {
      show({ message: "El nombre no puede estar vacío", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/teams/${team.id}`, { name: teamName });
      show({ message: "Nombre actualizado correctamente", variant: "success" });
      setIsEditingName(false);
      onUpdate();
    } catch (error: any) {
      show({ message: error.message || "Error al guardar nombre", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditDescription = () => {
    setDescription(team?.description || "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (!team?.id) return;

    setSaving(true);
    try {
      await api.patch(`/teams/${team.id}`, { description });
      show({ message: "Descripción actualizada correctamente", variant: "success" });
      setIsEditingDescription(false);
      onUpdate();
    } catch (error: any) {
      show({ message: error.message || "Error al guardar descripción", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!team) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <p className="text-gray-500 text-center py-8">No hay equipo para gestionar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Gestión del Equipo
        </h2>

        <div className="space-y-6">
          {/* Nombre del Equipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Equipo
            </label>
            {isEditingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input w-full"
                  placeholder="Nombre del equipo"
                  disabled={saving}
                  maxLength={100}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={saving || !teamName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setTeamName(team?.name || "");
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{team.name}</p>
                </div>
                <button
                  onClick={handleEditName}
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Editar nombre"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Descripción del Equipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Equipo
            </label>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none w-full"
                  rows={5}
                  placeholder="Describe el propósito, objetivos y características del equipo..."
                  disabled={saving}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {description.length}/500 caracteres
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDescription}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setDescription(team?.description || "");
                      }}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {team.description ||
                      "Sin descripción. Agrega una descripción para que los miembros del equipo sepan más sobre el propósito y objetivos del equipo."}
                  </p>
                </div>
                <button
                  onClick={handleEditDescription}
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                  title="Editar descripción"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Información del Equipo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">ID del Equipo:</span>
                <p className="text-sm text-gray-900 font-mono mt-1">{team.id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Fecha de Creación:</span>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(team.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Consejos para una buena descripción
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Explica el propósito principal del equipo</li>
          <li>Menciona los objetivos o proyectos actuales</li>
          <li>Describe el tipo de miembros que buscas</li>
          <li>Incluye información sobre la metodología de trabajo</li>
        </ul>
      </div>
    </div>
  );
}
