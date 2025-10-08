/**
 * Cliente para comunicarse con el AI-API
 */

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:4101';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  sessionId?: string | null;
  context?: {
    projectId?: string;
    companyId?: string;
    userId?: string;
  };
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  toolCalls: Array<{
    name: string;
    arguments: string;
  }>;
  toolResults: Array<{
    tool: string;
    success: boolean;
    data: any;
  }>;
  context: Record<string, any>;
  timestamp: string;
}

export interface SessionResponse {
  sessionId: string;
  messages: ChatMessage[];
  context: Record<string, any>;
  createdAt: string;
  lastActivity: string;
}

/**
 * Enviar mensaje al chat IA
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${AI_API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Obtener sesión de chat
 */
export async function getChatSession(sessionId: string): Promise<SessionResponse> {
  const response = await fetch(`${AI_API_URL}/chat/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Eliminar sesión de chat
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const response = await fetch(`${AI_API_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

/**
 * Obtener estadísticas del chat (opcional, para debugging)
 */
export async function getChatStats(): Promise<any> {
  const response = await fetch(`${AI_API_URL}/chat/stats`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
