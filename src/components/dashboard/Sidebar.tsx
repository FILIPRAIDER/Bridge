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
} from "lucide-react";
import { useSession } from "@/store/session/useSession";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: "LIDER" | "ESTUDIANTE";
  isOpen?: boolean;
  onClose?: () => void;
}

const LIDER_TABS = [
  { id: "overview", label: "Resumen", icon: Users },
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "manage-members", label: "Gestionar Miembros", icon: Settings },
  { id: "manage", label: "Gestionar Equipo", icon: Settings },
  { id: "invite", label: "Invitar Miembros", icon: UserPlus },
  { id: "my-skills", label: "Mis Skills", icon: Award },
  { id: "team-skills", label: "Skills del Equipo", icon: Target },
  { id: "invites", label: "Ver Invitaciones", icon: Mail },
];

const MIEMBRO_TABS = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "team", label: "Mi Equipo", icon: Users },
  { id: "members", label: "Miembros del Equipo", icon: UsersRound },
  { id: "skills", label: "Mis Skills", icon: Award },
];

export function Sidebar({
  activeTab,
  onTabChange,
  role,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const { clear } = useSession();
  const tabs = role === "LIDER" ? LIDER_TABS : MIEMBRO_TABS;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    clear();
    router.push("/auth/login");
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
          <p className="mt-1 text-sm text-gray-400">
            {role === "LIDER" ? "Panel del Líder" : "Panel del Miembro"}
          </p>
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

