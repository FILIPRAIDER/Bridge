"use client";

import { Suspense, useEffect } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { AccountStep } from "@/components/auth/register";

function EmpresarioRegisterContent() {
  const { show } = useToast();
  const router = useRouter();
  const { data: session, status } = useNextAuthSession();

  useEffect(() => {
    if (session && status === "authenticated") {
      router.replace("/dashboard");
      return;
    }
  }, [session, status, router]);

  const handleNext = () => {
    // Después de crear la cuenta, redirigir al onboarding
    // NO mostrar toast aquí (ya se muestra en AccountStep)
    router.push("/auth/register/empresario/onboarding");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AccountStep
          onNext={handleNext}
          preselectedRole="EMPRESARIO"
        />
      </div>
    </div>
  );
}

export default function EmpresarioRegister() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <EmpresarioRegisterContent />
    </Suspense>
  );
}
