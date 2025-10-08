"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.literal("MIEMBRO"),
});

type InviteForm = z.infer<typeof inviteSchema>;

interface InviteMembersProps {
  teamId: string;
  onInviteSent: () => void;
}

export function InviteMembers({ teamId, onInviteSent }: InviteMembersProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "MIEMBRO",
    },
  });

  const onSubmit = async (data: InviteForm) => {
    if (!session?.user?.id) {
      toast.error("Sesión no válida. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      setLoading(true);
      
      // Agregar byUserId al payload
      const payload = {
        ...data,
        byUserId: session.user.id,
      };
      
      console.log("Sending invite with payload:", payload);
      await api.post(`/teams/${teamId}/invites`, payload);
      
      toast.success("Invitación enviada correctamente");
      reset();
      onInviteSent();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error(error.message || "Error al enviar invitación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Invitar Nuevo Miembro
        </h2>
        <p className="text-gray-600 mb-6">
          Envía una invitación por email para que un nuevo miembro se una al
          equipo. Recibirán un enlace único para aceptar la invitación.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              Email del invitado
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              className="input"
              placeholder="nombre@ejemplo.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="label">
              Rol
            </label>
            <select
              {...register("role")}
              id="role"
              className="input"
              disabled={loading}
            >
              <option value="MIEMBRO">Miembro</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Los miembros pueden gestionar su perfil y ver información del
              equipo.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-dark inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {loading ? "Enviando..." : "Enviar Invitación"}
          </button>
        </form>
      </div>

      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          📧 ¿Cómo funciona?
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• El invitado recibirá un email con un enlace único</li>
          <li>• El enlace expira en 7 días</li>
          <li>
            • Puedes ver el estado de todas las invitaciones en la pestaña
            &quot;Ver Invitaciones&quot;
          </li>
          <li>• Puedes cancelar o reenviar invitaciones pendientes</li>
        </ul>
      </div>
    </div>
  );
}

