"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (newAvatarUrl: string) => void;
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onUploadSuccess,
}: AvatarUploadModalProps) {
  const { data: session, update } = useSession();
  const { show } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      setSelectedFile(null);
      setIsDragging(false);
    }
  }, [isOpen]);

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

      // Mostrar toast de éxito
      show({
        title: "¡Listo!",
        message: "Foto de perfil actualizada exitosamente",
        variant: "success",
      });

      // Cerrar modal
      onClose();
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Cambiar Foto de Perfil
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Preview or Current Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-4 ring-gray-300">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : currentAvatarUrl ? (
                    <img
                      src={currentAvatarUrl}
                      alt="Avatar actual"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                isDragging
                  ? "border-gray-900 bg-gray-50 scale-[1.02]"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div
                  className={`p-4 rounded-full mb-4 transition-colors ${
                    isDragging ? "bg-gray-900" : "bg-gray-100"
                  }`}
                >
                  <ImageIcon
                    className={`h-10 w-10 ${
                      isDragging ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">
                  {isDragging
                    ? "¡Suelta la imagen aquí!"
                    : "Arrastra una imagen o haz clic"}
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF hasta 5MB
                </p>
              </div>
            </div>

            {/* File info */}
            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Archivo seleccionado:</span>{" "}
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={previewUrl ? handleUpload : handleCancel}
              disabled={!selectedFile || isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  {currentAvatarUrl ? "Actualizar Foto" : "Subir Foto"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
