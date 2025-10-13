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

    const response = await fetch(`${API_BASE_URL}/api/telegram/link`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error vinculando grupo de Telegram");
    }

    return response.json();
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
   */
  static async getGroupByAreaId(areaId: string): Promise<TelegramGroup | null> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/telegram/groups/area/${areaId}`, {
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
   */
  static async getAreaMembers(areaId: string): Promise<TelegramMember[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/areas/${areaId}/members`, {
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
   * Valida un código de vinculación generado por el bot
   */
  static async validateLinkCode(code: string, areaId: string): Promise<{
    valid: boolean;
    chatId?: string;
    chatTitle?: string;
    chatType?: 'group' | 'supergroup' | 'channel';
    message?: string;
  }> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/telegram/validate-code`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code, areaId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        valid: false,
        message: error.message || "Código inválido",
      };
    }

    return response.json();
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
