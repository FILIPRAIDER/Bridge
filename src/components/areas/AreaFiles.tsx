"use client";

import { useState, useRef } from "react";
import {
  Upload,
  File,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  Download,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { useAreaFiles } from "@/hooks/useAreaFiles";
import { formatDistanceToNow } from "@/utils/dates";
import { useToast } from "@/components/ui/toast";
import type { AreaFile } from "@/types/areas";

interface AreaFilesProps {
  teamId: string;
  areaId: string;
  userId: string;
}

export function AreaFiles({ teamId, areaId, userId }: AreaFilesProps) {
  const { show } = useToast();
  const {
    files,
    loading,
    uploading,
    uploadProgress,
    uploadFile,
    downloadFile,
    deleteFile,
  } = useAreaFiles(teamId, areaId);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith("video/")) return <FileVideo className="h-8 w-8 text-purple-500" />;
    if (mimeType.startsWith("audio/")) return <FileAudio className="h-8 w-8 text-green-500" />;
    if (mimeType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validar tamaño (25 MB máximo)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      show({
        variant: "error",
        title: "Archivo muy grande",
        message: "El archivo debe ser menor a 25 MB",
      });
      return;
    }

    const success = await uploadFile(file);
    if (success) {
      show({
        variant: "success",
        title: "Archivo subido",
        message: `${file.name} se compartió correctamente`,
      });
    } else {
      show({
        variant: "error",
        title: "Error",
        message: "No se pudo subir el archivo",
      });
    }
  };

  const handleDelete = async (file: AreaFile) => {
    if (!confirm(`¿Eliminar ${file.fileName}?`)) return;

    const success = await deleteFile(file.id);
    if (success) {
      show({
        variant: "success",
        message: "Archivo eliminado",
      });
    } else {
      show({
        variant: "error",
        message: "Error al eliminar archivo",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <File className="h-5 w-5" />
          Archivos Compartidos
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {files.length} {files.length === 1 ? "archivo" : "archivos"}
        </p>
      </div>

      {/* Upload Area */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
              <p className="text-sm text-gray-600">Subiendo... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click o arrastra para subir
                </p>
                <p className="text-xs text-gray-500 mt-1">Máximo 25 MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <File className="h-12 w-12 mb-2" />
            <p className="text-sm">No hay archivos compartidos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {files.map((file) => (
              <div
                key={file.id}
                className="group p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(file.mimeType)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatFileSize(file.size)} •{" "}
                      {file.uploadedBy?.name || file.uploadedBy?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(file.uploadedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => downloadFile(file.id, file.fileName)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Descargar"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                    {file.uploadedById === userId && (
                      <button
                        onClick={() => handleDelete(file)}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
