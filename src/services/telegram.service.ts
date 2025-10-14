// src/services/telegram.service.ts

import { getSession } from "next-auth/react";
import type {
  TelegramGroup,
  LinkTelegramGroupRequest,
  LinkTelegramGroupResponse,
  SendTelegramInvitesRequest,
  SendTelegramInvitesResponse,
  AreaMessage,
  TelegramMember,
} from "@/types/telegram";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

/**
 * Servicio para manejar operaciones de Telegram
 */
export class TelegramService {
  /**
   * Obtiene headers de autenticación con JWT
   */
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const token = (session as any)?.accessToken;

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }

  // ============================================
  // GROUP MANAGEMENT
  // ============================================

  /**
   * Vincula un grupo de Telegram con un área
   */
  static async linkGroup(data: LinkTelegramGroupRequest): Promise<LinkTelegramGroupResponse> {
    const headers = await this.getAuthHeaders();
    
    console.log('[TelegramService] linkGroup - URL:', `${API_BASE_URL}/api/telegram/link`);
    console.log('[TelegramService] linkGroup - Data:', data);
    console.log('[TelegramService] linkGroup - Headers:', headers);

    const response = await fetch(`${API_BASE_URL}/api/telegram/link`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    console.log('[TelegramService] linkGroup - Response status:', response.status);

    // ✅ CASO ESPECIAL: 409 = Área ya tiene grupo vinculado
    if (response.status === 409) {
      console.log('[TelegramService] linkGroup - Área ya vinculada (409), obteniendo grupo existente...');
      
      try {
        const errorData = await response.json();
        console.log('[TelegramService] linkGroup - Error 409 data:', errorData);
        
        // Obtener el grupo existente
        const existingGroup = await this.getGroupByAreaId(data.areaId);
        
        if (existingGroup) {
          console.log('[TelegramService] linkGroup - Grupo existente encontrado:', existingGroup);
          // Retornar como éxito con el grupo existente
          return {
            success: true,
            group: existingGroup,
            message: "Grupo ya vinculado",
            alreadyLinked: true, // Flag especial
          } as LinkTelegramGroupResponse & { alreadyLinked?: boolean };
        } else {
          throw new Error("El área está vinculada pero no se pudo obtener el grupo");
        }
      } catch (err: any) {
        console.error('[TelegramService] linkGroup - Error obteniendo grupo existente:', err);
        throw new Error("Esta área ya tiene un grupo vinculado pero no se pudo obtener la información");
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TelegramService] linkGroup - Error response:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        // Usar el mensaje del backend si existe
        const errorMessage = error.message || error.error || "Error vinculando grupo";
        throw new Error(errorMessage);
      } catch (e) {
        // Si no se puede parsear el JSON, mostrar el texto raw
        if (e instanceof Error && e.message !== errorText) {
          throw e; // Re-lanzar el error parseado
        }
        throw new Error(errorText || "Error vinculando grupo");
      }
    }

    const result = await response.json();
    console.log('[TelegramService] linkGroup - Success result:', result);
    console.log('[TelegramService] linkGroup - result.group:', result.group);
    console.log('[TelegramService] linkGroup - result keys:', Object.keys(result));
    
    // Si el backend retorna el grupo en una estructura diferente, adaptarlo
    if (!result.group && result.data) {
      console.log('[TelegramService] Adaptando respuesta: result.data existe');
      return { success: true, group: result.data, message: result.message };
    }
    
    return result;
  }

  /**
   * Desvincula un grupo de Telegram
   */
  static async unlinkGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/telegram/groups/${groupId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error desvinculando grupo");
    }

    return response.json();
  }

  /**
   * Obtiene el grupo de Telegram vinculado a un área
   * ✅ CORREGIDO: Backend siempre retorna 200 OK con { ok: true, group: null } cuando no existe
   */
  static async getGroupByAreaId(areaId: string): Promise<TelegramGroup | null> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/telegram/groups/area/${areaId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error obteniendo grupo");
    }

    const data = await response.json();
    // Backend retorna { ok: true, group: null } cuando no existe grupo
    // No es un error, simplemente el área no tiene grupo vinculado
    return data.group || null;
  }

  /**
   * Obtiene información de un grupo por chatId
   */
  static async getGroupByChatId(chatId: string): Promise<TelegramGroup | null> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/telegram/groups/chat/${chatId}`, {
      method: "GET",
      headers,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error obteniendo grupo");
    }

    const data = await response.json();
    return data.group;
  }

  // ============================================
  // INVITATIONS
  // ============================================

  /**
   * Envía invitaciones por email a miembros del equipo
   */
  static async sendInvites(data: SendTelegramInvitesRequest): Promise<SendTelegramInvitesResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/telegram/invites/send`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error enviando invitaciones");
    }

    return response.json();
  }

  /**
   * Obtiene lista de miembros del área con estado de invitación
   * ✅ CORREGIDO: Usa /teams sin /api (según indicaciones del backend)
   */
  static async getAreaMembers(teamId: string, areaId: string): Promise<TelegramMember[]> {
    const headers = await this.getAuthHeaders();

    // ⚠️ IMPORTANTE: Este endpoint NO tiene /api en la ruta
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/areas/${areaId}/members`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error obteniendo miembros");
    }

    const data = await response.json();
    return data.members;
  }

  // ============================================
  // MESSAGES
  // ============================================

  /**
   * Obtiene mensajes de un área (web + telegram)
   */
  static async getAreaMessages(
    areaId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AreaMessage[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/areas/${areaId}/messages?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error obteniendo mensajes");
    }

    const data = await response.json();
    return data.messages;
  }

  /**
   * Envía un mensaje desde la web (también se sincroniza con Telegram)
   */
  static async sendMessage(
    areaId: string,
    content: string,
    replyToId?: string
  ): Promise<AreaMessage> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/areas/${areaId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content,
        replyToId,
        source: "web",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error enviando mensaje");
    }

    const data = await response.json();
    return data.message;
  }

  // ============================================
  // LINK CODE VALIDATION
  // ============================================

  /**
   * Valida un código de vinculación Y vincula el grupo
   * El bot de Telegram genera el código cuando el usuario escribe /vincular
   * El usuario copia ese código y lo ingresa aquí para vincular el grupo
   */
  static async validateAndLinkWithCode(code: string, areaId: string, teamId: string): Promise<{
    success: boolean;
    group?: TelegramGroup;
    message?: string;
    alreadyLinked?: boolean;
  }> {
    try {
      console.log('[TelegramService] validateAndLinkWithCode llamado con:', { code, areaId, teamId });
      
      // Usar el endpoint de link con el código
      const result = await this.linkGroup({
        code,
        areaId,
        teamId,
      }) as LinkTelegramGroupResponse & { alreadyLinked?: boolean };

      console.log('[TelegramService] Vinculación exitosa - result completo:', result);
      console.log('[TelegramService] result.group:', result.group);
      console.log('[TelegramService] result.data:', (result as any).data);
      console.log('[TelegramService] result.alreadyLinked:', result.alreadyLinked);
      console.log('[TelegramService] result keys:', Object.keys(result));
      
      // El backend puede retornar el grupo en diferentes formatos
      const group = result.group || (result as any).data || null;
      console.log('[TelegramService] Grupo extraído:', group);
      
      return {
        success: true,
        group: group,
        message: result.message || "Grupo vinculado correctamente",
        alreadyLinked: result.alreadyLinked,
      };
    } catch (error: any) {
      console.error('[TelegramService] Error en validateAndLinkWithCode:', error);
      return {
        success: false,
        message: error.message || "Código no encontrado. Verifica que sea correcto.",
      };
    }
  }

  // ============================================
  // BOT STATUS
  // ============================================

  /**
   * Verifica si el bot está activo y funcionando
   */
  static async checkBotStatus(): Promise<{
    active: boolean;
    username: string;
    message?: string;
  }> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/telegram/bot/status`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return {
        active: false,
        username: "",
        message: "Bot no disponible",
      };
    }

    return response.json();
  }
}
