"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BridgeLoader } from "@/components/ui/BridgeLoader";

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
    <BridgeLoader
      message="Redirigiendo"
      submessage="Accediendo a tu dashboard"
    />
  );
}
