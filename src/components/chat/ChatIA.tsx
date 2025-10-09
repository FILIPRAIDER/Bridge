"use client";

import { useState, useEffect, useRef } from 'react';
import { Loader2, Trash2, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ProjectProgressIndicator } from './ProjectProgressIndicator';
import { sendChatMessage, getChatSession, deleteChatSession } from '@/lib/ai-api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProjectProgress {
  flags: any;
  data: any;
}

interface ChatIAProps {
  userId?: string;
  companyId?: string;
  projectId?: string;
  onProjectCreated?: (projectId: string) => void;
}

export default function ChatIA({ 
  userId, 
  companyId, 
  projectId,
  onProjectCreated 
}: ChatIAProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      console.log('[ChatIA] 📂 Sesión recuperada del localStorage:', savedSessionId);
      setSessionId(savedSessionId);
      loadSession(savedSessionId);
    } else {
      console.log('[ChatIA] 🆕 No hay sesión previa, se creará una nueva');
    }
  }, []);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  /**
   * Cargar sesión existente
   */
  const loadSession = async (sid: string) => {
    try {
      const data = await getChatSession(sid);
      setMessages(
        data.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }))
      );
    } catch (error) {
      console.error('Error cargando sesión:', error);
      // Si la sesión no existe, limpiarla
      localStorage.removeItem('chatSessionId');
      setSessionId(null);
    }
  };

  /**
   * Enviar mensaje al chat
   */
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    // Agregar mensaje del usuario
    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // 🔥 LOG: Verificar que sessionId se está enviando
    console.log('[ChatIA] Enviando mensaje:', {
      hasSessionId: !!sessionId,
      sessionId: sessionId,
      messagePreview: content.trim().substring(0, 50),
    });

    try {
      const response = await sendChatMessage({
        message: content.trim(),
        sessionId: sessionId,
        context: {
          userId,
          companyId,
          projectId,
        },
      });

      // 🔥 LOG: Verificar respuesta del backend
      console.log('[ChatIA] Respuesta recibida:', {
        sessionId: response.sessionId,
        sessionChanged: response.sessionId !== sessionId,
        hasFlags: !!response.context?.projectFlags,
        flags: response.context?.projectFlags,
      });

      // Guardar sessionId si es nuevo o cambió
      if (response.sessionId && response.sessionId !== sessionId) {
        console.log('[ChatIA] 🔄 Actualizando sessionId:', {
          old: sessionId,
          new: response.sessionId,
        });
        setSessionId(response.sessionId);
        localStorage.setItem('chatSessionId', response.sessionId);
      }

      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Actualizar progreso del proyecto si hay banderas
      if (response.context?.projectFlags && response.context?.projectData) {
        console.log('[ChatIA] ✅ Flags actualizados:', response.context.projectFlags);
        setProjectProgress({
          flags: response.context.projectFlags,
          data: response.context.projectData,
        });
      }

      // Si se creó un proyecto, notificar al padre
      if (response.context?.lastProjectId && onProjectCreated) {
        onProjectCreated(response.context.lastProjectId);
        // Limpiar progreso después de crear proyecto
        setProjectProgress(null);
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      setError(error instanceof Error ? error.message : 'Error desconocido');

      // Agregar mensaje de error
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpiar chat
   */
  const handleClearChat = async () => {
    console.log('[ChatIA] 🗑️ Limpiando chat y sesión:', sessionId);
    if (sessionId) {
      try {
        await deleteChatSession(sessionId);
      } catch (error) {
        console.error('Error eliminando sesión:', error);
      }
      localStorage.removeItem('chatSessionId');
    }
    setMessages([]);
    setSessionId(null);
    setError(null);
    setProjectProgress(null); // Limpiar progreso del proyecto
    console.log('[ChatIA] ✅ Chat limpiado completamente');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Bridge AI</h3>
            <p className="text-xs text-gray-500">Asistente inteligente</p>
            {/* 🔥 DEBUG: Mostrar sessionId en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-[10px] text-blue-600 font-mono">
                Session: {sessionId ? sessionId.substring(0, 20) + '...' : 'Sin sesión'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Limpiar chat"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 bg-gradient-to-b from-gray-50/50 to-white"
      >
        {/* Project Progress Indicator */}
        {projectProgress && (
          <ProjectProgressIndicator 
            flags={projectProgress.flags}
            data={projectProgress.data}
          />
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              ¡Hola! Soy tu asistente Bridge AI
            </h3>
            <p className="text-sm md:text-base text-gray-600 max-w-lg mb-8">
              Puedo ayudarte a crear proyectos, encontrar equipos especializados y conectarte con el talento ideal para tu empresa.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <button
                onClick={() => handleSendMessage('Quiero crear un proyecto nuevo')}
                className="group text-left p-5 bg-white hover:bg-gray-50 rounded-2xl transition-all border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">💡</div>
                <p className="text-base font-semibold text-gray-900 mb-1">Crear proyecto</p>
                <p className="text-sm text-gray-500">Describe tu idea y te ayudo a darle forma</p>
              </button>
              <button
                onClick={() => handleSendMessage('Muéstrame equipos disponibles')}
                className="group text-left p-5 bg-white hover:bg-gray-50 rounded-2xl transition-all border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">👥</div>
                <p className="text-base font-semibold text-gray-900 mb-1">Ver equipos</p>
                <p className="text-sm text-gray-500">Encuentra el talento perfecto</p>
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            isLatest={index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                <span className="text-sm text-gray-600">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput 
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Describe el proyecto..."
      />
    </div>
  );
}
