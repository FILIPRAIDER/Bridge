"use client";

import { useState } from "react";
import { LayoutGrid, Plus, Users, FileText, MessageSquare, Clock, Pencil, Trash2, Sparkles } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";
import type { TeamArea } from "@/types/areas";
import { CreateAreaModal } from "./CreateAreaModal";
import { EditAreaModal } from "./EditAreaModal";
import { AssignMemberModal } from "./AssignMemberModal";
import { AreaCard } from "@/components/areas/AreaCard";
import { AIInsightsPanel } from "@/components/areas/AIInsightsPanel";
import { useToast } from "@/components/ui/toast";

interface ManageAreasProps {
  teamId: string;
}

export function ManageAreas({ teamId }: ManageAreasProps) {
  const { areas, stats, loading, createArea, updateArea, deleteArea, loadAreas } = useAreas(teamId);
  const { show } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArea, setEditingArea] = useState<TeamArea | null>(null);
  const [assigningArea, setAssigningArea] = useState<TeamArea | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const handleCreateArea = async (data: any) => {
    const newArea = await createArea(data);
    if (newArea) {
      setShowCreateModal(false);
      show({
        variant: "success",
        message: `Área "${newArea.name}" creada correctamente`
      });
    } else {
      show({
        variant: "error",
        message: "Error al crear el área. Por favor, intenta de nuevo."
      });
    }
  };

  const handleUpdateArea = async (areaId: string, data: any) => {
    const success = await updateArea(areaId, data);
    if (success) {
      setEditingArea(null);
      show({
        variant: "success",
        message: "Área actualizada correctamente"
      });
    } else {
      show({
        variant: "error",
        message: "Error al actualizar el área"
      });
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    if (confirm("¿Estás seguro de eliminar esta área? Se perderán todos los archivos y mensajes.")) {
      const success = await deleteArea(areaId);
      if (success) {
        show({
          variant: "success",
          message: "Área eliminada correctamente"
        });
      } else {
        show({
          variant: "error",
          message: "Error al eliminar el área"
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 shadow-md relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
              <LayoutGrid className="h-8 w-8" />
              Gestionar Áreas del Equipo
            </h1>
            <p className="mt-2 text-gray-300 text-sm sm:text-base">
              Organiza tu equipo en áreas especializadas para mejorar la colaboración
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIInsights(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all text-sm font-medium shadow-lg border border-purple-400/30 backdrop-blur-sm"
            >
              <Sparkles className="h-5 w-5" />
              Análisis IA
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all text-sm font-medium shadow-lg border border-gray-500/30 backdrop-blur-sm"
            >
              <Plus className="h-5 w-5" />
              Crear Nueva Área
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                <LayoutGrid className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Total de Áreas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAreas}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Miembros Asignados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Archivos Compartidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                <MessageSquare className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Mensajes Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Areas List */}
      {loading && areas.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="mt-2 text-gray-600">Cargando áreas...</p>
        </div>
      ) : areas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <LayoutGrid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay áreas creadas
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera área para comenzar a organizar tu equipo
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all text-sm font-medium shadow-md"
          >
            <Plus className="h-4 w-4" />
            Crear Primera Área
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {areas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              onEdit={() => setEditingArea(area)}
              onDelete={() => handleDeleteArea(area.id)}
              onAssignMember={() => setAssigningArea(area)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAreaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateArea}
      />

      {editingArea && (
        <EditAreaModal
          isOpen={true}
          area={editingArea}
          onClose={() => setEditingArea(null)}
          onUpdate={(data: any) => handleUpdateArea(editingArea.id, data)}
        />
      )}

      {assigningArea && (
        <AssignMemberModal
          isOpen={true}
          area={assigningArea}
          teamId={teamId}
          onClose={() => setAssigningArea(null)}
          onAssign={() => {
            setAssigningArea(null);
            loadAreas();
          }}
        />
      )}

      {/* AI Insights Panel */}
      <AIInsightsPanel
        teamId={teamId}
        isOpen={showAIInsights}
        onClose={() => setShowAIInsights(false)}
      />
    </div>
  );
}
