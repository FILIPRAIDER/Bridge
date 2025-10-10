"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import {
  Loader2,
  Plus,
  Trash2,
  Award,
  ExternalLink,
  Upload,
  FileText,
  X,
} from "lucide-react";
import type { Certification, ImageKitAuthResponse } from "@/types/api";

const CertificationSchema = z.object({
  name: z.string().min(3, "Nombre muy corto"),
  issuer: z.string().min(2, "Emisor muy corto"),
  issueDate: z.string().min(1, "Fecha requerida"),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type CertificationFormData = z.infer<typeof CertificationSchema>;

interface CertificationsStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function CertificationsStep({ onNext, onSkip }: CertificationsStepProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useSession();
  const { show } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CertificationFormData>({
    resolver: zodResolver(CertificationSchema),
  });

  // Cargar certificaciones existentes
  useEffect(() => {
    const loadCertifications = async () => {
      if (!user?.id) return;

      try {
        const data = await api.get<Certification[]>(
          `/users/${user.id}/certifications`
        );
        setCertifications(data || []);
      } catch {
        // No hay certificaciones
      } finally {
        setInitialLoading(false);
      }
    };

    loadCertifications();
  }, [user?.id]);

  const uploadToImageKit = async (
    certId: string,
    file: File
  ): Promise<string> => {
    // 1. Obtener firma de ImageKit
    const authData = await api.post<ImageKitAuthResponse>(
      `/uploads/certifications/${certId}/url`
    );

    // 2. Subir archivo a ImageKit
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("folder", authData.folder);
    formData.append("token", authData.token);
    formData.append("expire", String(authData.expire));
    formData.append("signature", authData.signature);
    formData.append("publicKey", authData.publicKey);

    const uploadEndpoint =
      authData.uploadApiEndpoint || "https://upload.imagekit.io/api/v1/files/upload";

    const uploadRes = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error("Error al subir el archivo");
    }

    const uploadResult = await uploadRes.json();
    return uploadResult.url;
  };

  const onSubmit = async (data: CertificationFormData) => {
    if (!user?.id) return;

    setLoading(true);
    setUploading(!!selectedFile);

    try {
      let fileUrl: string | undefined;

      // Limpiar payload: convertir strings vacíos a undefined
      const cleanPayload: Record<string, any> = {};
      
      Object.entries(data).forEach(([key, value]) => {
        if (value === "" || value === null) {
          return; // Omitir campos vacíos
        }
        
        // Convertir fecha a ISO datetime
        if (key === "issueDate" && value) {
          cleanPayload[key] = new Date(value as string).toISOString();
        } else {
          cleanPayload[key] = value;
        }
      });

      if (editingId) {
        // Actualizar certificación existente
        const payload: any = { ...cleanPayload };

        // Si hay archivo nuevo, subirlo
        if (selectedFile) {
          fileUrl = await uploadToImageKit(editingId, selectedFile);
          payload.fileUrl = fileUrl;
          payload.fileName = selectedFile.name;
          payload.fileSize = selectedFile.size;
        }

        const updated = await api.patch<Certification>(
          `/users/${user.id}/certifications/${editingId}`,
          payload
        );
        setCertifications((prev) =>
          prev.map((cert) => (cert.id === editingId ? updated : cert))
        );
        show({
          variant: "success",
          title: "Certificación actualizada",
          message: "",
        });
      } else {
        // Crear nueva certificación (primero sin archivo)
        const newCert = await api.post<Certification>(
          `/users/${user.id}/certifications`,
          cleanPayload
        );

        // Si hay archivo, subirlo y actualizar
        if (selectedFile) {
          fileUrl = await uploadToImageKit(newCert.id, selectedFile);
          const updatedCert = await api.patch<Certification>(
            `/users/${user.id}/certifications/${newCert.id}`,
            {
              fileUrl,
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
            }
          );
          setCertifications((prev) => [...prev, updatedCert]);
        } else {
          setCertifications((prev) => [...prev, newCert]);
        }

        show({ variant: "success", title: "Certificación agregada", message: "" });
      }

      reset();
      setEditingId(null);
      setShowForm(false);
      setSelectedFile(null);
    } catch (e) {
      const error = e as Error;
      show({
        variant: "error",
        title: "Error",
        message: error.message || "Intenta de nuevo",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    reset({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate.split("T")[0],
      url: cert.url || "",
    });
    setShowForm(true);
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    if (!confirm("¿Eliminar esta certificación?")) return;

    try {
      await api.delete(`/users/${user.id}/certifications/${id}`);
      setCertifications((prev) => prev.filter((cert) => cert.id !== id));
      show({ variant: "success", title: "Certificación eliminada", message: "" });
    } catch (e) {
      const error = e as Error;
      show({
        variant: "error",
        title: "Error al eliminar",
        message: error.message,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      show({
        variant: "error",
        title: "Archivo muy grande",
        message: "El archivo no debe superar 5MB",
      });
      return;
    }

    // Validar tipo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      show({
        variant: "error",
        title: "Tipo de archivo no válido",
        message: "Solo se permiten PDF e imágenes",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleContinue = () => {
    if (certifications.length === 0) {
      show({
        variant: "error",
        title: "Agrega al menos una certificación",
        message: "O puedes omitir este paso si lo prefieres",
      });
      return;
    }
    onNext();
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Certificaciones</h1>
          <p className="text-gray-600">
            Muestra tus credenciales y cursos completados (opcional).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            reset();
            setSelectedFile(null);
          }}
          className="btn btn-outline flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {/* Lista de certificaciones */}
      {certifications.length > 0 && (
        <div className="space-y-3 mb-6">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="card p-4 hover:shadow-sm transition group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(cert.issueDate).toLocaleDateString("es", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Ver credencial <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        {cert.fileName || "Ver archivo"}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(cert)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cert.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 mb-6">
          <h3 className="font-semibold text-lg">
            {editingId ? "Editar certificación" : "Nueva certificación"}
          </h3>

          <div>
            <label className="label">Nombre de la certificación *</label>
            <input
              {...register("name")}
              className={`input ${errors.name ? "border-red-500" : ""}`}
              placeholder="ej. AWS Certified Developer"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Emisor *</label>
              <input
                {...register("issuer")}
                className={`input ${errors.issuer ? "border-red-500" : ""}`}
                placeholder="ej. Amazon Web Services"
              />
              {errors.issuer && (
                <p className="text-red-600 text-sm mt-1">{errors.issuer.message}</p>
              )}
            </div>

            <div>
              <label className="label">Fecha de emisión *</label>
              <input
                {...register("issueDate")}
                type="date"
                className={`input ${errors.issueDate ? "border-red-500" : ""}`}
              />
              {errors.issueDate && (
                <p className="text-red-600 text-sm mt-1">{errors.issueDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">URL de credencial (opcional)</label>
            <input
              {...register("url")}
              type="url"
              className={`input ${errors.url ? "border-red-500" : ""}`}
              placeholder="https://..."
            />
            {errors.url && (
              <p className="text-red-600 text-sm mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label className="label">Subir archivo (opcional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition">
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para subir o arrastra un archivo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF o imagen (máx. 5MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark flex-1 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Subiendo archivo...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : editingId ? (
                "Actualizar"
              ) : (
                "Agregar certificación"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                reset();
                setSelectedFile(null);
              }}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Botones de navegación */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={certifications.length === 0}
          className="btn btn-dark flex-1 disabled:opacity-60 order-1"
        >
          Continuar
        </button>
        <button 
          type="button" 
          onClick={onSkip} 
          className="btn btn-outline w-full sm:w-auto whitespace-nowrap order-2"
        >
          Completar más tarde
        </button>
      </div>
    </div>
  );
}
