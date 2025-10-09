"use client";

import { CheckCircle2, Circle } from 'lucide-react';

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

interface ProjectProgressProps {
  flags: ProjectCreationFlags;
  data: ProjectData;
}

export function ProjectProgressIndicator({ flags, data }: ProjectProgressProps) {
  // Definir los items principales a mostrar
  const mainItems = [
    { 
      label: 'Tipo de Proyecto', 
      hasData: flags.hasProjectType, 
      value: data.projectType,
      required: true
    },
    { 
      label: 'Industria/Sector', 
      hasData: flags.hasIndustry, 
      value: data.industry,
      required: true
    },
    { 
      label: 'Presupuesto', 
      hasData: flags.hasBudget, 
      value: data.budget 
        ? `${data.budgetCurrency === 'COP' ? '$' : ''}${data.budget.toLocaleString('es-CO')} ${data.budgetCurrency}` 
        : null,
      required: true
    },
    { 
      label: 'Tiempo de Desarrollo', 
      hasData: flags.hasTimeline, 
      value: data.timeline 
        ? `${data.timeline} ${data.timelineUnit === 'months' ? 'meses' : 'semanas'}` 
        : null,
      required: true
    },
    { 
      label: 'Objetivos', 
      hasData: flags.hasObjectives, 
      value: data.objectives.length > 0 ? data.objectives.join(', ') : null,
      required: true
    },
  ];

  // Calcular progreso solo de items requeridos
  const requiredItems = mainItems.filter(i => i.required);
  const completed = requiredItems.filter(i => i.hasData).length;
  const total = requiredItems.length;
  const progress = (completed / total) * 100;

  // Si no hay nada todavía, no mostrar
  if (completed === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Información del Proyecto
            </h3>
            <p className="text-xs text-gray-600">
              {completed}/{total} completado
            </p>
          </div>
        </div>
        
        {flags.isComplete && (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            ✓ Completo
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-blue-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mainItems.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
              item.hasData 
                ? 'bg-white border border-green-200' 
                : 'bg-white/50 border border-gray-200'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.hasData ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                item.hasData ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {item.label}
              </p>
              {item.hasData && item.value && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Items adicionales (no requeridos) */}
      {(flags.hasRequirements || flags.hasTechPreferences || flags.hasTargetAudience || flags.hasLocation) && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Información Adicional:</p>
          <div className="flex flex-wrap gap-2">
            {flags.hasRequirements && data.requirements.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {data.requirements.length} requerimiento(s)
              </span>
            )}
            {flags.hasTechPreferences && data.techPreferences.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                {data.techPreferences.length} tecnología(s)
              </span>
            )}
            {flags.hasTargetAudience && data.targetAudience && (
              <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                Audiencia: {data.targetAudience}
              </span>
            )}
            {flags.hasLocation && data.location && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                {data.location}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Status */}
      {flags.needsConfirmation && !flags.wasConfirmed && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ Esperando tu confirmación para crear el proyecto
          </p>
        </div>
      )}
      
      {flags.wasConfirmed && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            ✅ Proyecto confirmado - Creando...
          </p>
        </div>
      )}
    </div>
  );
}
