"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/chat/ChatMessage';
import { MatchingResults } from '@/components/matching';
import { mockTeamCandidates } from '@/mocks/matchingData';
import { Send } from 'lucide-react';

/**
 * 🧪 PÁGINA DE TESTING: Simulación del Chat con Matching Results
 * 
 * Esta página simula exactamente el flujo que verías en ChatIA.tsx
 * cuando el AI-API envía metadata con matching results.
 * 
 * Para acceder: /matching/chat-test
 * 
 * Casos de prueba:
 * 1. Click "Simular Búsqueda de Equipos" → Debe aparecer MatchingResults
 * 2. Click en "Ver Perfil" → Debe abrir modal con perfil completo
 * 3. Click en "Conectar" → Debe abrir formulario de conexión
 * 4. Enviar conexión → Debe mostrar confirmación de éxito
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'project_selection' | 'team_matching';
  metadata?: {
    action?: string;
    projectId?: string;
    companyId?: string;
    matchingResults?: {
      candidates: any[];
      totalCandidates: number;
    };
  };
}

export default function ChatTestPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de Bridge. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [testStep, setTestStep] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para simular la búsqueda de equipos
  const simulateTeamSearch = () => {
    // 1. Mensaje del usuario
    const userMessage: Message = {
      role: 'user',
      content: 'busca equipos',
      timestamp: new Date(),
      type: 'text'
    };

    // 2. Respuesta del asistente con metadata de matching
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: '¡Excelente! He encontrado 3 equipos que son perfectos para tu proyecto. Tienen las habilidades que necesitas y están disponibles para comenzar.',
        timestamp: new Date(),
        type: 'team_matching',
        metadata: {
          action: 'SHOW_MATCHING_RESULTS',
          projectId: 'cmglsjj54000c5msjhw7opn7r',
          companyId: 'cmgiy2gdz0000e8md6plp9rgl',
          matchingResults: {
            candidates: mockTeamCandidates,
            totalCandidates: mockTeamCandidates.length
          }
        }
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setTestStep(2);

      // Log para debugging
      console.log('[ChatTest] 🎯 Mensaje de matching enviado:', {
        type: assistantMessage.type,
        action: assistantMessage.metadata?.action,
        totalCandidates: assistantMessage.metadata?.matchingResults?.totalCandidates
      });
    }, 500);
  };

  // Función para resetear el test
  const resetTest = () => {
    setMessages([
      {
        role: 'assistant',
        content: '¡Hola! Soy tu asistente de Bridge. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    setTestStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de Testing */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                🧪 Chat Test - Matching Results
              </h1>
              <p className="text-blue-100">
                Simula el flujo completo de búsqueda de equipos en el chat
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-1">Paso actual:</div>
              <div className="text-3xl font-bold">{testStep}/2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Instrucciones */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold">
                {testStep}
              </div>
            </div>
            <div className="flex-1">
              {testStep === 1 && (
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Paso 1: Simular Búsqueda de Equipos
                  </h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    Click el botón azul para simular que el usuario escribe "busca equipos" 
                    y el AI-API responde con matching results.
                  </p>
                  <button
                    onClick={simulateTeamSearch}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Simular: "busca equipos"
                  </button>
                </div>
              )}
              {testStep === 2 && (
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Paso 2: Interactuar con los Equipos
                  </h3>
                  <p className="text-sm text-yellow-800 mb-2">
                    ✅ Los componentes de matching se renderizaron correctamente!
                  </p>
                  <div className="text-sm text-yellow-700 space-y-1 mb-3">
                    <div>• Click "Ver Perfil" para abrir el modal con información completa</div>
                    <div>• Click "Conectar con este Equipo" para simular una solicitud</div>
                    <div>• Verifica que los modales se abren y cierran correctamente</div>
                  </div>
                  <button
                    onClick={resetTest}
                    className="inline-flex items-center px-4 py-2 border-2 border-yellow-600 text-yellow-700 hover:bg-yellow-100 font-medium rounded-lg transition-colors duration-200"
                  >
                    🔄 Reiniciar Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Chat de Testing
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Simula exactamente el comportamiento de ChatIA.tsx
            </p>
          </div>

          {/* Messages Area */}
          <div className="p-6 space-y-6 min-h-[500px] max-h-[700px] overflow-y-auto">
            {messages.map((message, index) => {
              // Si el mensaje tiene resultados de matching
              if (message.type === 'team_matching' && message.metadata?.matchingResults) {
                return (
                  <div key={index} className="space-y-6">
                    {/* Mensaje de texto */}
                    <ChatMessage
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                    
                    {/* Componente de Matching Results */}
                    <div className="mt-6 border-t-4 border-blue-500 pt-6">
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">🎯 Componente Renderizado:</span> MatchingResults
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          projectId: {message.metadata.projectId} | 
                          companyId: {message.metadata.companyId} | 
                          candidates: {message.metadata.matchingResults.totalCandidates}
                        </p>
                      </div>
                      
                      <MatchingResults
                        projectId={message.metadata.projectId!}
                        companyId={message.metadata.companyId!}
                        candidates={message.metadata.matchingResults.candidates}
                        useMockData={true}
                      />
                    </div>
                  </div>
                );
              }

              // Mensajes normales de texto
              return (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Debug Info */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                🔍 Ver Logs de Debugging
              </summary>
              <div className="mt-3 space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className="bg-white rounded p-3 text-xs font-mono">
                    <div className="text-gray-500">Mensaje {i + 1}:</div>
                    <div className="mt-1">
                      <span className="text-purple-600">role:</span> {msg.role} | 
                      <span className="text-purple-600"> type:</span> {msg.type || 'undefined'} | 
                      <span className="text-purple-600"> metadata:</span> {msg.metadata ? '✅' : '❌'}
                    </div>
                    {msg.metadata && (
                      <div className="mt-1 pl-4 border-l-2 border-blue-300">
                        <div><span className="text-blue-600">action:</span> {msg.metadata.action}</div>
                        <div><span className="text-blue-600">candidates:</span> {msg.metadata.matchingResults?.totalCandidates}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Testing Checklist */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">✅ Checklist de Testing</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>El botón "Simular: busca equipos" envía el mensaje correctamente</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>El componente MatchingResults se renderiza debajo del mensaje de la IA</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>Se muestran las 3 tarjetas de equipos con sus porcentajes de match</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>El botón "Ver Perfil" abre el modal TeamProfileModal</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>El modal muestra las 3 pestañas: Resumen, Miembros, Portafolio</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>El botón "Conectar con este Equipo" abre el ConnectModal</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>Se puede escribir un mensaje en el formulario de conexión</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>Al enviar la solicitud aparece el banner de confirmación verde</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>Los modales se cierran correctamente al hacer click fuera o en la X</span>
            </label>
            <label className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span>El botón "Reiniciar Test" vuelve al estado inicial</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
