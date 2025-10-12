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
      case "AREA_ASSIGNMENT":
        return "📁";  // 🆕 Icono para asignación a área
      case "AREA_REMOVAL":
        return "🗑️";  // 🆕 Icono para remoción de área
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
    <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[70px] sm:top-full mt-0 sm:mt-2 w-auto sm:w-96 max-h-[calc(100vh-90px)] sm:max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
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
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            Marcar leídas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading && notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-transparent mb-2"></div>
            <p className="text-xs sm:text-sm">Cargando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-sm sm:text-base">No tienes notificaciones</p>
            <p className="text-xs sm:text-sm mt-1">
              Te avisaremos cuando haya algo nuevo
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                !notification.read ? "bg-blue-50/50" : ""
              }`}
            >
              <div className="flex gap-2 sm:gap-3">
                {/* Icono */}
                <div className="flex-shrink-0 text-lg sm:text-xl leading-none mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4
                      className={`text-xs sm:text-sm font-medium leading-tight flex-1 ${
                        !notification.read ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {getRelativeTime(notification.createdAt)}
                      </span>
                      {/* Botón para eliminar notificación */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                          toast({
                            variant: "success",
                            title: "Notificación eliminada",
                            message: "La notificación ha sido eliminada",
                          });
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors group"
                        title="Eliminar notificación"
                      >
                        <X className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-sm text-gray-600 leading-snug">
                    {notification.message}
                  </p>

                  {/* Acciones específicas por tipo */}
                  <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                    {notification.type === "TEAM_INVITATION" &&
                      notification.data?.token && (
                        <>
                          <button
                            onClick={() => handleAcceptInvitation(notification)}
                            className="text-[11px] sm:text-xs px-3 sm:px-3 py-1.5 sm:py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 active:scale-95 transition-all font-medium flex items-center gap-1"
                          >
                            <Check className="h-3 w-3 sm:h-3 sm:w-3" />
                            <span>Aceptar</span>
                          </button>
                          <button
                            onClick={() => handleRejectInvitation(notification)}
                            className="text-[11px] sm:text-xs px-3 sm:px-3 py-1.5 sm:py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1"
                          >
                            <X className="h-3 w-3 sm:h-3 sm:w-3" />
                            <span>Rechazar</span>
                          </button>
                        </>
                      )}

                    {notification.actionUrl && (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="text-[11px] sm:text-xs px-3 sm:px-3 py-1.5 sm:py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1"
                      >
                        <span>Ver más</span>
                        <ExternalLink className="h-3 w-3 sm:h-3 sm:w-3" />
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
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => {
              router.push("/dashboard/notifications");
              onClose();
            }}
            className="w-full text-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}
