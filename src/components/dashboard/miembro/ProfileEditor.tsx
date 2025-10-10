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
import { useSectors } from "@/hooks/useSectors";
import { useCountries } from "@/hooks/useCountries";
import { useCities } from "@/hooks/useCities";
import type { MemberProfile } from "@/types/api";

const profileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  seniority: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  availability: z.number().optional(),
  stack: z.string().optional(),
  sectorId: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const SENIORITY_OPTIONS = [
  { value: "Junior", label: "Junior (0-2 años)" },
  { value: "Mid-level", label: "Mid-level (2-4 años)" },
  { value: "Semi-Senior", label: "Semi-Senior (4-6 años)" },
  { value: "Senior", label: "Senior (6+ años)" },
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
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Hooks para datos del backend
  const { data: sectorsData, loading: sectorsLoading } = useSectors();
  const { data: countries, loading: countriesLoading } = useCountries();
  const { data: citiesData, loading: citiesLoading, hasCities } = useCities(selectedCountry);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: "",
      bio: "",
      seniority: "",
      country: "",
      city: "",
      address: "",
      availability: undefined,
      stack: "",
      sectorId: "",
      phone: "",
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

  // Prellenar campos cuando el perfil se carga
  useEffect(() => {
    if (profile) {
      console.log('[ProfileEditor] 📊 Cargando datos del perfil...');
      
      // Cargar país actual para activar las ciudades
      if (profile.country) {
        setSelectedCountry(profile.country);
      }
      
      // Usar setValue para cada campo individualmente (más confiable que reset)
      setValue("headline", profile.headline || "");
      setValue("bio", profile.bio || "");
      setValue("seniority", profile.seniority || "");
      setValue("address", profile.address || "");
      setValue("stack", profile.stack || "");
      setValue("phone", profile.phone || "");
      
      if (profile.availability !== undefined && profile.availability !== null) {
        setValue("availability", profile.availability);
      }
      
      console.log('[ProfileEditor] ✅ Campos básicos cargados');
    }
  }, [profile, setValue]);

  // Cargar país cuando esté disponible (después de que countries esté listo)
  useEffect(() => {
    if (profile?.country && countries && !countriesLoading) {
      setValue("country", profile.country);
      console.log('[ProfileEditor] ✅ País cargado:', profile.country);
    }
  }, [profile?.country, countries, countriesLoading, setValue]);

  // Cargar ciudad cuando esté disponible (después de que cities esté listo)
  useEffect(() => {
    if (profile?.city && citiesData && !citiesLoading && selectedCountry) {
      setValue("city", profile.city);
      console.log('[ProfileEditor] ✅ Ciudad cargada:', profile.city);
    }
  }, [profile?.city, citiesData, citiesLoading, selectedCountry, setValue]);

  // Cargar sector cuando esté disponible (después de que sectors esté listo)
  useEffect(() => {
    if (profile?.sectorId && sectorsData && !sectorsLoading) {
      setValue("sectorId", profile.sectorId);
      console.log('[ProfileEditor] ✅ Sector cargado:', profile.sectorId);
    }
  }, [profile?.sectorId, sectorsData, sectorsLoading, setValue]);

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
        </div>

        {/* Sector - Desde API */}
        <div>
          <label htmlFor="sectorId" className="label">
            Sector Profesional
          </label>
          <select
            {...register("sectorId")}
            id="sectorId"
            className="input appearance-none cursor-pointer"
            disabled={sectorsLoading}
          >
            <option value="">
              {sectorsLoading ? "Cargando sectores..." : "Selecciona un sector"}
            </option>
            {sectorsData?.sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.icon} {sector.nameEs}
              </option>
            ))}
          </select>
          {profile?.sector && (
            <p className="mt-1 text-xs text-gray-500">
              Actual: {profile.sector.icon || "📋"} {profile.sector.nameEs}
            </p>
          )}
        </div>

        {/* Ubicación - País */}
        <div>
          <label htmlFor="country" className="label">
            País <span className="text-red-500">*</span>
          </label>
          <select
            {...register("country")}
            id="country"
            className="input appearance-none cursor-pointer"
            disabled={countriesLoading}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCountry(value);
              setValue("country", value);
              // Reset city when country changes
              setValue("city", "");
            }}
          >
            <option value="">
              {countriesLoading ? "Cargando países..." : "Selecciona un país"}
            </option>
            {countries?.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación - Ciudad */}
        <div>
          <label htmlFor="city" className="label">
            Ciudad <span className="text-red-500">*</span>
          </label>
          
          {/* Si no hay ciudades disponibles, mostrar input manual */}
          {selectedCountry && !citiesLoading && !hasCities ? (
            <>
              <input
                {...register("city")}
                id="city"
                className="input"
                placeholder="Escribe el nombre de tu ciudad"
              />
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <span>⚠️</span>
                <span>No hay ciudades precargadas para este país. Escribe tu ciudad manualmente.</span>
              </p>
            </>
          ) : (
            <>
              <select
                {...register("city")}
                id="city"
                className="input appearance-none cursor-pointer"
                disabled={!selectedCountry || citiesLoading}
              >
                <option value="">
                  {!selectedCountry
                    ? "Primero selecciona un país"
                    : citiesLoading
                    ? "Cargando ciudades..."
                    : "Selecciona una ciudad"}
                </option>
                {citiesData?.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {!selectedCountry && (
                <p className="mt-1 text-xs text-gray-500">
                  💡 Primero selecciona un país para ver las ciudades disponibles
                </p>
              )}
            </>
          )}
        </div>

        {/* Ubicación - Dirección (opcional) */}
        <div>
          <label htmlFor="address" className="label">
            Dirección <span className="text-gray-400 text-sm">(Opcional)</span>
          </label>
          <input
            {...register("address")}
            id="address"
            className="input"
            placeholder="Ej: Calle 123 #45-67, Apartamento 102"
          />
          <p className="mt-1 text-xs text-gray-500">
            Agrega más detalles de tu ubicación si lo deseas
          </p>
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

