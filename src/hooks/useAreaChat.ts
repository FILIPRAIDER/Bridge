"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import type {
  AreaMessage,
  AreaMessagesResponse,
  SendMessageRequest,
  NewMessageEvent,
  MessageEditedEvent,
  MessageDeletedEvent,
  UserTypingEvent,
} from "@/types/areas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || "http://localhost:4001";

export function useAreaChat(teamId: string | null, areaId: string | null, userId: string | null) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<AreaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar mensajes iniciales
  const loadMessages = async (before?: string) => {
    if (!teamId || !areaId || !session) return;

    setLoading(true);
    setError(null);

    try {
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (before) params.append("before", before);
      params.append("limit", "50");

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/messages?${params}`,
        { 
          headers,
          credentials: "include" 
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar mensajes");
      }

      const data: AreaMessagesResponse = await response.json();
      
      if (before) {
        setMessages((prev) => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("[useAreaChat] Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje
  const sendMessage = async (data: SendMessageRequest): Promise<boolean> => {
    if (!teamId || !areaId || !session) return false;

    try {
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/messages`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar mensaje");
      }

      // El mensaje se añadirá vía WebSocket
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar mensaje");
      console.error("[useAreaChat] Error sending message:", err);
      return false;
    }
  };

  // Editar mensaje
  const editMessage = async (messageId: string, content: string): Promise<boolean> => {
    if (!teamId || !areaId || !session) return false;

    try {
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/messages/${messageId}`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al editar mensaje");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al editar mensaje");
      console.error("[useAreaChat] Error editing message:", err);
      return false;
    }
  };

  // Eliminar mensaje
  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!teamId || !areaId || !session) return false;

    try {
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/areas/${areaId}/messages/${messageId}`,
        {
          method: "DELETE",
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar mensaje");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar mensaje");
      console.error("[useAreaChat] Error deleting message:", err);
      return false;
    }
  };

  // Indicar que el usuario está escribiendo
  const startTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing-start");

      // Auto-stop después de 3 segundos
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  };

  const stopTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing-stop");
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Conectar WebSocket
  useEffect(() => {
    if (!areaId || !userId || !session) return;

    const token = (session as any)?.accessToken;
    if (!token) {
      console.error("[useAreaChat] No se encontró token de autenticación");
      return;
    }

    console.log(`[useAreaChat] Conectando a WebSocket para área ${areaId}`);
    console.log(`[useAreaChat] Token presente: ${token.substring(0, 20)}...`);

    const socket = io(`${WS_BASE_URL}/areas/${areaId}`, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("[useAreaChat] WebSocket conectado");
      setIsConnected(true);
      socket.emit("join-area", { userId });
    });

    socket.on("disconnect", () => {
      console.log("[useAreaChat] WebSocket desconectado");
      setIsConnected(false);
    });

    // Nuevo mensaje
    socket.on("new-message", (data: any) => {
      console.log("[useAreaChat] Nuevo mensaje recibido:", data);
      
      // ✅ El backend puede enviar data.message o directamente el mensaje
      const messageData = data.message || data;
      
      if (!messageData || !messageData.id) {
        console.error("[useAreaChat] Invalid message data received:", data);
        return;
      }
      
      // ✅ Normalizar el mensaje con valores por defecto
      const messageWithDate: AreaMessage = {
        ...messageData,
        createdAt: messageData.createdAt || new Date().toISOString(),
        userId: messageData.userId || messageData.user?.id,
        user: messageData.user || { id: messageData.userId, name: 'Usuario', email: '', avatarUrl: null },
      };
      
      console.log("[useAreaChat] Mensaje procesado:", messageWithDate);
      setMessages((prev) => [...prev, messageWithDate]);
    });

    // Mensaje editado
    socket.on("message-edited", (data: MessageEditedEvent) => {
      console.log("[useAreaChat] Mensaje editado:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: data.content, editedAt: data.editedAt }
            : msg
        )
      );
    });

    // Mensaje eliminado
    socket.on("message-deleted", (data: MessageDeletedEvent) => {
      console.log("[useAreaChat] Mensaje eliminado:", data);
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    // Usuario escribiendo
    socket.on("user-typing", (data: UserTypingEvent) => {
      console.log("[useAreaChat] Usuario escribiendo:", data);
      setTypingUsers((prev) => {
        if (!prev.includes(data.userName)) {
          return [...prev, data.userName];
        }
        return prev;
      });

      // Remover después de 3 segundos
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }, 3000);
    });

    socketRef.current = socket;

    return () => {
      console.log("[useAreaChat] Desconectando WebSocket");
      socket.emit("leave-area");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [areaId, userId, session]);

  // Cargar mensajes al montar
  useEffect(() => {
    if (teamId && areaId && session) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, areaId, session]);

  return {
    messages,
    loading,
    error,
    isConnected,
    typingUsers,
    hasMore,
    socket: socketRef.current,
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
  };
}
