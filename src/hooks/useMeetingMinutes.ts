import { useState } from "react";
import { aiChatService } from "@/services/aiChatService";
import type { MeetingMinutes } from "@/types/ai-chat";

/**
 * Hook para grabar y generar minutas de reunión
 * ⚠️ ACTUALIZADO: Ahora requiere teamId como primer parámetro
 */
export function useMeetingMinutes(teamId: string, areaId: string) {
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);

  const startRecording = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setIsRecording(true);
    setError(null);
  };

  const stopRecording = async () => {
    if (!startTime) return null;

    const endTime = new Date().toISOString();
    setIsRecording(false);
    setLoading(true);

    try {
      const result = await aiChatService.generateMeetingMinutes(teamId, areaId, startTime, endTime);
      setMinutes(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error generando minuta";
      setError(errorMessage);
      console.error("[useMeetingMinutes] Error:", err);
      return null;
    } finally {
      setLoading(false);
      setStartTime(null);
    }
  };

  const clearMinutes = () => {
    setMinutes(null);
    setError(null);
    setIsRecording(false);
    setStartTime(null);
  };

  return {
    minutes,
    loading,
    error,
    isRecording,
    startRecording,
    stopRecording,
    clearMinutes,
  };
}
