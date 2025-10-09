"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function PerfilPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/login");
  }

  // Redirigir según el rol
  const role = session.user.role;

  if (role === "EMPRESARIO") {
    redirect("/dashboard/empresario");
  } else if (role === "LIDER") {
    redirect("/dashboard/lider");
  } else if (role === "ESTUDIANTE") {
    redirect("/dashboard/miembro");
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirigiendo...</h1>
        <p className="text-gray-600">Cargando tu perfil</p>
      </div>
    </div>
  );
}
