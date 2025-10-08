"use client";

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Briefcase, Users, TrendingUp, Sparkles, User, LogOut, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ProyectosPage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'EMPRESARIO') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-gray-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Bridge</h1>
              <p className="text-xs text-gray-400">Panel Empresario</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard/empresario"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Chat IA</span>
          </Link>

          <Link
            href="/dashboard/empresario/proyectos"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white"
          >
            <Briefcase className="h-5 w-5" />
            <span className="font-medium">Mis Proyectos</span>
          </Link>

          <Link
            href="/dashboard/empresario/equipos"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">Buscar Equipos</span>
          </Link>

          <Link
            href="/dashboard/empresario/stats"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Estadísticas</span>
          </Link>

          <Link
            href="/perfil"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="font-medium">Mi Perfil</span>
          </Link>
        </nav>

        {/* User Info + Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Proyectos</h1>
              <p className="text-gray-500 mt-1">Gestiona y crea nuevos proyectos</p>
            </div>
            <Link
              href="/dashboard/empresario"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Crear con IA
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5" />
              Filtros
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Empty State */}
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay proyectos aún</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Usa el asistente de IA para crear tu primer proyecto y encontrar equipos perfectos para tus necesidades.
              </p>
              <Link
                href="/dashboard/empresario"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                Crear Proyecto con IA
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
