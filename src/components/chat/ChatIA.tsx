"use client";

import { useState, useEffect, useRef } from 'react';
import { Loader2, Trash2, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendChatMessage, getChatSession, deleteChatSession } from '@/lib/ai-api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadSession(savedSessionId);
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

      // Guardar sessionId si es nuevo
      if (!sessionId && response.sessionId) {
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

      // Si se creó un proyecto, notificar al padre
      if (response.context?.lastProjectId && onProjectCreated) {
        onProjectCreated(response.context.lastProjectId);
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
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bridge AI</h3>
            <p className="text-xs text-gray-500">Asistente inteligente</p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Limpiar chat"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 bg-white"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(229 231 235 / 0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              ¡Hola! Soy tu asistente de IA
            </h3>
            <p className="text-sm md:text-base text-gray-600 max-w-md">
              Puedo ayudarte a crear proyectos, encontrar equipos especializados y conectarte con el talento ideal.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
              <button
                onClick={() => handleSendMessage('Quiero crear un proyecto nuevo')}
                className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              >
                <p className="text-sm font-medium text-gray-900">💡 Crear proyecto</p>
                <p className="text-xs text-gray-500 mt-1">Describe tu idea</p>
              </button>
              <button
                onClick={() => handleSendMessage('Muéstrame equipos disponibles')}
                className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              >
                <p className="text-sm font-medium text-gray-900">👥 Ver equipos</p>
                <p className="text-xs text-gray-500 mt-1">Encuentra talento</p>
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
