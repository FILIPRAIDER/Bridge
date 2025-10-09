"use client";

import { useState } from 'react';
import { Search, Filter, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EquiposPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buscar Equipos</h1>
            <p className="text-gray-500 mt-1">Encuentra el talento perfecto para tus proyectos</p>
          </div>
          <Link
            href="/dashboard/empresario"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-5 w-5" />
            Buscar con IA
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipos por habilidades, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Teams List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Empty State */}
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Encuentra equipos con IA</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto px-4">
              Usa nuestro asistente inteligente para describir tu proyecto y encontrar los equipos más adecuados según tus necesidades específicas.
            </p>
            <Link
              href="/dashboard/empresario"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              Buscar con Asistente IA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
