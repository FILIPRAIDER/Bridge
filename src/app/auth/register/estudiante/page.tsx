"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRegistrationProgress } from "@/hooks/useRegistrationProgress";
import {
  AccountStep,
  ProfileStep,
  ExperienceStep,
  CertificationsStep,
  SkillsStep,
} from "@/components/auth/register";

type Step = "account" | "profile" | "experience" | "certifications" | "skills";

function EstudianteRegisterContent() {
  const { user, clear } = useSession();
  const { show } = useToast();
  const router = useRouter();
  const { data: session, status } = useNextAuthSession();
  
  // 🔥 Usar nuevo hook seguro para manejar el progreso
  const {
    progress,
    isInitialized,
    completeStep,
    canAccessStep,
    getLastValidStep,
    clearProgress,
    isExpired,
  } = useRegistrationProgress('estudiante');
  
  const [currentStep, setCurrentStep] = useState<Step>(progress.currentStep);

  // Redirigir si ya tiene sesión
  useEffect(() => {
    if (session && status === "authenticated") {
      clearProgress();
      router.replace("/dashboard");
      return;
    }
  }, [session, status, router, clearProgress]);

  // Sincronizar currentStep con el progress
  useEffect(() => {
    if (!isInitialized) return;
    
    // Si el progreso expiró, reiniciar
    if (isExpired()) {
      clearProgress();
      setCurrentStep('account');
      show({
        variant: 'warning',
        message: 'Tu sesión de registro expiró. Por favor comienza de nuevo.',
      });
      return;
    }
    
    setCurrentStep(progress.currentStep);
  }, [progress.currentStep, isInitialized, isExpired, clearProgress, show]);

  // Validar acceso al step actual
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!canAccessStep(currentStep)) {
      const validStep = getLastValidStep();
      setCurrentStep(validStep);
      show({
        variant: 'warning',
        message: 'Debes completar los pasos anteriores primero',
      });
    }
  }, [currentStep, canAccessStep, getLastValidStep, isInitialized, show]);

  const handleStepComplete = (step: Step, nextStep: Step) => {
    completeStep(step, nextStep);
    setCurrentStep(nextStep);
  };

  const handleSkipStep = (currentStepToSkip: Step, nextStep: Step) => {
    completeStep(currentStepToSkip, nextStep);
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

    // Limpiar progreso al completar
    clearProgress();
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
                const isCompleted = progress.completedSteps.includes(step);
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
                      <div className={`h-1 flex-1 mx-2 rounded ${progress.completedSteps.includes(steps[index + 1]) ? "bg-gray-900" : "bg-gray-200"}`} />
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

export default function EstudianteRegister() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Cargando...</div>}>
      <EstudianteRegisterContent />
    </Suspense>
  );
}
