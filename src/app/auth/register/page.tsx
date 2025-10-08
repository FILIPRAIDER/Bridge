"use client";

import { useEffect, useState } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AccountStep,
  ProfileStep,
  ExperienceStep,
  CertificationsStep,
  SkillsStep,
} from "@/components/auth/register";

type Step = "account" | "profile" | "experience" | "certifications" | "skills";

export default function RegisterWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("account");
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const { user, clear } = useSession();
  const { show } = useToast();
  const router = useRouter();
  const { data: session, status } = useNextAuthSession();

  // Redirigir si ya está autenticado con NextAuth
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  // Si ya hay usuario en Zustand, empezar desde profile
  useEffect(() => {
    if (user && currentStep === "account") {
      setCurrentStep("profile");
      setCompletedSteps(new Set(["account"]));
    }
  }, [user, currentStep]);

  const handleStepComplete = (step: Step, nextStep: Step) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
    setCurrentStep(nextStep);
  };

  // 🔥 FIX: "Completar más tarde" = SKIP este step y continuar con el siguiente
  const handleSkipStep = (currentStepToSkip: Step, nextStep: Step) => {
    // Marcar como completado (aunque se haya skipeado)
    setCompletedSteps((prev) => new Set(prev).add(currentStepToSkip));
    // Ir al siguiente step
    setCurrentStep(nextStep);
  };

  const handleFinish = async () => {
    if (!user) {
      show({
        variant: "error",
        title: "Error",
        message: "No se encontró el usuario",
      });
      return;
    }

    show({
      variant: "success",
      title: "¡Registro completado!",
      message: "Bienvenido a Bridge. Redirigiendo...",
    });

    // Esperar un momento para que se vea el toast
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirigir al login para que inicie sesión
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

  // Mostrar loading mientras verifica la sesión
  if (status === "loading" || (status === "authenticated" && session)) {
    return (
      <main className="min-h-screen grid place-items-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Redirigiendo...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-4 sm:py-8 lg:py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Progress bar */}
        {user && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(step);
                const isCurrent = currentStep === step;
                const isDisabled = index > currentStepIndex && !completedSteps.has(step);

                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition ${
                          isCompleted
                            ? "bg-gray-900 text-white"
                            : isCurrent
                            ? "bg-gray-700 text-white"
                            : isDisabled
                            ? "bg-gray-200 text-gray-400"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <p
                        className={`hidden sm:block text-xs mt-2 font-medium ${
                          isCurrent
                            ? "text-gray-900"
                            : isDisabled
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {stepTitles[step]}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 rounded transition ${
                          completedSteps.has(steps[index + 1] as Step)
                            ? "bg-gray-900"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8">
          {currentStep === "account" && (
            <AccountStep onNext={() => handleStepComplete("account", "profile")} />
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
            <SkillsStep 
              onNext={handleFinish} 
              onSkip={handleFinish} // En el último step, skip = finish
            />
          )}
        </div>

        {/* Footer */}
        {currentStep === "account" && (
          <p className="text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 text-center">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="underline font-medium">
              Ingresar
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
