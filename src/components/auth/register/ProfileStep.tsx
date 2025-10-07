"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parsePhoneNumber } from "libphonenumber-js";
import { api } from "@/lib/api";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { PhoneInput } from "./PhoneInput";
import { Loader2 } from "lucide-react";
import type { MemberProfile } from "@/types/api";

const ProfileSchema = z.object({
  headline: z.string().min(2, "Muy corto").max(120, "Máximo 120 caracteres"),
  bio: z.string().min(20, "Cuéntanos más (mínimo 20 caracteres)").max(2000, "Máximo 2000 caracteres"),
  seniority: z.string().min(2, "Selecciona tu nivel").max(40),
  location: z.string().min(2, "¿Dónde estás ubicado?").max(120),
  availability: z.number().int().min(1).max(60).optional(), // Días disponibles
  stack: z.string().max(200).optional(),
  sector: z.string().max(120).optional(),
  phone: z.string().min(7, "Número de teléfono inválido").max(30),
  phoneE164: z.string().optional(),
  phoneCountry: z.string().length(2).optional(),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

interface ProfileStepProps {
  onNext: () => void;
  onSkip?: () => void;
}

const SENIORITY_OPTIONS = [
  { value: "Junior", label: "Junior (0-2 años)" },
  { value: "Mid-level", label: "Mid-level (2-5 años)" },
  { value: "Senior", label: "Senior (5+ años)" },
  { value: "Lead", label: "Lead/Arquitecto" },
];

export function ProfileStep({ onNext, onSkip }: ProfileStepProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useSession();
  const { show } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
  });

  const phone = watch("phone");

  // Cargar perfil existente si hay
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setInitialLoading(false);
        return;
      }
      
      try {
        const userData = await api.get<any>(`/users/${user.id}`);
        const profile = userData?.profile;
        
        if (profile) {
          setValue("headline", profile.headline || "");
          setValue("bio", profile.bio || "");
          setValue("seniority", profile.seniority || "");
          setValue("location", profile.location || "");
          if (profile.availability) setValue("availability", profile.availability);
          setValue("stack", profile.stack || "");
          setValue("sector", profile.sector || "");
          setValue("phone", profile.phone || "");
          if (profile.phoneE164) setValue("phoneE164", profile.phoneE164);
          if (profile.phoneCountry) setValue("phoneCountry", profile.phoneCountry);
        }
      } catch (error) {
        // No existe perfil o usuario recién creado, continuar con formulario vacío
        console.log("No se pudo cargar el perfil (probablemente usuario nuevo):", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) {
      show({
        variant: "error",
        title: "Error",
        message: "No se encontró el usuario. Intenta de nuevo.",
      });
      return;
    }

    setLoading(true);
    try {
      // Limpiar payload: convertir strings vacíos a undefined
      const cleanPayload: Record<string, any> = {};
      
      Object.entries(data).forEach(([key, value]) => {
        // Si es string vacío, no incluirlo (será undefined)
        if (value === "" || value === null) {
          return;
        }
        cleanPayload[key] = value;
      });

      // Procesar teléfono para extraer E164 y país
      if (cleanPayload.phone) {
        try {
          const parsed = parsePhoneNumber(cleanPayload.phone as string);
          if (parsed) {
            cleanPayload.phoneE164 = parsed.number; // +573001234567
            cleanPayload.phoneCountry = parsed.country || undefined; // CO
          }
        } catch {
          // Si falla el parseo, enviar solo el phone
          console.warn("No se pudo parsear el teléfono:", cleanPayload.phone);
        }
      }

      // El backend usa upsert en POST, así que solo POST es suficiente
      console.log("Enviando payload al backend:", cleanPayload);
      await api.post(`/users/${user.id}/profile`, cleanPayload);

      show({
        variant: "success",
        title: "Perfil guardado",
        message: "¡Sigamos con tu experiencia!",
      });

      onNext();
    } catch (e) {
      console.error("Error completo al guardar perfil:", e);
      const error = e as any;
      const message = error?.message || error?.error || "Intenta de nuevo";
      show({
        variant: "error",
        title: "Error al guardar el perfil",
        message: message,
      });
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-2xl font-bold mb-1">Completa tu perfil</h1>
      <p className="text-gray-600 mb-6">
        Ayúdanos a conocerte mejor para conectarte con los proyectos ideales.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label className="label">Título profesional *</label>
          <input
            {...register("headline")}
            className={`input ${errors.headline ? "border-red-500" : ""}`}
            placeholder="ej. Desarrollador Full Stack | Diseñador UX/UI"
            maxLength={100}
          />
          {errors.headline && (
            <p className="text-red-600 text-sm mt-1">{errors.headline.message}</p>
          )}
        </div>

        <div>
          <label className="label">Biografía *</label>
          <textarea
            {...register("bio")}
            className={`input min-h-[100px] resize-y ${errors.bio ? "border-red-500" : ""}`}
            placeholder="Cuéntanos sobre ti, tus intereses, experiencia y qué te motiva..."
            maxLength={500}
          />
          {errors.bio && (
            <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nivel de experiencia *</label>
            <select
              {...register("seniority")}
              className={`input ${errors.seniority ? "border-red-500" : ""}`}
            >
              <option value="">Selecciona...</option>
              {SENIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.seniority && (
              <p className="text-red-600 text-sm mt-1">{errors.seniority.message}</p>
            )}
          </div>

          <div>
            <label className="label">Ubicación *</label>
            <input
              {...register("location")}
              className={`input ${errors.location ? "border-red-500" : ""}`}
              placeholder="ej. Bogotá, Colombia"
            />
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label">Teléfono *</label>
          <PhoneInput
            value={phone}
            onChange={(val) => setValue("phone", val, { shouldValidate: true })}
            error={errors.phone?.message}
          />
        </div>

        <div>
          <label className="label">Disponibilidad (opcional)</label>
          <select 
            {...register("availability", { 
              setValueAs: (v) => v === "" ? undefined : Number(v) 
            })} 
            className="input"
          >
            <option value="">Selecciona...</option>
            <option value="20">Tiempo completo (20 días/mes)</option>
            <option value="10">Medio tiempo (10 días/mes)</option>
            <option value="5">Freelance (5 días/mes)</option>
            <option value="15">Por proyecto (15 días/mes)</option>
          </select>
        </div>

        <div>
          <label className="label">Stack principal (opcional)</label>
          <input
            {...register("stack")}
            className="input"
            placeholder="ej. React, Node.js, PostgreSQL"
          />
        </div>

        <div>
          <label className="label">Sector de interés (opcional)</label>
          <input
            {...register("sector")}
            className="input"
            placeholder="ej. Fintech, E-commerce, EdTech"
          />
        </div>

        <div className="flex gap-3 pt-2">
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
            ) : (
              "Continuar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
