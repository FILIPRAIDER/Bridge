"use client";

import { Brain, X, Sparkles, MessageCircle } from "lucide-react";
import type { AIAssistantResponse } from "@/types/ai-chat";

interface AIAssistantMessageProps {
  response: AIAssistantResponse;
  onClose: () => void;
}

export function AIAssistantMessage({ response, onClose }: AIAssistantMessageProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Mensaje del Asistente */}
      <div className="flex gap-3">
        {/* Avatar IA */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-1 max-w-[85%]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-purple-900 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Asistente IA
            </span>
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {response.confidence && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                {Math.round(response.confidence)}% confianza
              </span>
            )}
          </div>

          {/* Bubble principal */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
              {/* Respuesta */}
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {response.answer}
              </p>

              {/* Fuentes */}
              {response.sources && response.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs font-semibold text-purple-900 mb-2">
                    📚 Basado en {response.sources.length} mensaje{response.sources.length !== 1 ? "s" : ""}:
                  </p>
                  <div className="space-y-2">
                    {response.sources.slice(0, 3).map((source, i) => (
                      <div key={i} className="bg-white bg-opacity-60 rounded-lg p-2 text-xs">
                        <p className="font-medium text-gray-900">{source.author}</p>
                        <p className="text-gray-600 line-clamp-2">{source.content}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(source.timestamp).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preguntas sugeridas */}
              {response.suggestedQuestions && response.suggestedQuestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    También puedes preguntar:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {response.suggestedQuestions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          // Aquí se podría hacer otra pregunta automáticamente
                          console.log("Pregunta sugerida:", question);
                        }}
                        className="text-xs bg-white hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 p-1.5 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-full shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-all"
              title="Cerrar respuesta"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Hint */}
          <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Generado por IA • Verifica la información importante
          </p>
        </div>
      </div>
    </div>
  );
}
