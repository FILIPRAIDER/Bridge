"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountStep } from "@/components/auth/register";
import Link from "next/link";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as "EMPRESARIO" | "ESTUDIANTE" | "LIDER" | null;

  // Si no hay rol, redirigir a select
  useEffect(() => {
    if (!roleParam) {
      router.replace("/auth/register/select");
    }
  }, [roleParam, router]);

  if (!roleParam) {
    return (
      <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </main>
    );
  }

  const handleNext = () => {
    // Después de crear cuenta, según el rol:
    // - EMPRESARIO ya redirige a su onboarding
    // - ESTUDIANTE/LIDER van al dashboard (AccountStep maneja esto)
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <AccountStep 
            onNext={handleNext}
            preselectedRole={roleParam}
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="underline font-medium">
              Ingresar
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <Link href="/auth/register/select" className="underline font-medium">
              ← Cambiar tipo de cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </main>
    }>
      <RegisterContent />
    </Suspense>
  );
}
