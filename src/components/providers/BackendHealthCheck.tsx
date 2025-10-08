"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/config";
import { Loader2 } from "lucide-react";

interface BackendHealthProps {
  children: React.ReactNode;
}

export function BackendHealthCheck({ children }: BackendHealthProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const health = await checkBackendHealth();
        
        if (!mounted) return;
        
        if (health.online) {
          setIsOnline(true);
          setIsChecking(false);
          setError(null);
        } else {
          // Reintentar después de 3 segundos
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 3000);
          } else {
            setError("No se pudo conectar al servidor después de varios intentos.");
            setIsChecking(false);
          }
        }
      } catch (err) {
        if (!mounted) return;
        
        console.error("Health check error:", err);
        
        // Reintentar después de 3 segundos
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
        } else {
          setError("No se pudo conectar al servidor después de varios intentos.");
          setIsChecking(false);
        }
      }
    };

    checkHealth();

    return () => {
      mounted = false;
    };
  }, [retryCount]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conectando al servidor...
          </h2>
          <p className="text-gray-600 max-w-md">
            {retryCount === 0
              ? "Verificando conexión con el backend..."
              : `Reintentando (${retryCount}/3)... El servidor puede estar iniciando.`}
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              El servidor en Render puede tardar hasta 60 segundos en iniciar
              si estaba inactivo.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error de Conexión
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setIsChecking(true);
              setRetryCount(0);
              setError(null);
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
