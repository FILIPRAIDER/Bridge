import { useState } from "react";
import { aiChatService } from "@/services/aiChatService";
import type { ConversationSummary } from "@/types/ai-chat";

/**
 * Hook para generar resúmenes de conversaciones
 * ⚠️ ACTUALIZADO: Ahora requiere teamId como primer parámetro
 */
export function useChatSummary(teamId: string, areaId: string) {
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (messageCount: number = 50) => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiChatService.summarizeConversation(teamId, areaId, messageCount);
      setSummary(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error generando resumen";
      setError(errorMessage);
      console.error("[useChatSummary] Error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearSummary = () => {
    setSummary(null);
    setError(null);
  };

  return {
    summary,
    loading,
    error,
    summarize,
    clearSummary,
  };
}
