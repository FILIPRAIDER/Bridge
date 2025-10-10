"use client";

import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Plus, ChevronRight, CheckCircle2, Edit3, Flag, XCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface Project {
  id: string;
  title: string;
  description: string;
  area: string;
  budget: number;
  budgetCurrency?: 'COP' | 'USD';
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'CANCELLED';
  city?: string;
  createdAt: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  totalProjects: number;
  onSelectProject: (projectId: string) => void;
  onCreateNew: () => void;
}

// Iconos por área
const areaIcons: Record<string, string> = {
  'Salud': '🏥',
  'Tecnología': '💻',
  'Educación': '📚',
  'Retail': '🛒',
  'Finanzas': '💰',
  'Alimentos': '🍽️',
  'Moda': '👔',
  'Transporte': '🚗',
  'Construcción': '🏗️',
  'Entretenimiento': '🎮',
  'Turismo': '✈️',
  'Agricultura': '🌾',
  'Default': '💼'
};

// Colores y estados
const statusConfig = {
  'ACTIVE': {
    label: 'Activo',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200'
  },
  'DRAFT': {
    label: 'Borrador',
    icon: Edit3,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200'
  },
  'COMPLETED': {
    label: 'Completado',
    icon: Flag,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  'CANCELLED': {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  }
};

export function ProjectSelector({ projects, totalProjects, onSelectProject, onCreateNew }: ProjectSelectorProps) {
  const getAreaIcon = (area: string) => {
    return areaIcons[area] || areaIcons['Default'];
  };

  return (
    <div className="my-4 space-y-3">
      {/* Header mensaje */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
      >
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">
            Tienes {totalProjects} proyecto{totalProjects !== 1 ? 's' : ''}.
          </span>{' '}
          Selecciona uno para continuar:
        </p>
      </motion.div>

      {/* Lista de proyectos */}
      <div className="space-y-3">
        {projects.map((project, index) => {
          const StatusIcon = statusConfig[project.status].icon;
          
          return (
            <motion.button
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectProject(project.id)}
              className="w-full text-left group"
            >
              <div className="relative flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                {/* Badge numerado */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  {/* Título y estado */}
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl flex-shrink-0">{getAreaIcon(project.area)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {project.title}
                      </h3>
                    </div>
                    <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[project.status].bgColor} ${statusConfig[project.status].color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig[project.status].label}
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Meta información */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-medium">{project.area}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        {formatCurrency(project.budget, project.budgetCurrency || 'USD')}
                      </span>
                    </div>
                    {project.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{project.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flecha */}
                <div className="flex-shrink-0">
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity pointer-events-none" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Botón crear nuevo */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: projects.length * 0.1 + 0.2 }}
        onClick={onCreateNew}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 group-hover:border-blue-500 flex items-center justify-center group-hover:scale-110 transition-all">
          <Plus className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
        </div>
        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
          Crear Nuevo Proyecto
        </span>
      </motion.button>
    </div>
  );
}
