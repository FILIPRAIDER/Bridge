import type {
  AIAssistantResponse,
  ConversationSummary,
  MeetingMinutes,
  TaskDetection,
  FilesSummary,
} from "@/types/ai-chat";
import { getSession } from "next-auth/react";

const AI_API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:4101";

class AIChatService {
  private baseUrl = `${AI_API_BASE_URL}/api/area-chat`;

  /**
   * 🔐 Obtener headers con autenticación
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      const session = await getSession();
      const token = (session as any)?.accessToken;

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log('✅ [aiChatService] Token agregado a la petición');
      } else {
        console.warn('⚠️ [aiChatService] No se encontró token de autenticación');
      }
    } catch (error) {
      console.error('❌ [aiChatService] Error obteniendo sesión:', error);
    }

    return headers;
  }

  /**
   * Consultar al asistente IA con una pregunta
   * ⚠️ ACTUALIZADO: Ahora requiere teamId
   * 🔐 ACTUALIZADO: Ahora envía token de autenticación
   */
  async askAssistant(teamId: string, areaId: string, question: string): Promise<AIAssistantResponse> {
    try {
      const url = `${this.baseUrl}/teams/${teamId}/areas/${areaId}/ask`;
      console.log('[aiChatService] Llamando a:', url);
      console.log('[aiChatService] Body:', { question });

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ question }),
      });

      console.log('[aiChatService] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[aiChatService] Error response:', errorText);
        
        let errorMessage = "Error consultando al asistente";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${errorText.substring(0, 100)}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[aiChatService] Respuesta exitosa:', data);
      return data;
    } catch (error) {
      console.error('[aiChatService] Error en askAssistant:', error);
      throw error;
    }
  }

  /**
   * Generar resumen de conversación
   * ⚠️ ACTUALIZADO: Ahora requiere teamId
   * 🔐 ACTUALIZADO: Ahora envía token de autenticación
   */
  async summarizeConversation(
    teamId: string,
    areaId: string,
    messageCount: number = 50
  ): Promise<ConversationSummary> {
    try {
      const url = `${this.baseUrl}/teams/${teamId}/areas/${areaId}/summarize`;
      console.log('[aiChatService] Llamando a:', url);
      console.log('[aiChatService] Body:', { messageCount });

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ messageCount }),
      });

      console.log('[aiChatService] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[aiChatService] Error response:', errorText);
        
        let errorMessage = "Error generando resumen";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${errorText.substring(0, 100)}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[aiChatService] Respuesta exitosa');
      return data;
    } catch (error) {
      console.error('[aiChatService] Error en summarizeConversation:', error);
      throw error;
    }
  }

  /**
   * Generar minuta de reunión
   * ⚠️ ACTUALIZADO: Ahora requiere teamId
   * 🔐 ACTUALIZADO: Ahora envía token de autenticación
   */
  async generateMeetingMinutes(
    teamId: string,
    areaId: string,
    startTime: string,
    endTime: string
  ): Promise<MeetingMinutes> {
    try {
      const url = `${this.baseUrl}/teams/${teamId}/areas/${areaId}/meeting-minutes`;
      console.log('[aiChatService] Llamando a:', url);
      console.log('[aiChatService] Body:', { startTime, endTime });

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ startTime, endTime }),
      });

      console.log('[aiChatService] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[aiChatService] Error response:', errorText);
        
        let errorMessage = "Error generando minuta";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${errorText.substring(0, 100)}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[aiChatService] Respuesta exitosa');
      return data;
    } catch (error) {
      console.error('[aiChatService] Error en generateMeetingMinutes:', error);
      throw error;
    }
  }

  /**
   * Detectar si un mensaje contiene una tarea
   * 🔐 ACTUALIZADO: Ahora envía token de autenticación
   */
  async detectTask(
    message: string,
    context?: { areaName: string; authorName: string }
  ): Promise<TaskDetection> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/messages/detect-task`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error detectando tarea");
    }

    return response.json();
  }

  /**
   * Obtener resumen de archivos del área
   * ⚠️ ACTUALIZADO: Ahora requiere teamId
   * 🔐 ACTUALIZADO: Ahora envía token de autenticación
   */
  async summarizeFiles(teamId: string, areaId: string): Promise<FilesSummary> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/teams/${teamId}/areas/${areaId}/files-summary`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error obteniendo resumen de archivos");
    }

    return response.json();
  }
}

export const aiChatService = new AIChatService();
