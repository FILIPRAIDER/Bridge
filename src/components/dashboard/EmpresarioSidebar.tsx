"use client";

import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  Briefcase,
  Users,
  TrendingUp,
  User,
  LogOut,
  X,
  Menu,
} from "lucide-react";

interface EmpresarioSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const TABS = [
  { id: "/dashboard/empresario", label: "Chat IA", icon: Sparkles },
  { id: "/dashboard/empresario/proyectos", label: "Mis Proyectos", icon: Briefcase },
  { id: "/dashboard/empresario/equipos", label: "Buscar Equipos", icon: Users },
  { id: "/dashboard/empresario/stats", label: "Estadísticas", icon: TrendingUp },
  { id: "/dashboard/empresario/profile", label: "Mi Perfil", icon: User },
];

export function EmpresarioSidebar({ isOpen = false, onClose }: EmpresarioSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    // Usar callbackUrl para evitar errores de hooks después del signOut
    await signOut({ callbackUrl: "/auth/login" });
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-black border-r border-gray-800 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Close button - solo en móvil */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-lg">
              <div className="w-4 h-4 bg-white rounded" />
            </div>
            <span className="text-xl font-bold text-white">Bridge</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Logo - solo en desktop */}
        <div className="hidden lg:block p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-lg">
              <div className="w-4 h-4 bg-white rounded" />
            </div>
            <span className="text-xl font-bold text-white">Bridge</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">Panel Empresario</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => handleNavigation(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-black font-medium shadow-sm"
                        : "text-gray-300 hover:bg-gray-900 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-gray-900 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
