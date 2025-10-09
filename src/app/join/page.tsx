"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Crown,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface InviteData {
  token: string;
  email: string;
  role: "LIDER" | "MIEMBRO";
  status: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  canAccept: boolean;
  team: {
    id: string;
    name: string;
    description?: string;
    area?: string;
    members: any[];
  };
  inviter: {
    name: string;
    email: string;
  };
  memberCount: number;
}

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();
  const token = searchParams.get("token");

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token de invitación no proporcionado");
      setLoading(false);
      return;
    }

    fetchInviteInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchInviteInfo = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Codificar el token para la URL del API
      const encodedToken = encodeURIComponent(token);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/invites/${encodedToken}/info`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Invitación no encontrada");
        }
        throw new Error("Error al cargar la invitación");
      }

      const data: InviteData = await response.json();

      // Validar si puede aceptarse
      if (!data.canAccept) {
        if (data.isExpired) {
          throw new Error("Esta invitación ha expirado");
        } else if (data.status === "ACCEPTED") {
          throw new Error("Ya aceptaste esta invitación");
        } else if (data.status === "CANCELED") {
          throw new Error("Esta invitación fue cancelada");
        } else {
          throw new Error("Esta invitación no está disponible");
        }
      }

      setInviteData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);

    try {
      // Codificar el token para la URL del API
      const encodedToken = encodeURIComponent(token);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/invites/${encodedToken}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al aceptar invitación");
      }

      await response.json();

      show({
        message: "¡Te has unido al equipo exitosamente!",
        variant: "success",
      });

      // Redirigir al login si no está autenticado, o al dashboard si lo está
      setTimeout(() => {
        router.push("/auth/login?joined=true");
      }, 1500);
    } catch (err) {
      show({
        message: err instanceof Error ? err.message : "Error al aceptar invitación",
        variant: "error",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = () => {
    router.push("/");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitación No Disponible
          </h1>
          <p className="text-gray-600 mb-6">{error || "Error desconocido"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Success state - Show invitation
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700">
              <div className="h-6 w-6 bg-white rounded"></div>
            </div>
            <span className="text-3xl font-bold text-white">Bridge</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Invitación a Equipo
          </h1>
          <p className="text-gray-300">
            Has sido invitado a unirte a un equipo
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Team Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              {inviteData.team.name}
            </h2>

            {inviteData.team.description && (
              <p className="text-center text-gray-600 mb-4">
                {inviteData.team.description}
              </p>
            )}

            <div className="text-center mb-4">
              <p className="text-gray-700">
                <strong>{inviteData.inviter.name}</strong> te ha invitado a
                formar parte de este equipo
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {inviteData.inviter.email}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Miembros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inviteData.memberCount}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <Crown className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tu rol</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inviteData.role === "LIDER" ? "Líder" : "Miembro"}
                </p>
              </div>
            </div>

            {inviteData.team.area && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4" />
                <span>Área: {inviteData.team.area}</span>
              </div>
            )}

            {inviteData.message && (
              <blockquote className="border-l-4 border-gray-900 pl-4 py-2 italic text-gray-700 bg-white rounded-r-lg">
                &quot;{inviteData.message}&quot;
              </blockquote>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              ¿Qué podrás hacer?
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Colaborar con otros miembros del equipo</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Acceder a proyectos y recursos compartidos</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Participar en la gestión del equipo</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Compartir tu perfil profesional con el equipo</span>
              </li>
            </ul>
          </div>

          {/* Expiration info */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Calendar className="h-4 w-4" />
            <span>
              Expira el:{" "}
              {new Date(inviteData.expiresAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Aceptando...
                </>
              ) : (
                <>
                  Aceptar Invitación
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <button
              onClick={handleReject}
              disabled={accepting}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>

          {/* Email info */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Correo de invitación:{" "}
            <strong className="text-gray-700">{inviteData.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Cargando invitación...</p>
        </div>
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
