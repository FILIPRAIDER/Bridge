"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectCreationFlags {
  hasProjectType: boolean;
  hasDescription: boolean;
  hasObjectives: boolean;
  hasBudget: boolean;
  hasTimeline: boolean;
  hasRequirements: boolean;
  hasTechPreferences: boolean;
  hasIndustry: boolean;
  hasTargetAudience: boolean;
  hasLocation: boolean;
  isComplete: boolean;
  needsConfirmation: boolean;
  wasConfirmed: boolean;
}

interface ProjectData {
  projectType: string | null;
  description: string | null;
  objectives: string[];
  budget: number | null;
  budgetCurrency: 'COP' | 'USD';
  timeline: number | null;
  timelineUnit: 'months' | 'weeks';
  requirements: string[];
  techPreferences: string[];
  industry: string | null;
  targetAudience: string | null;
  location: string | null;
  city: string | null;
  area: string | null;
}

interface ProjectProgressBannerProps {
  flags: ProjectCreationFlags;
  data: ProjectData;
  onProjectCreated?: boolean; // Para trigger de celebración
}

export function ProjectProgressBanner({ flags, data, onProjectCreated }: ProjectProgressBannerProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Trigger de celebración cuando se crea el proyecto
  useEffect(() => {
    if (onProjectCreated) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [onProjectCreated]);

  // Definir los items principales
  const mainItems = [
    { label: 'Tipo', hasData: flags.hasProjectType, icon: '🎯', value: data.projectType },
    { label: 'Industria/Sector', hasData: flags.hasIndustry, icon: '🏢', value: data.industry },
    { label: 'Presupuesto', hasData: flags.hasBudget, icon: '💰', value: data.budget ? `${data.budgetCurrency === 'COP' ? '$' : ''}${data.budget.toLocaleString('es-CO')}` : null },
    { label: 'Tiempo', hasData: flags.hasTimeline, icon: '⏱️', value: data.timeline ? `${data.timeline} ${data.timelineUnit === 'months' ? 'meses' : 'semanas'}` : null },
    { label: 'Objetivos', hasData: flags.hasObjectives, icon: '🎯', value: data.objectives.length > 0 ? `${data.objectives.length} objetivos` : null },
  ];

  const completed = mainItems.filter(i => i.hasData).length;
  const total = mainItems.length;
  const progress = (completed / total) * 100;

  // Si no hay progreso, no mostrar nada
  if (completed === 0 && !flags.isComplete) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {!onProjectCreated ? (
        // Banner normal de progreso
        <motion.div
          key="progress-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="border-b border-gray-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm"
        >
          <div className="px-4 lg:px-6 py-3">
            {/* Compact Header */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: flags.isComplete ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    flags.isComplete 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}
                >
                  {flags.isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-white" />
                  )}
                </motion.div>
                
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Información del Proyecto
                    </h3>
                    {flags.isComplete && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Completo ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {completed}/{total} completado
                  </p>
                </div>
              </div>

              {/* Progress Circle - Mobile/Tablet */}
              <div className="lg:hidden relative w-12 h-12">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-gray-200"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100) }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={flags.isComplete ? "text-green-500" : "text-blue-500"}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress Bar - Desktop */}
              <div className="hidden lg:flex items-center gap-3 flex-1 max-w-xs ml-4">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      flags.isComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
                  {Math.round(progress)}%
                </span>
              </div>
            </button>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {mainItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left ${
                          item.hasData
                            ? 'bg-white/80 border border-green-200 shadow-sm'
                            : 'bg-white/40 border border-gray-200'
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${
                            item.hasData ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {item.label}
                          </p>
                          {item.hasData && item.value && (
                            <p className="text-xs text-gray-600 truncate mt-0.5">
                              {item.value}
                            </p>
                          )}
                        </div>
                        {item.hasData && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Status Messages */}
                  {flags.needsConfirmation && !flags.wasConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg"
                    >
                      <p className="text-xs text-yellow-800 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Esperando tu confirmación para crear el proyecto</span>
                      </p>
                    </motion.div>
                  )}

                  {flags.wasConfirmed && !flags.isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 px-3 py-2 bg-blue-100 border border-blue-300 rounded-lg"
                    >
                      <p className="text-xs text-blue-800 flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⏳
                        </motion.span>
                        <span>Creando proyecto...</span>
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        // Celebration Banner cuando se crea el proyecto
        <motion.div
          key="celebration-banner"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="border-b border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50"
        >
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1.2, 1.2, 1]
                }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <PartyPopper className="h-5 w-5 text-white" />
              </motion.div>
              
              <div className="text-center">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base font-bold text-gray-900"
                >
                  ¡Proyecto Creado Exitosamente! 🎉
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600 mt-1"
                >
                  Tu proyecto está listo y disponible en el dashboard
                </motion.p>
              </div>

              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: `${50}%`, 
                      y: `${50}%`,
                      scale: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      x: `${Math.random() * 100}%`,
                      y: `${-20 + Math.random() * 40}%`,
                      scale: [0, 1, 0.8, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5]
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
