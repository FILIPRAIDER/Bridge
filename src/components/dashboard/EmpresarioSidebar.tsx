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
// Logo SVG simple para sidebar

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
    // Limpiar datos del chat antes de cerrar sesión
    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatProjectProgress');
    localStorage.removeItem('chatUserId');
    console.log('[EmpresarioSidebar] 🗑️ Datos del chat limpiados antes de logout');
    
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
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
              <defs>
                <linearGradient id="chrome-bg-emp" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8e8e8" />
                  <stop offset="25%" stopColor="#f8f8f8" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="75%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#d8d8d8" />
                </linearGradient>
                <linearGradient id="chrome-text-emp" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="50%" stopColor="#000000" />
                  <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>
                <filter id="chrome-shadow-emp">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                  <feOffset dx="0" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="32" height="32" rx="6" fill="url(#chrome-bg-emp)" stroke="#c0c0c0" strokeWidth="0.5"/>
              <rect x="1" y="1" width="30" height="15" rx="5" fill="white" opacity="0.3"/>
              <text x="16" y="23" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="900" fill="url(#chrome-text-emp)" textAnchor="middle" filter="url(#chrome-shadow-emp)">B</text>
            </svg>
            <span className="text-lg font-bold text-white tracking-wide">Bridge</span>
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
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
              <defs>
                <linearGradient id="chrome-bg-emp-desk" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8e8e8" />
                  <stop offset="25%" stopColor="#f8f8f8" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="75%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#d8d8d8" />
                </linearGradient>
                <linearGradient id="chrome-text-emp-desk" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="50%" stopColor="#000000" />
                  <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>
                <filter id="chrome-shadow-emp-desk">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                  <feOffset dx="0" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="32" height="32" rx="6" fill="url(#chrome-bg-emp-desk)" stroke="#c0c0c0" strokeWidth="0.5"/>
              <rect x="1" y="1" width="30" height="15" rx="5" fill="white" opacity="0.3"/>
              <text x="16" y="23" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="900" fill="url(#chrome-text-emp-desk)" textAnchor="middle" filter="url(#chrome-shadow-emp-desk)">B</text>
            </svg>
            <span className="text-lg font-bold text-white tracking-wide">Bridge</span>
          </div>
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
