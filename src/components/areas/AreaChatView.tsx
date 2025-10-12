"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, MoreVertical, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { useAreaChat } from "@/hooks/useAreaChat";
import type { TeamArea, AreaMessage, MessageType } from "@/types/areas";
import { useToast } from "@/components/ui/toast";

interface AreaChatViewProps {
  teamId: string;
  area: TeamArea;
  userId: string;
  userName: string;
  onBack: () => void;
}

export function AreaChatView({ teamId, area, userId, userName, onBack }: AreaChatViewProps) {
  const { show } = useToast();
  const {
    messages,
    loading,
    isConnected,
    typingUsers,
    hasMore,
    sendMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    loadMessages,
  } = useAreaChat(teamId, area.id, userId);

  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const success = await sendMessage({
      content: messageInput.trim(),
      type: "TEXT" as MessageType,
    });

    if (success) {
      setMessageInput("");
      stopTyping();
    } else {
      show({
        variant: "error",
        message: "Error al enviar el mensaje",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("¿Eliminar este mensaje?")) return;

    const success = await deleteMessage(messageId);
    if (success) {
      show({
        variant: "success",
        message: "Mensaje eliminado",
      });
    } else {
      show({
        variant: "error",
        message: "Error al eliminar mensaje",
      });
    }
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    }
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: area.color || "#6B7280" }}
          >
            {area.icon}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{area.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
              <span>{isConnected ? "Conectado" : "Desconectado"}</span>
              {area.memberCount && <span>• {area.memberCount} miembros</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mb-2" />
              <p className="text-gray-600">Cargando mensajes...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 text-lg font-medium">No hay mensajes aún</p>
              <p className="text-gray-500 text-sm mt-2">Sé el primero en enviar un mensaje</p>
            </div>
          </div>
        ) : (
          <>
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => loadMessages(messages[0]?.id)}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Cargar mensajes anteriores"}
                </button>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => {
              const isOwnMessage = message.userId === userId;
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

              return (
                <div key={message.id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  {/* Message */}
                  <div className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">
                          {message.user?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : ""}`}>
                      {!isOwnMessage && (
                        <span className="text-xs font-medium text-gray-700 mb-1">
                          {message.user?.name || "Usuario"}
                        </span>
                      )}

                      <div className="group relative">
                        <div
                          className={`px-4 py-2.5 rounded-2xl ${
                            isOwnMessage
                              ? "bg-gradient-to-br from-gray-700 to-gray-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          {message.editedAt && (
                            <span className="text-xs opacity-70 mt-1 block">(editado)</span>
                          )}
                        </div>

                        {/* Message Actions */}
                        {isOwnMessage && (
                          <div className="absolute right-0 top-0 -mr-12 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <span className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "mr-2" : "ml-2"}`}>
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 animate-pulse">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>{typingUsers.join(", ")} {typingUsers.length === 1 ? "está" : "están"} escribiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-end gap-3">
          <button
            type="button"
            className="p-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            title="Adjuntar archivo"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                startTyping();
              }}
              onKeyDown={handleKeyDown}
              onBlur={stopTyping}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none resize-none max-h-32"
              style={{ minHeight: "42px" }}
            />
          </div>

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !isConnected}
            className="p-2.5 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {!isConnected && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <span className="h-2 w-2 bg-amber-600 rounded-full" />
            Reconectando al chat...
          </p>
        )}
      </div>
    </div>
  );
}
