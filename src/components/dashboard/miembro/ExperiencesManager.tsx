"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { Experience } from "@/types/api";

const experienceSchema = z.object({
  role: z.string().min(1, "El rol es requerido"),
  company: z.string().min(1, "La empresa es requerida"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

type ExperienceForm = z.infer<typeof experienceSchema>;

import { useSession as useNextAuthSession } from "next-auth/react";

export function ExperiencesManager() {
  const { data: session } = useNextAuthSession();
  const userId = session?.user?.id;
  const { show } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
  });

  useEffect(() => {
    loadExperiences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await api.get<Experience[]>(`/users/${userId}/experiences`);
      setExperiences(data);
    } catch (error) {
      console.error("Error loading experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ExperienceForm) => {
    try {
      if (editingId) {
        await api.patch(`/users/${userId}/experiences/${editingId}`, data);
        show({ message: "Experiencia actualizada", variant: "success" });
      } else {
        await api.post(`/users/${userId}/experiences`, data);
        show({ message: "Experiencia agregada", variant: "success" });
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      loadExperiences();
    } catch (error: any) {
      show({ message: error.message || "Error al guardar experiencia", variant: "error" });
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    reset({
      role: exp.role,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate || "",
      description: exp.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta experiencia?")) return;
    try {
      await api.delete(`/users/${userId}/experiences/${id}`);
      show({ message: "Experiencia eliminada", variant: "success" });
      loadExperiences();
    } catch (error: any) {
      show({ message: error.message || "Error al eliminar", variant: "error" });
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
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
            Experiencia Laboral
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

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-6 p-4 border border-gray-300 bg-gray-100 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Cargo</label>
                <input {...register("role")} className="input" />
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
              <div>
                <label className="label">Empresa</label>
                <input {...register("company")} className="input" />
                {errors.company && (
                  <p className="text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha de Inicio</label>
                <input {...register("startDate")} type="date" className="input" />
                {errors.startDate && (
                  <p className="text-sm text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Fecha de Fin (opcional)</label>
                <input {...register("endDate")} type="date" className="input" />
              </div>
            </div>

            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea {...register("description")} rows={3} className="input" />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-dark inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {editingId ? "Actualizar" : "Guardar"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {experiences.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay experiencias registradas
          </p>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3">
                  <Briefcase className="h-5 w-5 text-gray-900 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{exp.role}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(exp.startDate).toLocaleDateString("es-ES", {
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString("es-ES", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Presente"}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

