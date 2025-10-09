"use client";

import { Briefcase, Plus, Search, Filter, Sparkles, Calendar, MapPin, Users, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Loader } from "@/components/ui";

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  city: string | null;
  area: string | null;
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
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
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
                  <Link
                    href={`/dashboard/empresario/proyectos/${project.id}`}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}