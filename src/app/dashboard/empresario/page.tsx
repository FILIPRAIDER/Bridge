"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Briefcase, Users, TrendingUp, Plus, Sparkles } from 'lucide-react';
import ChatIA from '@/components/chat/ChatIA';
import Link from 'next/link';

export default function EmpresarioDashboard() {
  const { data: session, status } = useSession();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'projects' | 'teams'>('overview');

  // Redirigir si no está autenticado o no es empresario
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

  const handleProjectCreated = (projectId: string) => {
    console.log('Proyecto creado:', projectId);
    // Aquí puedes agregar lógica para actualizar la lista de proyectos
    // Por ejemplo, revalidar datos o mostrar una notificación
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Empresario</h1>
                <p className="text-sm text-gray-500">Bienvenido, {session.user.name}</p>
              </div>
            </div>
            <Link
              href="/perfil"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">Mi Perfil</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          
          {/* Left Sidebar - Stats & Navigation */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Proyectos Activos</h3>
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">3</p>
                <p className="text-xs text-green-600 mt-1">+2 este mes</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Equipos Conectados</h3>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-xs text-blue-600 mt-1">4 disponibles</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Crecimiento</h3>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">+24%</p>
                <p className="text-xs text-gray-500 mt-1">vs. mes anterior</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard/empresario/proyectos"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Mis Proyectos</p>
                    <p className="text-xs text-gray-500">Ver y gestionar</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/empresario/equipos"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Equipos</p>
                    <p className="text-xs text-gray-500">Buscar talento</p>
                  </div>
                </Link>

                <Link
                  href="/perfil"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Mi Perfil</p>
                    <p className="text-xs text-gray-500">Editar información</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* AI Helper Tip */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Consejo del Asistente</h3>
                  <p className="text-sm text-gray-300">
                    Usa el chat para crear proyectos detallados y encontrar los mejores equipos para tus necesidades.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - AI Chat */}
          <div className="lg:col-span-2 h-full">
            <ChatIA
              userId={session.user.id}
              companyId={(session.user as any).companyId}
              onProjectCreated={handleProjectCreated}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
