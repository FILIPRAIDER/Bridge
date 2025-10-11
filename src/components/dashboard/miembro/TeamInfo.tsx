"use client";

import { useState } from "react";
import { Users, Mail, Calendar, Settings } from "lucide-react";
import { TeamAvatarWithCamera } from "@/components/shared/TeamAvatarWithCamera";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { Team, TeamMember } from "@/types/api";

interface TeamInfoProps {
  team: Team | null;
  members: TeamMember[];
  userId: string;
  onRefresh?: () => void;
}

export function TeamInfo({ team, members, userId, onRefresh }: TeamInfoProps) {
  const { show } = useToast();
  const [uploading, setUploading] = useState(false);

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
  const isLeader = currentMember?.role === "LIDER";
  const leaders = members.filter((m) => m.role === "LIDER");
  const regularMembers = members.filter((m) => m.role === "MIEMBRO");

  const handleCameraClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleImageUpload(file);
      }
    };
    input.click();
  };

  const handleImageUpload = async (file: File) => {
    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      show({ message: "La imagen no debe superar 5MB", variant: "error" });
      return;
    }

    // Validar tipo
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      show({ message: "Solo se permiten imágenes JPG, PNG o WebP", variant: "error" });
      return;
    }

    try {
      setUploading(true);

      // Crear FormData
      const formData = new FormData();
      formData.append("image", file); // ⚠️ Campo 'image' según especificación del backend

      // Subir la imagen
      const response = await api.post(
        `/uploads/teams/${team.id}/profile-image`, // ✅ Ruta correcta del backend
        formData,
        {
          headers: {
            // Eliminar Content-Type para que el browser lo establezca automáticamente con el boundary
          },
        }
      );

      console.log('✅ Foto del equipo actualizada:', response);
      show({ message: "Foto del equipo actualizada", variant: "success" });
      
      // Refrescar datos si hay callback
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      show({
        message: error.message || "Error al subir la imagen",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Header Card with Photo */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden relative">
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Header Content */}
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Team Avatar */}
            <div className="flex-shrink-0">
              <TeamAvatarWithCamera
                avatarUrl={(team as any).profileImage}
                teamName={team.name}
                size="xl"
                showCamera={isLeader}
                editable={isLeader}
                onCameraClick={isLeader ? handleCameraClick : undefined}
                className="ring-4 ring-white/10 shadow-2xl"
              />
              {uploading && (
                <p className="text-xs text-gray-300 text-center mt-2">
                  Subiendo...
                </p>
              )}
            </div>

            {/* Team Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg mb-2">
                    {team.name}
                  </h1>
                  {team.description && (
                    <p className="text-gray-300 text-sm sm:text-base max-w-2xl">
                      {team.description}
                    </p>
                  )}
                </div>
                
                {currentMember && (
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <span className="text-xs text-gray-400">Tu rol</span>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg border ${
                        currentMember.role === "LIDER"
                          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500/30"
                          : "bg-gradient-to-r from-gray-700 to-gray-600 text-white border-gray-500/30"
                      }`}
                    >
                      {currentMember.role}
                    </span>
                  </div>
                )}
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
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Desde {new Date(team.createdAt).toLocaleDateString("es-ES", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Details - Chrome/Silver Effect */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-t border-gray-300/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Users className="h-5 w-5 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium">Líderes</p>
                  <p className="text-lg font-bold text-gray-900">{leaders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium">Miembros</p>
                  <p className="text-lg font-bold text-gray-900">{regularMembers.length}</p>
                </div>
              </div>
            </div>
          </div>
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

