"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, MoreVertical, Edit2, Trash2, ArrowLeft, ChevronDown, Users, FileText, Mic, Brain } from "lucide-react";
import { useAreaChat } from "@/hooks/useAreaChat";
import type { TeamArea, AreaMessage, MessageType } from "@/types/areas";
import { useToast } from "@/components/ui/toast";
import AreaFilePanel from "./AreaFilePanel";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { AIAssistantMessage } from "@/components/chat/AIAssistantMessage";
import { ConversationSummaryModal } from "@/components/chat/ConversationSummaryModal";
import { MeetingRecorder } from "@/components/chat/MeetingRecorder";

// 🆕 Telegram Integration
import { useTelegramGroup } from "@/hooks/useTelegramGroup";
import { TelegramService } from "@/services/telegram.service";
import { TelegramSetupWizard, TelegramBadge, TelegramInfoModal, TelegramInviteModal } from "@/components/telegram";
import { getTelegramUserDisplayName } from "@/utils/telegram.utils";
import type { TelegramMember, TelegramGroup as TelegramGroupType } from "@/types/telegram";

interface AreaChatViewProps {
  teamId: string;
  area: TeamArea;
  userId: string;
  userName: string;
  userRole?: "LIDER" | "ESTUDIANTE" | "EMPRESARIO"; // Rol del usuario
  onBack: () => void;
}

