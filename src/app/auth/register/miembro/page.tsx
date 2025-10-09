"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AccountStep,
  ProfileStep,
  ExperienceStep,
  CertificationsStep,
  SkillsStep,
} from "@/components/auth/register";

type Step = "account" | "profile" | "experience" | "certifications" | "skills";

function MiembroRegisterContent() {
  const searchParams = useSearchParams();
  const urlStep = searchParams.get("step") as Step | null;
  
  const [currentStep, setCurrentStep] = useState<Step>(urlStep || "account");
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, clear } = useSession();
  const { show } = useToast();
  const router = useRouter();
  const { data: session, status } = useNextAuthSession();

  useEffect(() => {
    const saved = localStorage.getItem("register-miembro-completed");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompletedSteps(new Set(parsed));
      } catch (e) {}
    }
    if (urlStep) setCurrentStep(urlStep);
    setIsInitialized(true);
  }, [urlStep]);

  useEffect(() => {
    if (!isInitialized) return;
    const params = new URLSearchParams();
    params.set("step", currentStep);
    router.replace(`/auth/register/miembro?${params.toString()}`, { scroll: false });
  }, [currentStep, router, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("register-miembro-completed", JSON.stringify(Array.from(completedSteps)));
  }, [completedSteps, isInitialized]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const handleStepComplete = (step: Step, nextStep: Step) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
    setCurrentStep(nextStep);
  };

  const handleSkipStep = (currentStepToSkip: Step, nextStep: Step) => {
    setCompletedSteps((prev) => new Set(prev).add(currentStepToSkip));
    setCurrentStep(nextStep);
  };

  const handleFinish = async () => {
    if (!user) {
      show({ variant: "error", title: "Error", message: "No se encontró el usuario" });
      return;
    }

    show({
      variant: "success",
      title: "¡Registro completado!",
      message: "Bienvenido a Bridge. Redirigiendo...",
    });

    localStorage.removeItem("register-miembro-completed");
    await new Promise(resolve => setTimeout(resolve, 1000));
    clear();
    window.location.href = "/auth/login?registered=true";
  };

  const stepTitles: Record<Step, string> = {
    account: "Cuenta",
    profile: "Perfil",
    experience: "Experiencia",
    certifications: "Certificaciones",
    skills: "Habilidades",
  };

  const steps: Step[] = ["account", "profile", "experience", "certifications", "skills"];
  const currentStepIndex = steps.indexOf(currentStep);

  if (status === "loading" || (status === "authenticated" && session)) {
    return (
      <main className="min-h-screen grid place-items-center px-4">
        <div className="animate-pulse">Redirigiendo...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container max-w-4xl mx-auto">
        {/* Progress */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(step);
                const isCurrent = currentStep === step;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                          isCompleted
                            ? "bg-gray-900 text-white"
                            : isCurrent
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <p className="hidden sm:block text-xs mt-2 font-medium">{stepTitles[step]}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded ${completedSteps.has(steps[index + 1]) ? "bg-gray-900" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {currentStep === "account" && (
            <AccountStep 
              onNext={() => handleStepComplete("account", "profile")}
              preselectedRole="ESTUDIANTE"
            />
          )}
          {currentStep === "profile" && (
            <ProfileStep
              onNext={() => handleStepComplete("profile", "experience")}
              onSkip={() => handleSkipStep("profile", "experience")}
            />
          )}
          {currentStep === "experience" && (
            <ExperienceStep
              onNext={() => handleStepComplete("experience", "certifications")}
              onSkip={() => handleSkipStep("experience", "certifications")}
            />
          )}
          {currentStep === "certifications" && (
            <CertificationsStep
              onNext={() => handleStepComplete("certifications", "skills")}
              onSkip={() => handleSkipStep("certifications", "skills")}
            />
          )}
          {currentStep === "skills" && (
            <SkillsStep onNext={handleFinish} onSkip={handleFinish} />
          )}
        </div>

        {currentStep === "account" && (
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
        )}
      </div>
    </main>
  );
}

export default function MiembroRegister() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Cargando...</div>}>
      <MiembroRegisterContent />
    </Suspense>
  );
}
