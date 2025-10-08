"use client";

import { useState, useEffect } from "react";
import { Award, Plus, Trash2, Loader2, Upload, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { Certification, ImageKitAuthResponse } from "@/types/api";

const certSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  issuer: z.string().min(1, "El emisor es requerido"),
  issueDate: z.string().min(1, "La fecha es requerida"),
  url: z.string().optional(),
});

type CertForm = z.infer<typeof certSchema>;

import { useSession as useNextAuthSession } from "next-auth/react";

export function CertificationsManager() {
  const { data: session } = useNextAuthSession();
  const userId = session?.user?.id;
  const { show } = useToast();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CertForm>({
    resolver: zodResolver(certSchema),
  });

  useEffect(() => {
    loadCertifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await api.get<Certification[]>(
        `/users/${userId}/certifications`
      );
      setCerts(data);
    } catch (error) {
      console.error("Error loading certifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CertForm) => {
    try {
      const newCert = await api.post<Certification>(
        `/users/${userId}/certifications`,
        data
      );
      
      // Upload file if selected
      if (selectedFile && newCert.id) {
        await uploadFile(newCert.id, selectedFile);
      }
      
      show({ message: "Certificación agregada", variant: "success" });
      reset();
      setSelectedFile(null);
      setShowForm(false);
      loadCertifications();
    } catch (error: any) {
      show({ message: error.message || "Error al guardar", variant: "error" });
    }
  };

  const uploadFile = async (certId: string, file: File) => {
    try {
      setUploading(true);
      // Get ImageKit signature
      const authData = await api.post<ImageKitAuthResponse>(
        `/uploads/certifications/${certId}/url`
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", authData.publicKey);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire.toString());
      formData.append("token", authData.token);
      formData.append("folder", authData.folder);
      formData.append("fileName", file.name);

      const response = await fetch(
        authData.uploadApiEndpoint || "https://upload.imagekit.io/api/v1/files/upload",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Upload failed");

      const uploadResult = await response.json();

      // Update certification with file info
      await api.patch(`/users/${userId}/certifications/${certId}`, {
        fileUrl: uploadResult.url,
        fileName: uploadResult.name,
        fileSize: uploadResult.size,
      });
    } catch (error: any) {
      show({ message: error.message || "Error al subir archivo", variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta certificación?")) return;
    try {
      await api.delete(`/users/${userId}/certifications/${id}`);
      show({ message: "Certificación eliminada", variant: "success" });
      loadCertifications();
    } catch (error: any) {
      show({ message: error.message || "Error al eliminar", variant: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Certificaciones
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-6 p-4 border border-gray-300 bg-gray-100 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input {...register("name")} className="input" />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="label">Emisor</label>
                <input {...register("issuer")} className="input" />
                {errors.issuer && (
                  <p className="text-sm text-red-600">{errors.issuer.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha de Emisión</label>
                <input {...register("issueDate")} type="date" className="input" />
                {errors.issueDate && (
                  <p className="text-sm text-red-600">
                    {errors.issueDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">URL (opcional)</label>
                <input {...register("url")} className="input" />
              </div>
            </div>

            <div>
              <label className="label">Archivo (opcional - PDF o imagen, máx 5MB)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="input"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="btn-dark inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Subiendo..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setSelectedFile(null);
                  setShowForm(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {certs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay certificaciones registradas
          </p>
        ) : (
          <div className="space-y-3">
            {certs.map((cert) => (
              <div
                key={cert.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3">
                  <Award className="h-5 w-5 text-gray-900 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(cert.issueDate).toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-900 hover:underline"
                        >
                          Ver credencial →
                        </a>
                      )}
                      {cert.fileUrl && (
                        <a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-900 hover:underline inline-flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Ver archivo →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

