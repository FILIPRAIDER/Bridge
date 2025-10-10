"use client";

import { useState, useEffect, useRef } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ProjectProgressIndicator } from './ProjectProgressIndicator';
import { ProjectProgressBanner } from './ProjectProgressBanner';
import { ProjectSelector } from './ProjectSelector'; // 🔥 NUEVO
import { sendChatMessage, getChatSession, deleteChatSession } from '@/lib/ai-api';
import { BridgeLogo } from '@/components/ui/BridgeLogo';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'project_selection'; // 🔥 NUEVO: Tipo de mensaje
  projects?: any[]; // 🔥 NUEVO: Lista de proyectos (si es project_selection)
  totalProjects?: number; // 🔥 NUEVO: Total de proyectos
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
  userAvatarUrl?: string | null; // 🔥 NUEVO: Avatar del usuario
  userName?: string | null; // 🔥 NUEVO: Nombre del usuario
}

export default function ChatIA({ 
  userId, 
  companyId, 
  projectId,
  onProjectCreated,
  userAvatarUrl, // 🔥 NUEVO
  userName // 🔥 NUEVO
}: ChatIAProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const [projectCreated, setProjectCreated] = useState(false);
  const [shownProjectBanners, setShownProjectBanners] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Cargar sesión y progreso desde localStorage al montar
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    const savedProgress = localStorage.getItem('chatProjectProgress');
    const savedUserId = localStorage.getItem('chatUserId');
    
    // Si el usuario cambió (logout/login con otro usuario), limpiar todo
    if (savedUserId && savedUserId !== userId) {
      console.log('[ChatIA] 👤 Usuario diferente detectado, limpiando sesión anterior');
      localStorage.removeItem('chatSessionId');
      localStorage.removeItem('chatProjectProgress');
      localStorage.removeItem('chatUserId');
      setSessionId(null);
      setProjectProgress(null);
      setShownProjectBanners(new Set()); // Limpiar banners al cambiar usuario
      return;
    }
    
    // Guardar userId actual para detectar cambios futuros
    if (userId) {
      localStorage.setItem('chatUserId', userId);
    }
    
    if (savedSessionId) {
      console.log('[ChatIA] 📂 Sesión recuperada del localStorage:', savedSessionId);
      setSessionId(savedSessionId);
      loadSession(savedSessionId);
    } else {
      console.log('[ChatIA] 🆕 No hay sesión previa, se creará una nueva');
      setShownProjectBanners(new Set()); // Nueva sesión = limpiar banners
    }

    // Restaurar progreso del proyecto si existe
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        console.log('[ChatIA] 📊 Progreso del proyecto restaurado:', progress);
        setProjectProgress(progress);
      } catch (error) {
        console.error('[ChatIA] ❌ Error parseando progreso guardado:', error);
        localStorage.removeItem('chatProjectProgress');
      }
    }
  }, [userId]); // Dependencia: userId para detectar cambios

  // 🔥 MEJORADO: Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    // Función para hacer scroll al fondo de manera más agresiva
    const scrollToBottom = () => {
      // Método 1: Scroll directo en el contenedor (más confiable)
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      
      // Método 2: Scroll con scrollIntoView
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    // Ejecutar inmediatamente
    scrollToBottom();
    
    // Repetir después de 100ms para asegurar renderizado completo
    const timeout1 = setTimeout(scrollToBottom, 100);
    
    // Repetir después de 300ms por si hay imágenes u otro contenido que tarda
    const timeout2 = setTimeout(scrollToBottom, 300);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [messages, isLoading]); // 🔥 Scroll cuando cambian mensajes o estado de carga

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

      // 🔥 NUEVO: Detectar si es selector de proyectos
      const isProjectSelection = response.type === 'project_selection';
      
      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
        type: isProjectSelection ? 'project_selection' : 'text', // 🔥 NUEVO
        projects: isProjectSelection ? response.projects : undefined, // 🔥 NUEVO
        totalProjects: isProjectSelection ? response.totalProjects : undefined, // 🔥 NUEVO
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Actualizar progreso del proyecto si hay banderas
      if (response.context?.projectFlags && response.context?.projectData) {
        console.log('[ChatIA] ✅ Flags actualizados:', response.context.projectFlags);
        const newProgress = {
          flags: response.context.projectFlags,
          data: response.context.projectData,
        };
        setProjectProgress(newProgress);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('chatProjectProgress', JSON.stringify(newProgress));
      }

      // Si se creó un proyecto, notificar al padre
      if (response.context?.lastProjectId && onProjectCreated) {
        const projectId = response.context.lastProjectId;
        const bannerKey = `${sessionId}_${projectId}`;
        
        // Solo mostrar banner si NO se ha mostrado antes para este proyecto
        if (!shownProjectBanners.has(bannerKey)) {
          console.log('[ChatIA] 🎉 Nuevo proyecto creado:', projectId);
          
          onProjectCreated(projectId);
          
          // Mostrar celebración
          setProjectCreated(true);
          
          // Marcar que este banner ya se mostró
          setShownProjectBanners(prev => new Set(prev).add(bannerKey));
          
          // Limpiar progreso después de 3 segundos (celebración completa)
          setTimeout(() => {
            setProjectProgress(null);
            setProjectCreated(false);
            // Limpiar del localStorage también
            localStorage.removeItem('chatProjectProgress');
            console.log('[ChatIA] 🎉 Proyecto completado, progreso limpiado');
          }, 3000);
        } else {
          console.log('[ChatIA] ℹ️ Banner ya mostrado para proyecto:', projectId);
        }
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

  // Handler para cuando el usuario selecciona un proyecto existente
  const handleProjectSelection = (projectId: string) => {
    console.log('[ChatIA] 📋 Proyecto seleccionado:', projectId);
    handleSendMessage(`Quiero buscar equipos para el proyecto ${projectId}`);
  };

  // Handler para cuando el usuario quiere crear un nuevo proyecto
  const handleCreateNewProject = () => {
    console.log('[ChatIA] ➕ Usuario quiere crear nuevo proyecto');
    handleSendMessage('Quiero crear un nuevo proyecto');
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
    setProjectCreated(false); // Limpiar estado de celebración
    setShownProjectBanners(new Set()); // Limpiar banners en nueva sesión
    
    // Limpiar progreso del localStorage
    localStorage.removeItem('chatProjectProgress');
    console.log('[ChatIA] ✅ Chat limpiado completamente (incluye progreso y banners)');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center shadow-sm">
              <BridgeLogo variant="white" size="md" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Bridge AI</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Asistente inteligente</p>
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
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Limpiar chat"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Project Progress Banner - Outside messages, below header */}
      {projectProgress && (
        <ProjectProgressBanner 
          flags={projectProgress.flags}
          data={projectProgress.data}
          onProjectCreated={projectCreated}
        />
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors"
      >

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <BridgeLogo variant="white" size="lg" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              ¡Hola! Soy tu asistente Bridge AI
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-lg mb-8">
              Puedo ayudarte a crear proyectos, encontrar equipos especializados y conectarte con el talento ideal para tu empresa.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <button
                onClick={() => handleSendMessage('Quiero crear un proyecto nuevo')}
                className="group text-left p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-600 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">💡</div>
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Crear proyecto</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Describe tu idea y te ayudo a darle forma</p>
              </button>
              <button
                onClick={() => handleSendMessage('Muéstrame equipos disponibles')}
                className="group text-left p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-600 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">👥</div>
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Ver equipos</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Encuentra el talento perfecto</p>
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          // If message is project_selection type, render both ChatMessage and ProjectSelector
          if (message.type === 'project_selection' && message.projects) {
            return (
              <div key={index} className="space-y-4">
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  isLatest={index === messages.length - 1 && message.role === 'assistant'}
                  userAvatarUrl={userAvatarUrl}
                  userName={userName}
                />
                <ProjectSelector
                  projects={message.projects}
                  totalProjects={message.totalProjects || 0}
                  onSelectProject={handleProjectSelection}
                  onCreateNew={handleCreateNewProject}
                />
              </div>
            );
          }

          // Default: render regular ChatMessage
          return (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              isLatest={index === messages.length - 1 && message.role === 'assistant'}
              userAvatarUrl={userAvatarUrl}
              userName={userName}
            />
          );
        })}

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
