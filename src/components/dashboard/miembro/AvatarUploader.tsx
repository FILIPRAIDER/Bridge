"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (newAvatarUrl: string) => void;
}

export function AvatarUploader({
  currentAvatarUrl,
  onUploadSuccess,
}: AvatarUploaderProps) {
  const { data: session, update } = useSession();
  const { show } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar avatar existente desde la sesión
  useEffect(() => {
    if (session?.user?.avatarUrl) {
      setAvatarUrl(session.user.avatarUrl);
    }
  }, [session?.user?.avatarUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      show({
        message: "Por favor selecciona un archivo de imagen válido",
        variant: "error",
      });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      show({
        message: "La imagen no debe superar 5MB",
        variant: "error",
      });
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user?.id) return;

    setIsUploading(true);
    try {
      // Subir archivo directamente al backend
      // El backend se encarga de subirlo a ImageKit
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", `avatar_${session.user.id}_${Date.now()}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/users/${session.user.id}/avatar`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al subir la imagen");
      }

      const { url: imageUrl } = await response.json();

      // Actualizar estado local
      setAvatarUrl(imageUrl);

      // Actualizar sesión local
      await update({
        ...session,
        user: {
          ...session.user,
          avatarUrl: imageUrl,
        },
      });

      // Callback de éxito
      if (onUploadSuccess) {
        onUploadSuccess(imageUrl);
      }

      // Limpiar estado
      setPreviewUrl(null);
      setSelectedFile(null);
      
      // Mostrar toast de éxito
      show({
        title: "¡Listo!",
        message: "Foto de perfil actualizada exitosamente",
        variant: "success",
      });
    } catch (error: any) {
      console.error("❌ Error uploading avatar:", error);
      show({
        title: "Error",
        message: error.message || "Error al subir la foto de perfil",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayUrl = previewUrl || avatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-4 ring-gray-300">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-12 w-12 text-gray-400" />
          )}
        </div>

        {/* Change Photo Button */}
        {!previewUrl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 h-10 w-10 bg-gray-900 rounded-full flex items-center justify-center ring-2 ring-white hover:bg-gray-800 transition-colors"
            disabled={isUploading}
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Actions when file selected */}
      {previewUrl && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir Foto
              </>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Upload Instructions */}
      {!previewUrl && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Haz clic en el ícono de la cámara para subir una foto de perfil. Máx
          5MB.
        </p>
      )}
    </div>
  );
}

