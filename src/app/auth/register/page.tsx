"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirige automáticamente a /auth/register/select
 * Esta es la ruta principal de registro
 */
export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/register/select");
  }, [router]);

  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </main>
  );
}
