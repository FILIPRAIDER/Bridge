"use client";

import { useState, useEffect } from 'react';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLatest?: boolean; // Para aplicar efecto de escritura solo al último mensaje
}

// Función para formatear markdown simple
function formatMarkdown(text: string) {
  // Reemplazar **texto** por <strong>texto</strong>
  let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Reemplazar *texto* por <em>texto</em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  
  // Reemplazar listas numeradas
  formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex gap-2 my-1"><span class="font-semibold text-gray-700">$1.</span><span>$2</span></div>');
  
  // Reemplazar listas con viñetas
  formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<div class="flex gap-2 my-1"><span>•</span><span>$1</span></div>');
  
  // Reemplazar saltos de línea dobles por párrafos
  formatted = formatted.replace(/\n\n/g, '</p><p class="mt-3">');
  
  return `<p>${formatted}</p>`;
}

export default function ChatMessage({ role, content, timestamp, isLatest = false }: ChatMessageProps) {
  const isUser = role === 'user';
  const [displayedContent, setDisplayedContent] = useState(isUser ? content : '');
  const [isTyping, setIsTyping] = useState(!isUser && isLatest);

  // Efecto de escritura para mensajes del asistente
  useEffect(() => {
    if (!isUser && isLatest && content) {
      let index = 0;
      setDisplayedContent('');
      setIsTyping(true);

      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.substring(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 15); // Velocidad de escritura (15ms por carácter)

      return () => clearInterval(interval);
    } else if (!isUser) {
      setDisplayedContent(content);
      setIsTyping(false);
    }
  }, [content, isUser, isLatest]);

  const formattedContent = isUser ? content : formatMarkdown(displayedContent);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar del asistente */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-tr-sm'
              : 'bg-white text-gray-900 rounded-tl-sm border border-gray-200'
          }`}
        >
          {isUser ? (
            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          ) : (
            <div 
              className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          )}
          
          {/* Indicador de escritura */}
          {isTyping && (
            <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center mt-1 px-2">
          <span className="text-xs text-gray-400">
            {timestamp.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      {/* Avatar del usuario */}
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
}
