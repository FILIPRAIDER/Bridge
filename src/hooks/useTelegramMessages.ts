// src/hooks/useTelegramMessages.ts

import { useState, useEffect, useCallback } from "react";
import { TelegramService } from "@/services/telegram.service";
import type { AreaMessage } from "@/types/telegram";
import { toast } from "@/components/ui/toast";

/**
 * Hook para gestionar mensajes de un área (web + Telegram)
 */
export function useTelegramMessages(areaId: string) {
  const [messages, setMessages] = useState<AreaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 50;

  /**
   * Carga mensajes del área
   */
  const fetchMessages = useCallback(async (reset = false) => {
    if (!areaId) return;

    setLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      const data = await TelegramService.getAreaMessages(areaId, LIMIT, currentOffset);
      
      if (reset) {
        setMessages(data);
        setOffset(LIMIT);
      } else {
        setMessages((prev) => [...prev, ...data]);
        setOffset((prev) => prev + LIMIT);
      }

      setHasMore(data.length === LIMIT);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Error cargando mensajes");
    } finally {
      setLoading(false);
    }
  }, [areaId, offset]);

  /**
   * Envía un mensaje
   */
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!content.trim()) return;

    try {
      const newMessage = await TelegramService.sendMessage(areaId, content, replyToId);
      
      // Añadir mensaje optimisticamente
      setMessages((prev) => [newMessage, ...prev]);
      
      return newMessage;
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(err.message || "Error enviando mensaje");
      throw err;
    }
  };

  /**
   * Añade un mensaje recibido por WebSocket
   */
  const addMessage = useCallback((message: AreaMessage) => {
    setMessages((prev) => {
      // Evitar duplicados
      if (prev.find((m) => m.id === message.id)) {
        return prev;
      }
      return [message, ...prev];
    });
  }, []);

  /**
   * Actualiza un mensaje existente
   */
  const updateMessage = useCallback((messageId: string, updates: Partial<AreaMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  /**
   * Elimina un mensaje
   */
  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  /**
   * Refresca mensajes (recarga desde el principio)
   */
  const refresh = () => {
    setOffset(0);
    fetchMessages(true);
  };

  /**
   * Carga más mensajes (paginación)
   */
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMessages(false);
    }
  };

  // Cargar mensajes al montar
  useEffect(() => {
    fetchMessages(true);
  }, [areaId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    addMessage,
    updateMessage,
    removeMessage,
    refresh,
    loadMore,
  };
}
