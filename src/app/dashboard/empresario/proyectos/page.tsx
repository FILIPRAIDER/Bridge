"use client";

import { Briefcase, Plus, Search, Filter, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProyectosPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 shadow-sm">
            <Briefcase className="h-10 w-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay proyectos aún</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Usa el asistente de IA para crear tu primer proyecto y encontrar equipos perfectos.
          </p>
          <Link href="/dashboard/empresario" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all shadow-lg">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Crear Proyecto con IA</span>
          </Link>
        </div>
      </div>
    </div>
  );
}