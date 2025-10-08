"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { BackendHealthCheck } from "@/components/providers/BackendHealthCheck";
import { BridgeLoader } from "@/components/ui/BridgeLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Protección de ruta y validación de rol
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    // Solo validar si NO estamos en la página de redirección principal
    // Esto evita el bucle de redirecciones
    if (pathname === "/dashboard") return;

    const role = session.user?.role;

    // Si es LIDER/ADMIN pero está en /miembro, redirigir
    if ((role === "LIDER" || role === "ADMIN") && pathname?.includes("/miembro")) {
      router.replace("/dashboard/lider");
      return;
    }

    // Si es ESTUDIANTE pero está en /lider, redirigir
    if (role === "ESTUDIANTE" && pathname?.includes("/lider")) {
      router.replace("/dashboard/miembro");
      return;
    }
  }, [session, status, pathname, router]);

  if (status === "loading") {
    return (
      <BridgeLoader
        message="Accediendo al dashboard"
        submessage="Preparando tu espacio de trabajo"
      />
    );
  }

  return (
    <BackendHealthCheck>
      {children}
    </BackendHealthCheck>
  );
}
