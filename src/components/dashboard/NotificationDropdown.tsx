"use client";

import { useRouter } from "next/navigation";
import { Clock, Check, X, ExternalLink, Bell } from "lucide-react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import type { Notification } from "@/stores/useNotificationStore";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const { show: toast } = useToast();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "TEAM_INVITATION":
        return "🟢";
      case "INVITATION_ACCEPTED":
        return "✅";
      case "INVITATION_REJECTED":
        return "❌";
      case "TEAM_MATCH":
        return "🔵";
      case "NEW_MEMBER":
        return "👥";
      case "ROLE_CHANGE":
        return "⭐";
      case "REMINDER":
        return "⏰";
      default:
        return "🔔";
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Si tiene acción URL, navegar
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const handleAcceptInvitation = async (notification: Notification) => {
    if (!notification.data?.token) return;

    try {
      await api.post(
        `/teams/invites/${notification.data.token}/accept`,
        {}
      );

      toast({
        variant: "success",
        title: "¡Invitación aceptada!",
        message: `Te has unido a ${notification.data.teamName || "el equipo"}`,
      });

      // Remover notificación y cerrar
      removeNotification(notification.id);
      onClose();

      // Redirigir al dashboard
      router.push("/dashboard/miembro");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        message: error.message || "No se pudo aceptar la invitación",
      });
    }
  };

  const handleRejectInvitation = async (notification: Notification) => {
    if (!notification.data?.token) return;

    try {
      await api.post(
        `/teams/invites/${notification.data.token}/reject`,
        {}
      );

      toast({
        variant: "success",
        title: "Invitación rechazada",
        message: "Has rechazado la invitación",
      });

      // Remover notificación
      removeNotification(notification.id);
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        message: error.message || "No se pudo rechazar la invitación",
      });
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          Notificaciones
          {unreadCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Marcar todas leídas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="flex-1 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-transparent mb-2"></div>
            <p className="text-sm">Cargando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No tienes notificaciones</p>
            <p className="text-sm mt-1">
              Te avisaremos cuando haya algo nuevo
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                !notification.read ? "bg-blue-50/50" : ""
              }`}
            >
              <div className="flex gap-3">
                {/* Icono */}
                <div className="flex-shrink-0 text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-sm font-medium ${
                        !notification.read ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getRelativeTime(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>

                  {/* Acciones específicas por tipo */}
                  <div className="mt-3 flex gap-2">
                    {notification.type === "TEAM_INVITATION" &&
                      notification.data?.token && (
                        <>
                          <button
                            onClick={() => handleAcceptInvitation(notification)}
                            className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRejectInvitation(notification)}
                            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Rechazar
                          </button>
                        </>
                      )}

                    {notification.actionUrl && (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-1"
                      >
                        Ver más
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              router.push("/dashboard/notifications");
              onClose();
            }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}
