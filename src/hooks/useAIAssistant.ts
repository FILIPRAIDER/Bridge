import { useState } from "react";
import { aiChatService } from "@/services/aiChatService";
import type { AIAssistantResponse } from "@/types/ai-chat";

/**
 * Hook para usar el Asistente IA
 * ⚠️ ACTUALIZADO: Ahora requiere teamId como primer parámetro
 */
export function useAIAssistant(teamId: string, areaId: string) {
  const [response, setResponse] = useState<AIAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askAI = async (question: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiChatService.askAssistant(teamId, areaId, question);
      setResponse(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error consultando al asistente";
      setError(errorMessage);
      console.error("[useAIAssistant] Error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
    setError(null);
  };

  return {
    response,
    loading,
    error,
    askAI,
    clearResponse,
  };
}