export function AreaChatView({ teamId, area, userId, userName, userRole, onBack }: AreaChatViewProps) {
  const { show } = useToast();
  
  // ✅ Solo el LÍDER puede configurar Telegram
  const canConfigureTelegram = userRole === "LIDER";
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

  // IA Features
  const { response: aiResponse, loading: aiLoading, askAI, clearResponse } = useAIAssistant(teamId, area.id);
  const [showSummary, setShowSummary] = useState(false);

  // 🆕 Telegram Integration
  const { 
    group: telegramGroup, 
    loading: telegramLoading, 
    linkGroup,
    validateAndLinkCode,
    isLinked 
  } = useTelegramGroup(area.id, teamId);
  const [showTelegramWizard, setShowTelegramWizard] = useState(false);
  const [showTelegramInfo, setShowTelegramInfo] = useState(false);
  const [showTelegramInvite, setShowTelegramInvite] = useState(false); // 🆕 Modal de invitación para líder
  const [telegramMembers, setTelegramMembers] = useState<TelegramMember[]>([]);

  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🆕 Cargar miembros del área para Telegram
  // ✅ CORREGIDO: Ahora usa el endpoint correcto con teamId
  // ⚠️ NOTA: Si el backend aún no implementó este endpoint, continuará sin miembros
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const members = await TelegramService.getAreaMembers(teamId, area.id);
        setTelegramMembers(members);
      } catch (err) {
        // Silenciamos 404 hasta que el backend implemente el endpoint
        // La app funcionará sin la lista de miembros para Telegram
        if (err instanceof Error && !err.message.includes('404') && !err.message.includes('Failed to fetch')) {
          console.warn("Error loading members (non-critical):", err.message);
        }
      }
    };
    loadMembers();
  }, [teamId, area.id]);

  // 🆕 Handlers de Telegram
  const handleLinkTelegramGroup = async (
    chatId: string,
    chatTitle: string,
    chatType: 'group' | 'supergroup' | 'channel',
    teamId: string,
    inviteLink?: string
  ) => {
    return await linkGroup(chatId, chatTitle, chatType, teamId, inviteLink);
  };

  const handleSendTelegramInvites = async (memberIds: string[], message?: string) => {
    if (!telegramGroup) {
      throw new Error("No hay grupo vinculado");
    }

    await TelegramService.sendInvites({
      groupId: telegramGroup.id,
      memberIds,
      message,
    });
  };

  const handleTelegramSetupComplete = (group: TelegramGroupType) => {
    show({
      variant: "success",
      message: `Telegram configurado exitosamente`,
    });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const trimmed = messageInput.trim();

    // Detectar comando @IA
    if (trimmed.startsWith("@IA ") || trimmed.startsWith("@ia ")) {
      const question = trimmed.replace(/@IA\s+/i, "").trim();
      
      if (question.length > 0) {
        await askAI(question);
        setMessageInput("");
        stopTyping();
        return;
      } else {
        show({
          variant: "error",
          message: "Debes escribir una pregunta después de @IA",
        });
        return;
      }
    }

    // Enviar mensaje normal
    const success = await sendMessage({
      content: trimmed,
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
    <div className="flex flex-col h-screen max-h-screen bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          
          <div
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center text-lg sm:text-xl md:text-2xl shadow-sm flex-shrink-0"
            style={{ backgroundColor: area.color || "#6B7280" }}
          >
            {area.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-gray-900 truncate">{area.name}</h2>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-600">
              <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="hidden sm:inline text-xs md:text-sm">{isConnected ? "Conectado" : "Desconectado"}</span>
              {area.memberCount && <span className="hidden sm:inline text-xs md:text-sm">• {area.memberCount} miembros</span>}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 🆕 Botón Telegram */}
          {canConfigureTelegram ? (
            // LÍDER: Puede configurar Telegram
            <>
              <button
                onClick={() => {
                  // Si ya está vinculado, mostrar directamente el modal de invitación con QR
                  // Si no está vinculado, mostrar el wizard completo
                  if (isLinked && telegramGroup) {
                    setShowTelegramInvite(true);
                  } else {
                    setShowTelegramWizard(true);
                  }
                }}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shadow-sm text-sm font-medium ${
                  isLinked
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                    : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
                }`}
                title={isLinked ? "Invitar Miembros" : "Conectar con Telegram"}
              >
                <Send className="h-4 w-4" />
                <span className="hidden md:inline">
                  {isLinked ? "Telegram" : "Conectar"}
                </span>
              </button>

              <button
                onClick={() => {
                  if (isLinked && telegramGroup) {
                    setShowTelegramInvite(true);
                  } else {
                    setShowTelegramWizard(true);
                  }
                }}
                className={`sm:hidden p-2 rounded-lg transition-all shadow-sm ${
                  isLinked
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    : "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                }`}
                title="Telegram"
              >
                <Send className="h-4 w-4" />
              </button>
            </>
          ) : isLinked && telegramGroup ? (
            // MIEMBRO: Solo puede ver info si ya está configurado
            <>
              <button
                onClick={() => setShowTelegramInfo(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shadow-sm text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                title="Ver grupo de Telegram"
              >
                <Send className="h-4 w-4" />
                <span className="hidden md:inline">Telegram</span>
              </button>

              <button
                onClick={() => setShowTelegramInfo(true)}
                className="sm:hidden p-2 rounded-lg transition-all shadow-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                title="Ver grupo de Telegram"
              >
                <Send className="h-4 w-4" />
              </button>
            </>
          ) : null}

          {/* Botón Resumir */}
          <button
            onClick={() => setShowSummary(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm text-sm font-medium"
            title="Generar resumen inteligente"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Resumir</span>
          </button>

          <button
            onClick={() => setShowSummary(true)}
            className="sm:hidden p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
            title="Generar resumen"
          >
            <FileText className="h-4 w-4" />
          </button>

          {/* Botón Minuta - Desktop */}
          <button
            onClick={() => {
              // Toggle recording state
              const recorder = document.getElementById('meeting-recorder-btn');
              if (recorder) recorder.click();
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-sm text-sm font-medium"
            title="Grabar minuta de reunión"
          >
            <Mic className="h-4 w-4" />
            <span className="hidden md:inline">Minuta</span>
          </button>

          {/* Botón Minuta - Mobile */}
          <button
            onClick={() => {
              const recorder = document.getElementById('meeting-recorder-btn');
              if (recorder) recorder.click();
            }}
            className="sm:hidden p-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-sm"
            title="Minuta"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile: Files Accordion */}
      <div className="lg:hidden border-b border-gray-200">
        <button
          onClick={() => setFilesExpanded(!filesExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">📁 Archivos Compartidos</span>
            {area.fileCount !== undefined && (
              <span className="text-xs text-gray-500">({area.fileCount})</span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-600 transition-transform ${
              filesExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
        {filesExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 max-h-80 overflow-y-auto">
            <AreaFilePanel teamId={teamId} areaId={area.id} currentUserId={userId} />
          </div>
        )}
      </div>

      {/* Split Layout: Chat (60%) + Files (40%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-0 overflow-hidden">
        {/* Left: Chat Area */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Messages Area - Fixed height with elegant scroll */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 custom-scrollbar scroll-smooth">
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
              // Safe check: message.userId might be undefined from WebSocket
              const isOwnMessage = message?.userId === userId || message?.user?.id === userId;
              
              // Safe check: messages might not have createdAt from WebSocket
              const prevMessage = messages[index - 1];
              const showDate =
                index === 0 ||
                (prevMessage?.createdAt && message?.createdAt && 
                 formatDate(prevMessage.createdAt) !== formatDate(message.createdAt));

              return (
                <div key={message.id}>
                  {/* Date Separator */}
                  {showDate && message?.createdAt && (
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  {/* Message */}
                  <div className={`flex gap-2 sm:gap-3 ${isOwnMessage ? "flex-row-reverse" : ""} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.user?.avatarUrl ? (
                        <img
                          src={message.user.avatarUrl}
                          alt={message.user.name || "Usuario"}
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shadow-md"
                        />
                      ) : (
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-xs sm:text-sm">
                            {message.user?.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col max-w-[80%] sm:max-w-[85%] md:max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                      {/* User info */}
                      <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs font-semibold text-gray-900">
                          {/* 🆕 Mostrar nombre de Telegram si viene de allá */}
                          {message.source === 'telegram' && message.telegram
                            ? getTelegramUserDisplayName(
                                message.telegram.fromFirstName,
                                message.telegram.fromLastName,
                                message.telegram.fromUsername
                              )
                            : (message.user?.name || "Usuario")}
                        </span>
                        {/* 🆕 Badge de Telegram */}
                        <TelegramBadge source={message.source || 'web'} size="sm" />
                        {message?.createdAt && (
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="group relative">
                        <div
                          className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${
                            isOwnMessage
                              ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-tr-sm"
                              : "bg-white text-gray-900 rounded-tl-sm border border-gray-200"
                          }`}
                        >
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </p>
                          {message.editedAt && (
                            <span className="text-xs opacity-70 mt-1 block">(editado)</span>
                          )}
                        </div>

                        {/* Message Actions - Solo visible en hover */}
                        {isOwnMessage && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="absolute -top-2 right-2 p-1.5 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Respuesta del Asistente IA */}
            {aiResponse && (
              <AIAssistantMessage 
                response={aiResponse} 
                onClose={clearResponse}
              />
            )}

            {/* Loading del Asistente IA */}
            {aiLoading && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Brain className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-semibold text-purple-900 mb-2">Asistente IA está analizando...</span>
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl rounded-tl-sm p-4 max-w-md">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
          <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-end gap-2 sm:gap-2.5 md:gap-3">
              <button
                type="button"
                className="p-1.5 sm:p-2 md:p-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                title="Adjuntar archivo"
              >
                <Paperclip className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
              </button>

              <div className="flex-1 relative min-w-0">
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
                  className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none resize-none max-h-32 text-sm md:text-base"
                  style={{ minHeight: "36px" }}
                />
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !isConnected}
                className="p-2 sm:p-2.5 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md"
              >
                <Send className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
              </button>
            </div>

            {/* Hints */}
            <div className="mt-2 flex items-center justify-between">
              {!isConnected ? (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <span className="h-2 w-2 bg-amber-600 rounded-full" />
                  Reconectando al chat...
                </p>
              ) : (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Brain className="h-3 w-3 text-purple-600" />
                  Escribe <code className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs font-mono">@IA pregunta</code> para consultar al asistente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Files Area (Desktop Only) */}
        <div className="hidden lg:block h-full border-l border-gray-200">
          <AreaFilePanel teamId={teamId} areaId={area.id} currentUserId={userId} />
        </div>
      </div>

      {/* Modales y Componentes IA */}
      <ConversationSummaryModal
        teamId={teamId}
        areaId={area.id}
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />

      <MeetingRecorder 
        teamId={teamId}
        areaId={area.id} 
        areaName={area.name}
      />

      {/* 🆕 Telegram Setup Wizard (Solo LÍDER) */}
      {canConfigureTelegram && (
        <TelegramSetupWizard
          isOpen={showTelegramWizard}
          onClose={() => setShowTelegramWizard(false)}
          areaId={area.id}
          areaName={area.name}
          teamId={teamId}
          members={telegramMembers}
          onLinkGroup={handleLinkTelegramGroup}
          validateAndLinkCode={validateAndLinkCode}
          onSendInvites={handleSendTelegramInvites}
          onComplete={handleTelegramSetupComplete}
        />
      )}

      {/* 🆕 Telegram Info Modal (Para MIEMBROS) */}
      {!canConfigureTelegram && telegramGroup && (
        <TelegramInfoModal
          isOpen={showTelegramInfo}
          onClose={() => setShowTelegramInfo(false)}
          group={telegramGroup}
          areaName={area.name}
        />
      )}

      {/* 🆕 Telegram Invite Modal (Para LÍDER cuando ya está vinculado) */}
      {canConfigureTelegram && telegramGroup && (
        <TelegramInviteModal
          isOpen={showTelegramInvite}
          onClose={() => setShowTelegramInvite(false)}
          inviteLink={telegramGroup.inviteLink || ""}
          members={telegramMembers}
          onSendInvites={handleSendTelegramInvites}
          defaultTab="qr"
        />
      )}
    </div>
  );
}
