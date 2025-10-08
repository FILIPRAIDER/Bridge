"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardHome() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    const role = session.user?.role;
    
    if (role === "LIDER" || role === "ADMIN") {
      router.replace("/dashboard/lider");
    } else if (role === "ESTUDIANTE") {
      router.replace("/dashboard/miembro");
    } else if (role === "EMPRESARIO") {
      router.replace("/empresa");
    } else {
      router.replace("/dashboard/miembro");
    }
  }, [session, status, router]);

  // Mostrar loader mientras redirige (evita pantalla blanca)
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-3" />
        <p className="text-sm text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
