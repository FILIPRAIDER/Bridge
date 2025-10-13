// src/hooks/useTelegramWebSocket.ts

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import type { AreaMessage } from "@/types/telegram";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 
                    process.env.NEXT_PUBLIC_API_BASE_URL || 
                    "http://localhost:4001";

interface WebSocketCallbacks {
  onNewMessage?: (message: AreaMessage) => void;
  onMessageUpdated?: (messageId: string, updates: Partial<AreaMessage>) => void;
  onMessageDeleted?: (messageId: string) => void;
  onUserTyping?: (userId: string, userName: string) => void;
  onUserStopTyping?: (userId: string) => void;
}

/**
 * Hook para manejar conexión WebSocket de un área
 * Compatible con mensajes de Telegram y Web
 */
export function useTelegramWebSocket(
  areaId: string,
  userId: string,
  callbacks: WebSocketCallbacks = {}
) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Array<{ id: string; name: string }>>([]);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Conectar WebSocket
   */
  useEffect(() => {
    if (!areaId || !userId || !session) return;

    const token = (session as any)?.accessToken;
    if (!token) {
      console.error("[useTelegramWebSocket] No token found");
      return;
    }

    console.log(`[useTelegramWebSocket] Connecting to area ${areaId}`);

    const socket = io(`${WS_BASE_URL}/areas/${areaId}`, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    // Eventos de conexión
    socket.on("connect", () => {
      console.log("[useTelegramWebSocket] Connected");
      setIsConnected(true);
      socket.emit("join-area", { userId });
    });

    socket.on("disconnect", () => {
      console.log("[useTelegramWebSocket] Disconnected");
      setIsConnected(false);
      setTypingUsers([]);
    });

    socket.on("connect_error", (error) => {
      console.error("[useTelegramWebSocket] Connection error:", error);
      setIsConnected(false);
    });

    // Eventos de mensajes
    socket.on("new-message", (data: any) => {
      console.log("[useTelegramWebSocket] New message:", data);
      
      const message: AreaMessage = {
        id: data.id,
        areaId: data.areaId,
        userId: data.userId,
        content: data.content,
        type: data.type || "TEXT",
        source: data.source || "web",
        user: data.user,
        telegram: data.telegram,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        createdAt: data.createdAt,
        replyToId: data.replyToId,
      };

      callbacks.onNewMessage?.(message);
    });

    socket.on("message-updated", (data: any) => {
      console.log("[useTelegramWebSocket] Message updated:", data);
      callbacks.onMessageUpdated?.(data.messageId, data.updates);
    });

    socket.on("message-deleted", (data: any) => {
      console.log("[useTelegramWebSocket] Message deleted:", data);
      callbacks.onMessageDeleted?.(data.messageId);
    });

    // Eventos de typing
    socket.on("user-typing", (data: any) => {
      console.log("[useTelegramWebSocket] User typing:", data);
      
      if (data.userId !== userId) {
        setTypingUsers((prev) => {
          if (!prev.find((u) => u.id === data.userId)) {
            return [...prev, { id: data.userId, name: data.userName }];
          }
          return prev;
        });

        callbacks.onUserTyping?.(data.userId, data.userName);
      }
    });

    socket.on("user-stop-typing", (data: any) => {
      console.log("[useTelegramWebSocket] User stop typing:", data);
      
      setTypingUsers((prev) => prev.filter((u) => u.id !== data.userId));
      callbacks.onUserStopTyping?.(data.userId);
    });

    socketRef.current = socket;

    // Cleanup
    return () => {
      console.log("[useTelegramWebSocket] Disconnecting");
      socket.disconnect();
      socketRef.current = null;
      setTypingUsers([]);
    };
  }, [areaId, userId, session]);

  /**
   * Emitir que el usuario está escribiendo
   */
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

  /**
   * Emitir que el usuario dejó de escribir
   */
  const stopTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing-stop");
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  return {
    isConnected,
    typingUsers,
    startTyping,
    stopTyping,
    socket: socketRef.current,
  };
}
