"use client";

import { Briefcase, Plus, Search, Filter, Sparkles, Calendar, MapPin, Users, CheckCircle2, Clock, X, Edit, Target, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Loader } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/currency";

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  city: string | null;
  area: string | null;
  budget?: number | null;
  budgetCurrency?: 'COP' | 'USD';
  company: {
    id: string;
    name: string;
  };
  _count: {
    assignments: number;
  };
}

interface ApiResponse {
  data: Project[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
    sortBy: string;
    sortDir: string;
    includeDescription: boolean;
  };
}

export default function ProyectosPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (session?.user?.companyId) {
      loadProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.companyId]);

  const loadProjects = async () => {
    if (!session?.user?.companyId) return;
    
    try {
      setLoading(true);
      // ✅ Backend arregló el endpoint - ahora devuelve { data: [], meta: {} }
      const response = await api.get<ApiResponse>(
        `/projects?companyId=${session.user.companyId}&page=1&limit=50&sortBy=createdAt&sortDir=desc`
      );
      setProjects(response.data);
      console.log(`✅ Cargados ${response.data.length} proyectos (${response.meta.total} total)`);
    } catch (error) {
      console.error("Error loading projects:", error);
      // Graceful degradation: no crashear, mostrar vacío
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      OPEN: { label: "Abierto", color: "bg-blue-100 text-blue-700" },
      IN_PROGRESS: { label: "En Progreso", color: "bg-yellow-100 text-yellow-700" },
      DONE: { label: "Completado", color: "bg-green-100 text-green-700" },
      CANCELED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
    };
    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mis Proyectos</h1>
            <p className="text-gray-600 mt-1">Gestiona y crea nuevos proyectos</p>
          </div>
          <Link href="/dashboard/empresario" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <Plus className="h-5 w-5" />
            <span className="font-medium">Crear con IA</span>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Buscar proyectos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <Loader message="Cargando proyectos..." />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 shadow-sm">
              <Briefcase className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No se encontraron proyectos" : "No hay proyectos aún"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? "Intenta con otros términos de búsqueda"
                : "Usa el asistente de IA para crear tu primer proyecto y encontrar equipos perfectos."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/empresario" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all shadow-lg">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Crear Proyecto con IA</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left w-full"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                    {project.title}
                  </h3>
                  {getStatusBadge(project.status)}
                </div>
                <div className="ml-3">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Area/Sector */}
              {project.area && (
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Área:</span> {project.area}
                </p>
              )}

              {/* Footer Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                {project.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{project.city}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <Users className="w-3.5 h-3.5" />
                  <span>{project._count.assignments} equipo{project._count.assignments !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal/Drawer de Detalles */}
      <AnimatePresence>
        {selectedProject && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Drawer - Mobile (desde abajo) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Handle para drag (visual) */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProject.title}
                    </h2>
                    {getStatusBadge(selectedProject.status)}
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="space-y-4 mb-6">
                  {selectedProject.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Descripción
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}

                  {selectedProject.area && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Área
                      </h3>
                      <p className="text-sm text-gray-600">{selectedProject.area}</p>
                    </div>
                  )}

                  {selectedProject.city && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Ubicación
                      </h3>
                      <p className="text-sm text-gray-600">{selectedProject.city}</p>
                    </div>
                  )}

                  {selectedProject.budget && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Presupuesto
                      </h3>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(selectedProject.budget, selectedProject.budgetCurrency || 'COP', { showCurrencyName: true })}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Equipos Asignados
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedProject._count.assignments} equipo{selectedProject._count.assignments !== 1 ? 's' : ''} trabajando
                    </p>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Link
                    href="/dashboard/empresario"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Sparkles className="h-5 w-5" />
                    Buscar Más Equipos con IA
                  </Link>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                    <Edit className="h-5 w-5" />
                    Editar Proyecto
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Modal - Desktop (centrado) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="hidden lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {selectedProject.title}
                    </h2>
                    {getStatusBadge(selectedProject.status)}
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                <div className="space-y-6 mb-8">
                  {selectedProject.description && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Descripción del Proyecto
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    {selectedProject.area && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Área
                        </h3>
                        <p className="text-sm text-gray-600">{selectedProject.area}</p>
                      </div>
                    )}

                    {selectedProject.city && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Ubicación
                        </h3>
                        <p className="text-sm text-gray-600">{selectedProject.city}</p>
                      </div>
                    )}

                    {selectedProject.budget && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Presupuesto
                        </h3>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(selectedProject.budget, selectedProject.budgetCurrency || 'COP', { showCurrencyName: true })}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Equipos Asignados
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedProject._count.assignments} equipo{selectedProject._count.assignments !== 1 ? 's' : ''} trabajando
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Empresa
                      </h3>
                      <p className="text-sm text-gray-600">{selectedProject.company.name}</p>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-200">
                  <Link
                    href="/dashboard/empresario"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Sparkles className="h-5 w-5" />
                    Buscar Equipos
                  </Link>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                    <Edit className="h-5 w-5" />
                    Editar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}