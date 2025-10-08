"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const { unreadCount, fetchNotifications, setUserId } = useNotificationStore();

  // Establecer userId cuando la sesión esté disponible
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setUserId(session.user.id);
    } else {
      setUserId(null);
    }
  }, [status, session?.user?.id, setUserId]);

  // Polling cada 30 segundos solo si está autenticado
  useEffect(() => {
    // Solo cargar si el usuario está autenticado
    if (status !== "authenticated" || !session?.user?.id) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fetchNotifications, status, session?.user?.id]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />

        {/* Badge con contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}
