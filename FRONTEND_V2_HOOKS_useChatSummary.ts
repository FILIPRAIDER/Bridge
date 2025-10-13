// FRONTEND - hooks/useChatSummary.ts
// ⚠️ VERSIÓN ACTUALIZADA - Requiere teamId

import { useState, useCallback } from 'react';
import { aiChatService } from '../services/aiChatService';
import type { ConversationSummary, AIRequestStatus } from '../types/ai-chat.types';

/**
 * Hook para generar resúmenes de conversaciones
 * 
 * ⚠️ CAMBIO: Ahora requiere teamId como primer parámetro
 * 
 * Uso:
 * const { summarize, summary, loading } = useChatSummary(teamId, areaId);
 * 
 * // En botón "Resumir":
 * <button onClick={() => summarize(50)}>
 *   📝 Resumir últimos 50 mensajes
 * </button>
 */
export function useChatSummary(teamId: string, areaId: string) {
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [status, setStatus] = useState<AIRequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const summarize = useCallback(async (messageCount: number = 50) => {
    setStatus('loading');
    setError(null);

    try {
      const result = await aiChatService.summarizeConversation(teamId, areaId, messageCount);
      setSummary(result);
      setStatus('success');
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al generar resumen';
      setError(errorMessage);
      setStatus('error');
      console.error('[useChatSummary] Error:', err);
      return null;
    }
  }, [teamId, areaId]);

  const reset = useCallback(() => {
    setSummary(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    summarize,
    summary,
    loading: status === 'loading',
    success: status === 'success',
    error,
    status,
    reset
  };
}
