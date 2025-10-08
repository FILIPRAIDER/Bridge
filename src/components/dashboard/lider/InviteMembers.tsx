"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, Search, User, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";
import { sendTeamInvitation } from "@/actions/team-invitations";
import { api } from "@/lib/api";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.literal("MIEMBRO"),
});

type InviteForm = z.infer<typeof inviteSchema>;

interface UserSuggestion {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface InviteMembersProps {
  teamId: string;
  onInviteSent: () => void;
  teamName?: string; // 🔥 NUEVO: Nombre del equipo opcional
}

export function InviteMembers({ teamId, onInviteSent, teamName }: InviteMembersProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const { show } = useToast();
  
  // Autocomplete states
  const [emailInput, setEmailInput] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "MIEMBRO",
    },
  });

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar usuarios por email con debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (emailInput.length < 2) {
        setUserSuggestions([]);
        return;
      }

      try {
        setSearchLoading(true);
        // Buscar usuarios por email
        const response = await api.get<UserSuggestion[]>(
          `/users/search?email=${encodeURIComponent(emailInput)}&role=ESTUDIANTE&limit=10`
        );
        setUserSuggestions(Array.isArray(response) ? response : []);
        setIsDropdownOpen(true);
        setHighlightedIndex(0);
      } catch (error) {
        console.error("Error searching users:", error);
        setUserSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [emailInput]);

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || userSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < userSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < userSuggestions.length) {
          handleSelectUser(userSuggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        break;
    }
  };

  const handleSelectUser = (user: UserSuggestion) => {
    setSelectedUser(user);
    setEmailInput(user.email);
    setValue("email", user.email);
    setIsDropdownOpen(false);
    setUserSuggestions([]);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setEmailInput("");
    setValue("email", "");
    inputRef.current?.focus();
  };

  const onSubmit = async () => {
    if (!session?.user?.id) {
      show({
        variant: "error",
        message: "Sesión no válida. Por favor, inicia sesión nuevamente."
      });
      return;
    }

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      show({
        variant: "warning",
        message: "Por favor, ingresa un email válido"
      });
      return;
    }

    startTransition(async () => {
      // ✅ Usar Server Action con datos de la sesión
      const result = await sendTeamInvitation({
        teamId,
        email,
        role: "MIEMBRO",
        byUserId: session.user.id,
        expiresInDays: 7,
        inviterName: session.user.name || undefined, // 🔥 Pasar nombre desde sesión
        teamName: teamName || undefined               // 🔥 Pasar nombre del equipo
      });

      if (result.success) {
        show({
          variant: "success",
          message: `✅ Invitación enviada exitosamente a ${email}`
        });
        
        // Limpiar formulario
        setEmailInput("");
        setSelectedUser(null);
        setValue("email", "");
        reset();
        onInviteSent();
      } else {
        // Mensajes de error más específicos
        let errorMessage = result.error || "Error al enviar invitación";
        
        if (errorMessage.includes("ya existe") || errorMessage.includes("pendiente")) {
          errorMessage = "Ya existe una invitación pendiente para este email";
        } else if (errorMessage.includes("miembro")) {
          errorMessage = "Este usuario ya es miembro del equipo";
        } else if (errorMessage.includes("líder") || errorMessage.includes("lider")) {
          errorMessage = "No tienes permisos de líder para enviar invitaciones";
        }
        
        show({
          variant: "error",
          message: `❌ ${errorMessage}`
        });
      }
    });
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
          <div className="relative">
            <label htmlFor="email" className="label">
              Email del invitado
            </label>
            
            {selectedUser ? (
              // Usuario seleccionado
              <div className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedUser.name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="flex-shrink-0 p-1 hover:bg-blue-100 rounded transition-colors"
                  disabled={isPending}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ) : (
              // Input de búsqueda
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="input pl-10 pr-10"
                    placeholder="Buscar por email... (ej: juan@ejemplo.com)"
                    disabled={isPending}
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Dropdown de sugerencias */}
                {isDropdownOpen && userSuggestions.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                  >
                    {userSuggestions.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          index === highlightedIndex ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name || "Usuario sin nombre"}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {isDropdownOpen && !searchLoading && emailInput.length >= 2 && userSuggestions.length === 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
                  >
                    <p className="text-sm text-gray-500 text-center">
                      No se encontraron usuarios con ese email
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      Puedes escribir el email completo manualmente
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              💡 Empieza a escribir el email y selecciona de la lista
            </p>
          </div>

          <div>
            <label htmlFor="role" className="label">
              Rol
            </label>
            <input
              type="text"
              value="MIEMBRO"
              disabled
              className="input bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">
              Los miembros pueden gestionar su perfil y ver información del
              equipo.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-dark inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {isPending ? "Enviando..." : "Enviar Invitación"}
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

