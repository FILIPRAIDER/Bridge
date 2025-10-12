"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import type { AreaFile, AreaFilesResponse } from "@/types/areas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

export function useAreaFiles(teamId: string | null, areaId: string | null) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<AreaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cargar archivos
  const loadFiles = async () => {
    if (!teamId || !areaId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.get<AreaFilesResponse>(
        `/teams/${teamId}/areas/${areaId}/files`
      );
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar archivos");
      console.error("[useAreaFiles] Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  // Subir archivo
  const uploadFile = async (file: File, onProgress?: (progress: number) => void): Promise<boolean> => {
    if (!teamId || !areaId || !session) return false;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Obtener token de sesión
      const token = (session as any)?.accessToken;
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      // Crear XMLHttpRequest para poder trackear progreso
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
            onProgress?.(progress);
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const newFile = JSON.parse(xhr.responseText) as AreaFile;
            setFiles((prev) => [newFile, ...prev]);
            setUploading(false);
            setUploadProgress(0);
            resolve(true);
          } else {
            const errorText = xhr.responseText || "Error al subir archivo";
            console.error("[useAreaFiles] Upload failed:", xhr.status, errorText);
            setError("Error al subir archivo");
            setUploading(false);
            setUploadProgress(0);
            reject(new Error("Error al subir archivo"));
          }
        });

        xhr.addEventListener("error", () => {
          console.error("[useAreaFiles] Network error during upload");
          setError("Error de red al subir archivo");
          setUploading(false);
          setUploadProgress(0);
          reject(new Error("Error de red"));
        });

        xhr.open("POST", `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/files`);
        
        // ✅ Agregar JWT token desde sesión
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.send(formData);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
      setUploading(false);
      setUploadProgress(0);
      console.error("[useAreaFiles] Error uploading file:", err);
      return false;
    }
  };

  // Descargar archivo
  const downloadFile = async (fileId: string, fileName: string) => {
    if (!teamId || !areaId || !session) return;

    try {
      const token = (session as any)?.accessToken;
      if (!token) {
        console.error("[useAreaFiles] No token found for download");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/files/${fileId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al descargar archivo");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar archivo");
      console.error("[useAreaFiles] Error downloading file:", err);
    }
  };

  // Eliminar archivo
  const deleteFile = async (fileId: string): Promise<boolean> => {
    if (!teamId || !areaId) return false;

    try {
      await api.delete(`/teams/${teamId}/areas/${areaId}/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar archivo");
      console.error("[useAreaFiles] Error deleting file:", err);
      return false;
    }
  };

  useEffect(() => {
    if (teamId && areaId) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, areaId]);

  return {
    files,
    loading,
    error,
    uploading,
    uploadProgress,
    loadFiles,
    uploadFile,
    downloadFile,
    deleteFile,
  };
}
