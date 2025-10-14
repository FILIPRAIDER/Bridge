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
   * Carga el grupo vinculado al área (silencia 404 mientras el backend no esté listo)
   */
  const fetchGroup = async () => {
    if (!areaId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await TelegramService.getGroupByAreaId(areaId);
      setGroup(data);
    } catch (err: any) {
      // Silenciamos el error 404 - el backend aún no tiene estos endpoints
      if (!err.message?.includes('404') && !err.message?.includes('Not Found')) {
        console.error("Error fetching Telegram group:", err);
        setError(err.message || "Error cargando grupo de Telegram");
      }
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
   * Valida un código de vinculación
   */
  const validateCode = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await TelegramService.validateLinkCode(code, areaId, teamId);
      
      if (!result.valid) {
        throw new Error(result.message || "Código inválido");
      }

      // Si fue exitoso, recargar el grupo
      await fetchGroup();

      return result;
    } catch (err: any) {
      console.error("Error validating link code:", err);
      const errorMsg = err.message || "Código inválido";
      setError(errorMsg);
      toast.error(errorMsg);
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
    validateCode,
    refresh,
    isLinked: !!group,
  };
}
