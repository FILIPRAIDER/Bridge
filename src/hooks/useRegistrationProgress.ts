import { useState, useEffect } from "react";

type Step = "account" | "profile" | "experience" | "certifications" | "skills";

interface RegistrationProgress {
  userId?: string;
  completedSteps: Step[];
  currentStep: Step;
  lastUpdated: number;
}

/**
 * Hook para manejar el progreso del registro de forma segura
 * - Usa sessionStorage en lugar de query params
 * - Valida que el usuario no pueda saltar steps
 * - Expira después de 30 minutos de inactividad
 * - Se limpia automáticamente al completar el registro
 */
export function useRegistrationProgress(type: 'estudiante' | 'lider') {
  const STORAGE_KEY = `registration-progress-${type}`;
  const EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutos

  const [progress, setProgress] = useState<RegistrationProgress>({
    completedSteps: [],
    currentStep: 'account',
    lastUpdated: Date.now(),
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar progreso guardado al montar
  useEffect(() => {
    const savedProgress = sessionStorage.getItem(STORAGE_KEY);
    
    if (savedProgress) {
      try {
        const parsed: RegistrationProgress = JSON.parse(savedProgress);
        
        // Verificar si no ha expirado
        if (Date.now() - parsed.lastUpdated < EXPIRATION_TIME) {
          setProgress(parsed);
        } else {
          // Expiró, limpiar
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error parsing saved progress:', error);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    
    setIsInitialized(true);
  }, [STORAGE_KEY, EXPIRATION_TIME]);

  // Guardar progreso cada vez que cambie
  useEffect(() => {
    if (!isInitialized) return;
    
    const dataToSave = {
      ...progress,
      lastUpdated: Date.now(),
    };
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [progress, STORAGE_KEY, isInitialized]);

  /**
   * Actualizar el progreso
   */
  const updateProgress = (updates: Partial<RegistrationProgress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastUpdated: Date.now(),
    }));
  };

  /**
   * Marcar un step como completado y avanzar al siguiente
   */
  const completeStep = (step: Step, nextStep: Step) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])],
      currentStep: nextStep,
      lastUpdated: Date.now(),
    }));
  };

  /**
   * Validar si el usuario puede acceder a un step específico
   * Solo puede acceder a:
   * - El step actual
   * - Steps ya completados
   * - El siguiente step si el actual está completado
   */
  const canAccessStep = (step: Step): boolean => {
    const stepOrder: Step[] = ['account', 'profile', 'experience', 'certifications', 'skills'];
    const stepIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(progress.currentStep);
    
    // Puede acceder si:
    // 1. Es un step anterior o igual al actual
    // 2. O si el step está completado
    return stepIndex <= currentIndex || progress.completedSteps.includes(step);
  };

  /**
   * Obtener el último step válido al que puede acceder
   */
  const getLastValidStep = (): Step => {
    if (progress.completedSteps.length === 0) return 'account';
    
    const stepOrder: Step[] = ['account', 'profile', 'experience', 'certifications', 'skills'];
    
    // Encontrar el último step completado + 1
    const lastCompletedIndex = Math.max(
      ...progress.completedSteps.map(step => stepOrder.indexOf(step))
    );
    
    const nextIndex = Math.min(lastCompletedIndex + 1, stepOrder.length - 1);
    return stepOrder[nextIndex];
  };

  /**
   * Limpiar el progreso (usar al completar el registro o cancelar)
   */
  const clearProgress = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setProgress({
      completedSteps: [],
      currentStep: 'account',
      lastUpdated: Date.now(),
    });
  };

  /**
   * Verificar si el progreso ha expirado
   */
  const isExpired = (): boolean => {
    return Date.now() - progress.lastUpdated > EXPIRATION_TIME;
  };

  return {
    progress,
    isInitialized,
    updateProgress,
    completeStep,
    canAccessStep,
    getLastValidStep,
    clearProgress,
    isExpired,
  };
}
