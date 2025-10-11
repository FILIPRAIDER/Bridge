"use client";

import { Camera, Users } from "lucide-react";

interface TeamAvatarWithCameraProps {
  avatarUrl?: string | null;
  teamName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  onCameraClick?: () => void;
  showCamera?: boolean;
  className?: string;
  editable?: boolean; // Para mostrar en modo solo lectura o editable
}

/**
 * TeamAvatarWithCamera
 * 
 * Componente para mostrar y editar el avatar de un equipo.
 * Similar a AvatarWithCamera pero diseñado específicamente para equipos.
 * 
 * @param avatarUrl - URL de la imagen del equipo
 * @param teamName - Nombre del equipo (para alt text)
 * @param size - Tamaño del avatar (sm, md, lg, xl)
 * @param onCameraClick - Callback cuando se hace click en el botón de cámara
 * @param showCamera - Mostrar el botón de cámara
 * @param editable - Si el avatar es editable o solo lectura
 * @param className - Clases CSS adicionales
 */
export function TeamAvatarWithCamera({
  avatarUrl,
  teamName,
  size = "lg",
  onCameraClick,
  showCamera = true,
  editable = true,
  className = "",
}: TeamAvatarWithCameraProps) {
  const sizes = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };

  const cameraSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
    xl: "h-11 w-11",
  };

  const cameraIconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
    xl: "h-5 w-5",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-10 w-10",
    xl: "h-14 w-14",
  };

  return (
    <div className="relative inline-block">
      {/* Avatar Container */}
      <div 
        className={`
          ${sizes[size]} 
          rounded-full 
          bg-gradient-to-br from-gray-200 to-gray-300 
          flex items-center justify-center 
          overflow-hidden
          ${className}
          ${editable ? 'cursor-pointer hover:brightness-95 transition-all' : ''}
        `}
        onClick={editable && showCamera ? onCameraClick : undefined}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={teamName || "Equipo"}
            className="h-full w-full object-cover"
          />
        ) : (
          <Users className={`${iconSizes[size]} text-gray-500`} />
        )}
      </div>

      {/* Camera Button - Gray/Black/Chrome Style */}
      {showCamera && editable && onCameraClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCameraClick();
          }}
          className={`
            absolute bottom-0 right-0 
            ${cameraSizes[size]} 
            bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900
            rounded-full 
            flex items-center justify-center 
            ring-2 ring-white/10
            hover:from-gray-600 hover:via-gray-700 hover:to-gray-800
            hover:ring-white/20
            transition-all
            shadow-xl
            border border-gray-600/30
          `}
          title="Cambiar foto del equipo"
          aria-label="Cambiar foto del equipo"
        >
          <Camera className={`${cameraIconSizes[size]} text-white drop-shadow-lg`} />
        </button>
      )}

      {/* Badge de verificación (opcional) */}
      {/* Puedes agregarlo después si el equipo está verificado */}
    </div>
  );
}
