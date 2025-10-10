"use client";

import { Menu, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { BridgeLogo } from "@/components/shared/BridgeLogo";

interface NavbarProps {
  onMenuClick: () => void;
}

const roleLabels: Record<string, string> = {
  EMPRESARIO: "Empresario",
  ESTUDIANTE: "Estudiante",
  LIDER: "Líder",
  ADMIN: "Administrador",
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Left side: Hamburger (mobile) o vacío (desktop) */}
      <div className="flex items-center gap-2">
        {/* Hamburger Button - Solo visible en mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo / Brand - Solo en mobile */}
        <div className="lg:hidden">
          <BridgeLogo size="sm" showText={true} />
        </div>
      </div>

      {/* Right side: Notifications + User Avatar */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Avatar */}
        <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center ring-2 ring-gray-200 overflow-hidden">
          {session?.user?.avatarUrl ? (
            <img
              src={session.user.avatarUrl}
              alt={session.user.name || "Usuario"}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-gray-500" />
          )}
        </div>

        {/* User Info */}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {session?.user?.name || "Usuario"}
          </p>
          <p className="text-xs text-gray-500">
            {roleLabels[session?.user?.role || ""] || session?.user?.role}
          </p>
        </div>
        
    
      </div>
    </nav>
  );
}
