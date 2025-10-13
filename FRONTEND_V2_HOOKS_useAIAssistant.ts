// FRONTEND - hooks/useAIAssistant.ts
// ⚠️ VERSIÓN ACTUALIZADA - Requiere teamId

import { useState, useCallback } from 'react';
import { aiChatService } from '../services/aiChatService';
import type { AIAssistantResponse, AIRequestStatus } from '../types/ai-chat.types';

/**
 * Hook para usar el Asistente IA en chats de área
 * 
 * ⚠️ CAMBIO: Ahora requiere teamId como primer parámetro
 * 
 * Uso:
 * const { askAI, response, loading, error } = useAIAssistant(teamId, areaId);
 * 
 * // En el input del chat:
 * if (message.startsWith('@IA ')) {
 *   const question = message.replace('@IA ', '');
 *   await askAI(question);
 * }
 */
export function useAIAssistant(teamId: string, areaId: string) {
  const [response, setResponse] = useState<AIAssistantResponse | null>(null);
  const [status, setStatus] = useState<AIRequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const askAI = useCallback(async (question: string) => {
    if (!question.trim()) {
      setError('La pregunta no puede estar vacía');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const result = await aiChatService.askAI(teamId, areaId, question);
      setResponse(result);
      setStatus('success');
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al procesar la pregunta';
      setError(errorMessage);
      setStatus('error');
      console.error('[useAIAssistant] Error:', err);
      return null;
    }
  }, [teamId, areaId]);

  const reset = useCallback(() => {
    setResponse(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    askAI,
    response,
    loading: status === 'loading',
    success: status === 'success',
    error,
    status,
    reset
  };
}
