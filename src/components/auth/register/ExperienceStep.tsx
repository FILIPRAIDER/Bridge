"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loader2, Plus, Trash2, Briefcase, Calendar } from "lucide-react";
import type { Experience } from "@/types/api";

const ExperienceSchema = z.object({
  role: z.string().min(2, "Rol muy corto"),
  company: z.string().min(2, "Empresa muy corta"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().optional(),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type ExperienceFormData = z.infer<typeof ExperienceSchema>;

interface ExperienceStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function ExperienceStep({ onNext, onSkip }: ExperienceStepProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useSession();
  const { show } = useToast();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(ExperienceSchema),
  });

  // Cargar experiencias existentes
  useEffect(() => {
    const loadExperiences = async () => {
      if (!user?.id) return;

      try {
        const data = await api.get<Experience[]>(`/users/${user.id}/experiences`);
        setExperiences(data || []);
      } catch {
        // No hay experiencias, continuar
      } finally {
        setInitialLoading(false);
      }
    };

    loadExperiences();
  }, [user?.id]);

  const onSubmit = async (data: ExperienceFormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Limpiar payload: convertir strings vacíos a undefined
      const cleanPayload: Record<string, any> = {};
      
      Object.entries(data).forEach(([key, value]) => {
        if (value === "" || value === null) {
          return; // Omitir campos vacíos
        }
        
        // Convertir fechas YYYY-MM-DD a ISO datetime
        if ((key === "startDate" || key === "endDate") && value) {
          cleanPayload[key] = new Date(value as string).toISOString();
        } else {
          cleanPayload[key] = value;
        }
      });

      if (editingId) {
        // Actualizar
        const updated = await api.patch<Experience>(
          `/users/${user.id}/experiences/${editingId}`,
          cleanPayload
        );
        setExperiences((prev) =>
          prev.map((exp) => (exp.id === editingId ? updated : exp))
        );
        show({ variant: "success", title: "Experiencia actualizada", message: "" });
      } else {
        // Crear nueva
        const newExp = await api.post<Experience>(
          `/users/${user.id}/experiences`,
          cleanPayload
        );
        setExperiences((prev) => [...prev, newExp]);
        show({ variant: "success", title: "Experiencia agregada", message: "" });
      }

      reset();
      setEditingId(null);
      setShowForm(false);
    } catch (e) {
      const error = e as Error;
      show({
        variant: "error",
        title: "Error",
        message: error.message || "Intenta de nuevo",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    reset({
      role: exp.role,
      company: exp.company,
      startDate: exp.startDate.split("T")[0],
      endDate: exp.endDate ? exp.endDate.split("T")[0] : "",
      description: exp.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, role: string, company: string) => {
    if (!user?.id) return;

    await showConfirm({
      title: "¿Eliminar esta experiencia?",
      message: `Estás a punto de eliminar "${role} en ${company}". Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/users/${user.id}/experiences/${id}`);
          setExperiences((prev) => prev.filter((exp) => exp.id !== id));
          show({ variant: "success", title: "Experiencia eliminada", message: "" });
        } catch (e) {
          const error = e as Error;
          show({
            variant: "error",
            title: "Error al eliminar",
            message: error.message,
          });
        }
      },
    });
  };

  const handleContinue = () => {
    if (experiences.length === 0) {
      show({
        variant: "error",
        title: "Agrega al menos una experiencia",
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
      <ConfirmDialogComponent />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Tu experiencia</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Comparte tu trayectoria profesional (opcional pero recomendado).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            reset();
          }}
          className="btn btn-outline flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {/* Lista de experiencias */}
      {experiences.length > 0 && (
        <div className="space-y-3 mb-6">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="card p-3 sm:p-4 hover:shadow-sm transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="hidden sm:block p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{exp.role}</h3>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>
                      {new Date(exp.startDate).toLocaleDateString("es", {
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString("es", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Presente"}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(exp)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm text-blue-600 hover:underline px-2 py-1"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp.id, exp.role, exp.company)}
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
        <form onSubmit={handleSubmit(onSubmit)} className="card p-4 sm:p-6 space-y-4 mb-6">
          <h3 className="font-semibold text-base sm:text-lg">
            {editingId ? "Editar experiencia" : "Nueva experiencia"}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Cargo / Rol *</label>
              <input
                {...register("role")}
                className={`input ${errors.role ? "border-red-500" : ""}`}
                placeholder="ej. Desarrollador Frontend"
              />
              {errors.role && (
                <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="label">Empresa *</label>
              <input
                {...register("company")}
                className={`input ${errors.company ? "border-red-500" : ""}`}
                placeholder="ej. Tech Corp"
              />
              {errors.company && (
                <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de inicio *</label>
              <input
                {...register("startDate")}
                type="date"
                className={`input ${errors.startDate ? "border-red-500" : ""}`}
              />
              {errors.startDate && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="label">Fecha de fin (opcional)</label>
              <input
                {...register("endDate")}
                type="date"
                className="input"
                placeholder="Dejar vacío si es actual"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deja vacío si trabajas aquí actualmente
              </p>
            </div>
          </div>

          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              {...register("description")}
              className={`input min-h-[80px] resize-y ${
                errors.description ? "border-red-500" : ""
              }`}
              placeholder="Describe tus responsabilidades y logros..."
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark flex-1 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : editingId ? (
                "Actualizar"
              ) : (
                "Agregar experiencia"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                reset();
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
          disabled={experiences.length === 0}
          className="btn btn-dark flex-1 disabled:opacity-60"
        >
          Continuar
        </button>
        <button type="button" onClick={onSkip} className="btn btn-outline w-full sm:w-auto">
          Completar más tarde
        </button>
      </div>
    </div>
  );
}
