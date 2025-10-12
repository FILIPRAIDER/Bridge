"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Target,
  Mail,
  User,
  Award,
  LogOut,
  X,
  Settings,
  UsersRound,
  FileCheck,
  Briefcase,
  LayoutGrid,
  FolderOpen,
} from "lucide-react";
import { useSession } from "@/store/session/useSession";
// Logo SVG simple para sidebar

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: "LIDER" | "ESTUDIANTE";
  isOpen?: boolean;
  onClose?: () => void;
  hasTeam?: boolean; // 🔥 NUEVO: Indicar si el usuario tiene equipo
}

// 🔥 MENÚ OPTIMIZADO - Sin redundancias
const LIDER_TABS = [
  { id: "overview", label: "Resumen", icon: Users },
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "manage-areas", label: "Gestionar Áreas", icon: LayoutGrid },
  { id: "manage-members", label: "Gestionar Miembros", icon: Settings },
  { id: "team-skills", label: "Skills del Equipo", icon: Target },
  { id: "invite", label: "Invitar Miembros", icon: UserPlus },
  { id: "invites", label: "Ver Invitaciones", icon: Mail },
];

const MIEMBRO_TABS = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "team", label: "Mi Equipo", icon: Users },
  { id: "my-area", label: "Mi Área", icon: FolderOpen },
  { id: "members", label: "Miembros del Equipo", icon: UsersRound },
];

export function Sidebar({
  activeTab,
  onTabChange,
  role,
  isOpen = false,
  onClose,
  hasTeam = true, // Por defecto true para no romper compatibilidad
}: SidebarProps) {
  const router = useRouter();
  const { clear } = useSession();
  
  // 🔥 FIX: Filtrar tabs que requieren equipo si no tiene equipo
  const allTabs = role === "LIDER" ? LIDER_TABS : MIEMBRO_TABS;
  const teamRequiredTabs = ["team", "members", "manage-members", "manage", "invite", "team-skills", "invites"];
  
  const tabs = hasTeam 
    ? allTabs 
    : allTabs.filter(tab => !teamRequiredTabs.includes(tab.id));

  const handleLogout = async () => {
    // Limpiar datos del chat antes de cerrar sesión
    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatProjectProgress');
    localStorage.removeItem('chatUserId');
    console.log('[Sidebar] 🗑️ Datos del chat limpiados antes de logout');
    
    clear(); // Limpiar Zustand antes
    await signOut({ callbackUrl: "/auth/login" }); // Usar callbackUrl para evitar errores
  };

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
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
                <linearGradient id="chrome-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8e8e8" />
                  <stop offset="25%" stopColor="#f8f8f8" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="75%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#d8d8d8" />
                </linearGradient>
                <linearGradient id="chrome-text" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="50%" stopColor="#000000" />
                  <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>
                <filter id="chrome-shadow">
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
              <rect width="32" height="32" rx="6" fill="url(#chrome-bg)" stroke="#c0c0c0" strokeWidth="0.5"/>
              <rect x="1" y="1" width="30" height="15" rx="5" fill="white" opacity="0.3"/>
              <text x="16" y="23" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="900" fill="url(#chrome-text)" textAnchor="middle" filter="url(#chrome-shadow)">B</text>
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
        <div className="hidden md:block p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
              <defs>
                <linearGradient id="chrome-bg-desk" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8e8e8" />
                  <stop offset="25%" stopColor="#f8f8f8" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="75%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#d8d8d8" />
                </linearGradient>
                <linearGradient id="chrome-text-desk" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="50%" stopColor="#000000" />
                  <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>
                <filter id="chrome-shadow-desk">
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
              <rect width="32" height="32" rx="6" fill="url(#chrome-bg-desk)" stroke="#c0c0c0" strokeWidth="0.5"/>
              <rect x="1" y="1" width="30" height="15" rx="5" fill="white" opacity="0.3"/>
              <text x="16" y="23" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="900" fill="url(#chrome-text-desk)" textAnchor="middle" filter="url(#chrome-shadow-desk)">B</text>
            </svg>
            <span className="text-lg font-bold text-white tracking-wide">Bridge</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => handleTabChange(tab.id)}
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

