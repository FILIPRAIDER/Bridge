"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/config";
import { BridgeLoader } from "@/components/ui/BridgeLoader";

interface BackendHealthProps {
  children: React.ReactNode;
}

export function BackendHealthCheck({ children }: BackendHealthProps) {
  // DESHABILITADO: Health check causa problemas con CORS en desarrollo
  // El backend solo acepta requests desde la URL de producción
  // Simplemente mostramos un loader breve y continuamos
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Loader cosmético de 1.5 segundos
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <BridgeLoader
        message="Accediendo al dashboard"
        submessage="Preparando tu espacio de trabajo"
      />
    );
  }

  return <>{children}</>;
}
