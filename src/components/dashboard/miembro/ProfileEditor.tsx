"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { PhoneInput } from "@/components/auth/register/PhoneInput";
import type { MemberProfile } from "@/types/api";

const profileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  seniority: z.string().optional(),
  location: z.string().optional(),
  availability: z.number().optional(),
  stack: z.string().optional(),
  sector: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const SENIORITY_OPTIONS = [
  { value: "JUNIOR", label: "Junior (0-2 años)" },
  { value: "SEMI_SENIOR", label: "Semi-Senior (2-5 años)" },
  { value: "SENIOR", label: "Senior (5+ años)" },
];

interface ProfileEditorProps {
  profile: MemberProfile | null;
  onUpdate: () => void;
}

export function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
  const { show } = useToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      seniority: profile?.seniority || "",
      location: profile?.location || "",
      availability: profile?.availability,
      stack: profile?.stack || "",
      sector: profile?.sector || "",
      phone: profile?.phone || "",
    },
  });

  const phoneValue = watch("phone");

  // Load user data (name, email) from session
  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || "");
      setUserEmail(session.user.email || "");
    }
  }, [session]);

  useEffect(() => {
    if (profile) {
      setValue("headline", profile.headline || "");
      setValue("bio", profile.bio || "");
      setValue("seniority", profile.seniority || "");
      setValue("location", profile.location || "");
      if (profile.availability !== undefined) {
        setValue("availability", profile.availability);
      }
      setValue("stack", profile.stack || "");
      setValue("sector", profile.sector || "");
      setValue("phone", profile.phone || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);
      
      // Clean payload: remove empty strings, null, undefined
      const cleanPayload: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        // Skip empty strings, null, undefined, and NaN
        if (
          value === "" ||
          value === null ||
          value === undefined ||
          (typeof value === "number" && isNaN(value))
        ) {
          return;
        }
        cleanPayload[key] = value;
      });

      // Parse phone if present
      if (cleanPayload.phone) {
        try {
          const { parsePhoneNumber } = await import("libphonenumber-js");
          const phoneNumber = parsePhoneNumber(cleanPayload.phone, "CO");
          if (phoneNumber) {
            cleanPayload.phoneE164 = phoneNumber.number;
            cleanPayload.phoneCountry = phoneNumber.country;
          }
        } catch (err) {
          console.warn("Phone parsing failed:", err);
        }
      }
      
      if (profile) {
        await api.patch(`/users/${profile.userId}/profile`, cleanPayload);
        show({ message: "Perfil actualizado correctamente", variant: "success" });
      } else {
        await api.post(`/users/me/profile`, cleanPayload);
        show({ message: "Perfil creado correctamente", variant: "success" });
      }
      onUpdate();
    } catch (error: any) {
      show({ message: error.message || "Error al guardar perfil", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Información Personal
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Non-editable fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="label text-gray-500">
              Nombre Completo
            </label>
            <input
              type="text"
              value={userName}
              disabled
              className="input bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Cargando..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Este campo no es editable
            </p>
          </div>

          <div>
            <label className="label text-gray-500">
              Email
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="input bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Cargando..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Este campo no es editable
            </p>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información Profesional
          </h3>
        </div>

        <div>
          <label htmlFor="headline" className="label">
            Título Profesional
          </label>
          <input
            {...register("headline")}
            id="headline"
            className="input"
            placeholder="Ej: Full Stack Developer"
          />
          {errors.headline && (
            <p className="mt-1 text-sm text-red-600">{errors.headline.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="label">
            Biografía
          </label>
          <textarea
            {...register("bio")}
            id="bio"
            rows={4}
            className="input resize-none"
            placeholder="Cuéntanos sobre ti..."
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="seniority" className="label">
              Nivel de Experiencia
            </label>
            <select {...register("seniority")} id="seniority" className="input">
              <option value="">Seleccionar...</option>
              {SENIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="label">
              Ubicación
            </label>
            <input
              {...register("location")}
              id="location"
              className="input"
              placeholder="Ciudad, País"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="availability" className="label">
              Disponibilidad (horas/semana)
            </label>
            <input
              {...register("availability", { valueAsNumber: true })}
              id="availability"
              type="number"
              min="1"
              max="60"
              className="input"
              placeholder="Ej: 40"
            />
          </div>

          <div>
            <label htmlFor="sector" className="label">
              Sector
            </label>
            <input
              {...register("sector")}
              id="sector"
              className="input"
              placeholder="Ej: Tecnología"
            />
          </div>
        </div>

        <div>
          <label htmlFor="stack" className="label">
            Stack Tecnológico
          </label>
          <input
            {...register("stack")}
            id="stack"
            className="input"
            placeholder="Ej: React, Node.js, PostgreSQL"
          />
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Teléfono
          </label>
          <PhoneInput
            value={phoneValue || ""}
            onChange={(value) => setValue("phone", value)}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-dark inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

