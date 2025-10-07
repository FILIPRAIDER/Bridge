"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  MailX,
  Download,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { TeamInvite } from "@/types/api";

interface ViewInvitesProps {
  teamId: string;
}

export function ViewInvites({ teamId }: ViewInvitesProps) {
  const { show } = useToast();
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED"
  >("all");

  useEffect(() => {
    loadInvites();
  }, [teamId, filter]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const params =
        filter !== "all" ? `?status=${filter}` : "";
      const response = await api.get<TeamInvite[] | { data: TeamInvite[]; meta?: any }>(
        `/teams/${teamId}/invites${params}`
      );
      
      // El backend puede retornar array directo O {data: [], meta: {}}
      const invitesData = Array.isArray(response) ? response : response.data;
      setInvites(invitesData);
    } catch (error: any) {
      show({ message: error.message || "Error al cargar invitaciones", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (inviteId: string) => {
    try {
      await api.post(`/teams/${teamId}/invites/${inviteId}/cancel`);
      show({ message: "Invitación cancelada", variant: "success" });
      loadInvites();
    } catch (error: any) {
      show({ message: error.message || "Error al cancelar invitación", variant: "error" });
    }
  };

  const handleResend = async (inviteId: string) => {
    try {
      await api.post(`/teams/${teamId}/invites/${inviteId}/resend`);
      show({ message: "Invitación reenviada correctamente", variant: "success" });
      loadInvites();
    } catch (error: any) {
      show({ message: error.message || "Error al reenviar invitación", variant: "error" });
    }
  };

  const handleExpire = async (inviteId: string) => {
    try {
      await api.post(`/teams/${teamId}/invites/${inviteId}/expire`);
      show({ message: "Invitación expirada", variant: "success" });
      loadInvites();
    } catch (error: any) {
      show({ message: error.message || "Error al expirar invitación", variant: "error" });
    }
  };

  const handleExportCSV = async () => {
    try {
      window.open(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${teamId}/invites/export.csv`,
        "_blank"
      );
      show({ message: "Exportando invitaciones...", variant: "info" });
    } catch (error: any) {
      show({ message: error.message || "Error al exportar", variant: "error" });
    }
  };

  const getStatusIcon = (status: TeamInvite["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "ACCEPTED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "EXPIRED":
        return <MailX className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TeamInvite["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "ACCEPTED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "EXPIRED":
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros y export */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Invitaciones Enviadas
          </h2>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {["all", "PENDING", "ACCEPTED", "CANCELLED", "EXPIRED"].map((f) => (
            <button
              key={f}
              onClick={() =>
                setFilter(f as typeof filter)
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "all"
                ? "Todas"
                : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de invitaciones */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando invitaciones...</div>
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No hay invitaciones con este filtro
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(invite.status)}
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invite.status
                        )}`}
                      >
                        {invite.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Enviada:{" "}
                        {new Date(invite.sentAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        Expira:{" "}
                        {new Date(invite.expiresAt).toLocaleDateString(
                          "es-ES",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {invite.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleResend(invite.id)}
                        className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Reenviar"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(invite.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Cancelar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExpire(invite.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        title="Expirar"
                      >
                        <MailX className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {invite.status === "ACCEPTED" && invite.acceptedAt && (
                    <span className="text-xs text-gray-500">
                      Aceptada:{" "}
                      {new Date(invite.acceptedAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  )}
                  {invite.status === "CANCELLED" && invite.cancelledAt && (
                    <span className="text-xs text-gray-500">
                      Cancelada:{" "}
                      {new Date(invite.cancelledAt).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

