"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    
    if (role === "LIDER") {
      router.replace("/dashboard/lider");
    } else if (role === "ESTUDIANTE") {
      router.replace("/dashboard/miembro");
    } else if (role === "EMPRESARIO") {
      router.replace("/dashboard/empresario");
    } else if (role === "ADMIN") {
      router.replace("/dashboard/lider"); // o ruta específica de admin
    } else {
      router.replace("/dashboard/miembro");
    }
  }, [session, status, router]);

  // No mostrar nada mientras redirige (la página de destino mostrará su propio loader)
  return null;
}
