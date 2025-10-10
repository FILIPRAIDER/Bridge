"use client";

import { Camera, User } from "lucide-react";

interface AvatarWithCameraProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  onCameraClick: () => void;
  showCamera?: boolean;
  className?: string;
}

export function AvatarWithCamera({
  avatarUrl,
  name,
  size = "lg",
  onCameraClick,
  showCamera = true,
  className = "",
}: AvatarWithCameraProps) {
  const sizes = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40",
  };

  const cameraSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const cameraIconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizes[size]} rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-4 ring-gray-300`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || "Usuario"}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-gray-400`} />
        )}
      </div>

      {showCamera && (
        <button
          onClick={onCameraClick}
          className={`absolute bottom-0 right-0 ${cameraSizes[size]} bg-gray-900 rounded-full flex items-center justify-center ring-2 ring-white hover:bg-gray-800 transition-colors`}
          title="Cambiar foto de perfil"
        >
          <Camera className={`${cameraIconSizes[size]} text-white`} />
        </button>
      )}
    </div>
  );
}
