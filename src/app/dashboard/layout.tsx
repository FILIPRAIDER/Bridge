"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

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
      console.log("❌ Dashboard layout: No session, redirecting to login");
      router.replace("/auth/login");
      return;
    }

    const role = session.user?.role;
    console.log("🔍 Dashboard layout validation:", {
      pathname,
      role,
      isLiderRoute: pathname?.includes("/lider"),
      isMiembroRoute: pathname?.includes("/miembro"),
    });

    // Si es LIDER/ADMIN pero está en /miembro, redirigir
    if ((role === "LIDER" || role === "ADMIN") && pathname?.includes("/miembro")) {
      console.log("🔄 LIDER en /miembro, redirigiendo a /lider");
      router.replace("/dashboard/lider");
      return;
    }

    // Si es ESTUDIANTE pero está en /lider, redirigir
    if (role === "ESTUDIANTE" && pathname?.includes("/lider")) {
      console.log("🔄 ESTUDIANTE en /lider, redirigiendo a /miembro");
      router.replace("/dashboard/miembro");
      return;
    }
  }, [session, status, pathname, router]);

  if (status === "loading") {
    return null;
  }

  return <>{children}</>;
}
