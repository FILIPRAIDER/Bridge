"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Cargar avatar existente desde la sesión
  useEffect(() => {
    if (session?.user?.avatarUrl) {
      setAvatarUrl(session.user.avatarUrl);
    }
  }, [session?.user?.avatarUrl]);

  const validateAndProcessFile = (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      show({
        message: "Por favor selecciona un archivo de imagen válido",
        variant: "error",
      });
      return false;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      show({
        message: "La imagen no debe superar 5MB",
        variant: "error",
      });
      return false;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndProcessFile(file);
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
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
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Avatar Preview */}
      <div className="relative flex-shrink-0">
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

      {/* Drag & Drop Zone */}
      <div className="flex-1 w-full">
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
            isDragging
              ? "border-gray-900 bg-gray-50 scale-105"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          } ${previewUrl ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`p-3 rounded-full mb-3 transition-colors ${
              isDragging ? "bg-gray-900" : "bg-gray-100"
            }`}>
              <ImageIcon className={`h-8 w-8 ${
                isDragging ? "text-white" : "text-gray-400"
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {isDragging ? "¡Suelta la imagen aquí!" : "Arrastra una imagen o haz clic"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF hasta 5MB
            </p>
          </div>
        </div>

        {/* Actions when file selected */}
        {previewUrl && (
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  {avatarUrl ? "Reemplazar Foto" : "Subir Foto"}
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Cancelar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

