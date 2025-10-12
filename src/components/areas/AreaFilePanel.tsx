"use client";

import { useState, useRef } from "react";
import { useAreaFiles } from "@/hooks/useAreaFiles";
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Loader2,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  AlertCircle,
} from "lucide-react";

interface AreaFilePanelProps {
  teamId: string;
  areaId: string;
  currentUserId: string;
  isLeader?: boolean;
}

export default function AreaFilePanel({
  teamId,
  areaId,
  currentUserId,
  isLeader = false,
}: AreaFilePanelProps) {
  const {
    files,
    loading,
    error,
    uploadFile,
    downloadFile,
    deleteFile,
    uploadProgress,
  } = useAreaFiles(teamId, areaId);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejo de drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await uploadFile(droppedFiles[0], (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await uploadFile(selectedFiles[0], (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    downloadFile(fileId, fileName);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (confirm(`¿Eliminar el archivo "${fileName}"?`)) {
      await deleteFile(fileId);
    }
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (
      fileType.includes("spreadsheet") ||
      fileType.includes("excel") ||
      fileType.includes("csv")
    ) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    }
    if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "ahora";
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          📁 Archivos Compartidos
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {files.length} {files.length === 1 ? "archivo" : "archivos"}
        </p>
      </div>

      {/* Upload Zone */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-4 cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload
              className={`h-6 w-6 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
            />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isDragging ? (
                  <span className="font-semibold text-blue-600">
                    Suelta el archivo aquí
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-gray-700">
                      Arrastra archivos
                    </span>
                    <span className="text-gray-500"> o haz clic para subir</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Subiendo archivo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message (403) */}
      {error && error.includes("No perteneces") && (
        <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-900">
                Acceso temporal restringido
              </p>
              <p className="text-xs text-amber-700 mt-1">
                El backend está siendo actualizado para permitir acceso a líderes. 
                Esta funcionalidad estará disponible pronto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other Errors */}
      {error && !error.includes("No perteneces") && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && files.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Cargando archivos...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && !error && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              No hay archivos compartidos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sube el primer archivo para comenzar
            </p>
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {files.map((file) => {
            const canDelete = isLeader || file.uploadedBy === currentUserId;

            return (
              <div
                key={file.id}
                className="group bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(file.fileType)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>
                        {formatRelativeTime(file.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      por {file.uploader?.name || "Usuario"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(file.id, file.fileName)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    {/* Delete Button */}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(file.id, file.fileName)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
