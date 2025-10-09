"use client";

import { Briefcase, Users, TrendingUp, Sparkles, Activity, Target } from 'lucide-react';
import Link from 'next/link';

export default function StatsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
            <p className="text-gray-500 mt-1">Analiza el rendimiento de tus proyectos y conexiones</p>
          </div>
        </div>

        {/* Stats Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Proyectos Totales</h3>
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-2">Crea tu primer proyecto</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Equipos Contactados</h3>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-2">Busca equipos con IA</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Conversaciones IA</h3>
                  <Sparkles className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-2">Empieza a usar el asistente</p>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Comienza a generar datos</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Las estadísticas aparecerán aquí cuando comiences a usar la plataforma. Crea proyectos, conecta con equipos y usa el asistente IA.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/dashboard/empresario"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Sparkles className="h-5 w-5" />
                    Usar Asistente IA
                  </Link>
                  <Link
                    href="/dashboard/empresario/proyectos"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Target className="h-5 w-5" />
                    Ver Proyectos
                  </Link>
                </div>
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Próximamente: Análisis Avanzado</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Estamos trabajando en métricas detalladas, gráficos interactivos y reportes personalizados para ayudarte a tomar mejores decisiones.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Análisis de rendimiento de proyectos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Métricas de conexión con equipos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Reportes exportables
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
