"use client";

import { Building2, GraduationCap, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BridgeLogo } from "@/components/shared/BridgeLogo";

const ROLES = [
  {
    key: "empresario",
    title: "Empresa",
    desc: "Publica proyectos y contrata equipos.",
    icon: Building2,
    route: "/auth/register/empresario",
  },
  {
    key: "estudiante",
    title: "Estudiante / Miembro",
    desc: "Aplica a proyectos con tu equipo.",
    icon: GraduationCap,
    route: "/auth/register/estudiante",
  },
  {
    key: "lider",
    title: "Líder de Equipo",
    desc: "Crea y gestiona tu equipo de trabajo.",
    icon: Users,
    route: "/auth/register/lider",
  },
];

export default function RoleSelection() {
  const router = useRouter();

  const handleSelectRole = (route: string) => {
    router.push(route);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <BridgeLogo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Bienvenido a Bridge
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Selecciona cómo quieres usar la plataforma
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => handleSelectRole(role.route)}
                className="group relative bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-gray-900 hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-gray-900 transition-colors mb-4">
                  <Icon className="w-8 h-8 text-gray-700 group-hover:text-white transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {role.desc}
                </p>

                {/* Arrow */}
                <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-gray-900 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
