"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { PasswordInput } from "@/components/ui/password-input";
import { Building2, GraduationCap, Users } from "lucide-react";
import type { Company } from "@/types/api";

const StrongPassword = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede superar 72 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número")
  .regex(/[!@#$%^&*()_\-+={}\[\]|\\:;"'<>,.?/]/, "Debe incluir al menos un carácter especial");

const AccountSchema = z
  .object({
    role: z.enum(["EMPRESARIO", "ESTUDIANTE", "LIDER"]),
    companyName: z.string().optional(),
    teamName: z.string().optional(),
    name: z.string().min(2, "Nombre muy corto"),
    email: z.string().email("Email inválido"),
    password: StrongPassword,
    confirm: z.string().min(8, "Confirma tu contraseña"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  })
  .refine(
    (d) => {
      // EMPRESARIO ya no requiere companyName aquí (se pide en onboarding personalizado)
      if (d.role === "LIDER" && !d.teamName) return false;
      return true;
    },
    {
      message: "Campo requerido",
      path: ["teamName"],
    }
  );

type AccountFormData = z.infer<typeof AccountSchema>;

interface AccountStepProps {
  onNext: () => void;
  preselectedRole?: "EMPRESARIO" | "ESTUDIANTE" | "LIDER"; // 🔥 Rol preseleccionado
}

type Team = {
  id: string;
  name: string;
};

const PERSONAS = [
  {
    key: "EMPRESARIO" as const,
    title: "Empresa",
    desc: "Publica proyectos y contrata equipos.",
    icon: Building2,
  },
  {
    key: "ESTUDIANTE" as const,
    title: "Estudiante / Miembro",
    desc: "Aplica a proyectos con tu equipo.",
    icon: GraduationCap,
  },
  {
    key: "LIDER" as const,
    title: "Líder de Equipo",
    desc: "Crea y gestiona tu equipo de trabajo.",
    icon: Users,
  },
];

export function AccountStep({ onNext, preselectedRole }: AccountStepProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "EMPRESARIO" | "ESTUDIANTE" | "LIDER" | null
  >(preselectedRole || null); // 🔥 Usar rol preseleccionado si existe
  const [loading, setLoading] = useState(false);
  const [passOk, setPassOk] = useState(false);
  const { setUser, setCompanyId, setTeamId } = useSession();
  const { show } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AccountFormData>({
    resolver: zodResolver(AccountSchema),
  });

  const role = watch("role");

  // 🔥 Establecer rol preseleccionado en el formulario
  useEffect(() => {
    if (preselectedRole) {
      setValue("role", preselectedRole);
    }
  }, [preselectedRole, setValue]);

  const onSubmit = async (data: AccountFormData) => {
    setLoading(true);
    try {
      // 1. Crear usuario (ahora el backend soporta LIDER)
      const user = await api.post<{ id: string; name: string; email: string; role: "EMPRESARIO" | "ESTUDIANTE" | "LIDER" }>("/users", {
        name: data.name,
        email: data.email,
        role: data.role, // Enviar directamente LIDER si es el caso
        password: data.password,
      });

      // 2. Guardar en Zustand (guardamos el rol original)
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: data.role as any, // EMPRESARIO | ESTUDIANTE | LIDER
      });

      // 3. Si es EMPRESARIO → hacer login automático y redirigir a onboarding personalizado
      if (data.role === "EMPRESARIO") {
        // Guardar credenciales temporalmente para el onboarding
        sessionStorage.setItem("temp_email", data.email);
        sessionStorage.setItem("temp_password", data.password);
        localStorage.setItem("empresario_needs_onboarding", "true");

        show({
          variant: "success",
          title: "Cuenta creada",
          message: "Continuemos con el perfil empresarial...",
        });

        // Llamar a onNext para que la página padre maneje la redirección
        onNext();
        return;
      }

      // 4. Si es líder, crear equipo
      if (data.role === "LIDER" && data.teamName) {
        try {
          const team = await api.post<Team>("/teams", {
            name: data.teamName,
          });
          setTeamId(team.id);
          
          // Agregar al líder como miembro del equipo con rol LIDER
          await api.post(`/teams/${team.id}/members`, {
            userId: user.id,
            role: "LIDER",
          });
        } catch (teamError) {
          const err = teamError as Error;
          console.warn("No se pudo crear el equipo:", err.message);
        }
      }

      show({
        variant: "success",
        title: "Cuenta creada",
        message: "Continuemos con tu perfil",
      });

      onNext();
    } catch (e: any) {
      console.error("Error al crear cuenta:", e);
      
      // Extraer mensaje de error de diferentes formatos
      let errorMessage = "Intenta de nuevo";
      
      if (typeof e === 'string') {
        errorMessage = e;
      } else if (e?.message) {
        errorMessage = e.message;
      } else if (e?.error) {
        errorMessage = e.error;
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      
      // Mejorar mensajes comunes
      if (errorMessage.includes("unique") || errorMessage.includes("already exists")) {
        errorMessage = "Este email ya está registrado. ¿Quieres iniciar sesión?";
      } else if (errorMessage.includes("email")) {
        errorMessage = "Email inválido o ya registrado";
      } else if (errorMessage.includes("password")) {
        errorMessage = "La contraseña no cumple los requisitos";
      }
      
      show({
        variant: "error",
        title: "Error al crear la cuenta",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Si el rol no está preseleccionado, mostrar selector
  if (!selectedRole) {
    return (
      <div className="w-full px-4 sm:px-0 sm:max-w-2xl lg:max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Elige cómo quieres usar Bridge</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">Selecciona una opción para continuar.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon;
            return (
              <button
                key={persona.key}
                onClick={() => {
                  setSelectedRole(persona.key);
                  setValue("role", persona.key);
                }}
                className="w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 text-left hover:border-gray-900 hover:shadow-md transition group active:scale-[0.98]"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 group-hover:bg-gray-200 transition">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">{persona.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{persona.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-0 sm:max-w-md mx-auto">
      {/* Solo mostrar botón de cambiar tipo si NO hay rol preseleccionado */}
      {!preselectedRole && (
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-4 text-xs sm:text-sm text-gray-600 hover:text-gray-900 underline flex items-center gap-1"
        >
          ← Cambiar tipo de cuenta
        </button>
      )}

      <h1 className="text-xl sm:text-2xl font-bold mb-1">
        {role === "EMPRESARIO" ? "Crear cuenta (empresa)" : role === "LIDER" ? "Crear cuenta (líder)" : "Crear cuenta"}
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6">Completa tus datos para continuar.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("role")} />

        {role === "LIDER" && (
          <div>
            <label className="label">Nombre del equipo *</label>
            <input
              {...register("teamName")}
              className={`input ${errors.companyName ? "border-red-500" : ""}`}
              placeholder="Mi Equipo de Desarrollo"
            />
            {errors.companyName && (
              <p className="text-red-600 text-sm mt-1">{errors.companyName.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="label">Nombre completo *</label>
          <input
            {...register("name")}
            className={`input ${errors.name ? "border-red-500" : ""}`}
            placeholder="Tu nombre"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="label">Email *</label>
          <input
            {...register("email")}
            type="email"
            className={`input ${errors.email ? "border-red-500" : ""}`}
            placeholder="tucorreo@dominio.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">Contraseña *</label>
          <PasswordInput 
            {...register("password")} 
            onValidityChange={setPassOk} 
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="label">Confirmar contraseña *</label>
          <input
            {...register("confirm")}
            type="password"
            className={`input ${errors.confirm ? "border-red-500" : ""}`}
            placeholder="••••••••"
          />
          {errors.confirm && (
            <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passOk}
          className="btn btn-dark w-full disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          title={!passOk ? "La contraseña aún no cumple los requisitos" : ""}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta y continuar"}
        </button>
      </form>
    </div>
  );
}
