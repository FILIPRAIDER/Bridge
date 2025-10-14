// src/hooks/useTelegramGroup.ts

import { useState, useEffect } from "react";
import { TelegramService } from "@/services/telegram.service";
import type { TelegramGroup } from "@/types/telegram";
import { toast } from "@/components/ui/toast";

/**
 * Hook para gestionar grupos de Telegram vinculados a áreas
 */
export function useTelegramGroup(areaId: string, teamId?: string) {
  const [group, setGroup] = useState<TelegramGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga el grupo vinculado al área
   * ✅ CORREGIDO: Backend retorna { ok: true, group: null } cuando no hay grupo, no es error
   */
  const fetchGroup = async () => {
    if (!areaId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await TelegramService.getGroupByAreaId(areaId);
      // data puede ser null y eso está bien - significa que no hay grupo vinculado
      setGroup(data);
    } catch (err: any) {
      // Solo errores reales (conexión, etc.)
      console.error("Error fetching Telegram group:", err);
      setError(err.message || "Error cargando grupo de Telegram");
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vincula un nuevo grupo
   */
  const linkGroup = async (
    chatId: string,
    chatTitle: string,
    chatType: 'group' | 'supergroup' | 'channel',
    teamId: string,
    inviteLink?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await TelegramService.linkGroup({
        chatId,
        chatTitle,
        chatType,
        areaId,
        teamId,
        inviteLink,
      });

      if (response.success) {
        setGroup(response.group);
        toast.success("Grupo vinculado exitosamente");
        return response.group;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      console.error("Error linking Telegram group:", err);
      const errorMsg = err.message || "Error vinculando grupo";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Desvincula el grupo actual
   */
  const unlinkGroup = async () => {
    if (!group) return;

    setLoading(true);
    setError(null);

    try {
      const response = await TelegramService.unlinkGroup(group.id);

      if (response.success) {
        setGroup(null);
        toast.success("Grupo desvinculado");
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      console.error("Error unlinking Telegram group:", err);
      const errorMsg = err.message || "Error desvinculando grupo";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valida un código de vinculación Y vincula el grupo
   * El código es generado por el bot de Telegram cuando el usuario escribe /vincular
   */
  const validateAndLinkCode = async (code: string) => {
    if (!teamId) {
      throw new Error("TeamId es requerido");
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useTelegramGroup] Intentando vincular con código:', code);
      const result = await TelegramService.validateAndLinkWithCode(code, areaId, teamId);
      console.log('[useTelegramGroup] Resultado:', result);
      
      // ✅ CORREGIDO: Verificar success antes de lanzar error
      if (!result.success) {
        // Es un error real del backend
        const errorMsg = result.message || "Código no encontrado. Verifica que sea correcto.";
        setError(errorMsg);
        // ❌ NO mostrar toast aquí - dejar que el modal lo maneje
        throw new Error(errorMsg);
      }

      // ✅ Éxito - actualizar el grupo local
      if (result.group) {
        setGroup(result.group);
        toast.success("¡Grupo vinculado exitosamente!");
        return result.group;
      } else {
        console.error("[useTelegramGroup] Respuesta exitosa pero sin grupo. Result completo:", result);
        console.error("[useTelegramGroup] result.success:", result.success);
        console.error("[useTelegramGroup] result.group:", result.group);
        console.error("[useTelegramGroup] result.message:", result.message);
        throw new Error("El backend respondió correctamente pero no retornó información del grupo. Verifica la configuración del backend.");
      }
    } catch (err: any) {
      console.error("[useTelegramGroup] Error completo:", err);
      // Re-lanzar el error para que el componente lo maneje
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresca el grupo
   */
  const refresh = () => {
    fetchGroup();
  };

  // Cargar grupo al montar
  useEffect(() => {
    fetchGroup();
  }, [areaId]);

  return {
    group,
    loading,
    error,
    linkGroup,
    unlinkGroup,
    validateAndLinkCode,
    refresh,
    isLinked: !!group,
  };
}
