"use client";

import { useState } from "react";
import { useChatSummary } from "@/hooks/useChatSummary";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  Users,
  Target,
  Sparkles,
  Download
} from "lucide-react";

interface ConversationSummaryModalProps {
  teamId: string;  // ⚠️ NUEVO: Requerido
  areaId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationSummaryModal({ 
  teamId,
  areaId, 
  isOpen, 
  onClose 
}: ConversationSummaryModalProps) {
  const [messageCount, setMessageCount] = useState(50);
  const { summarize, summary, loading, error } = useChatSummary(teamId, areaId);  // ⚠️ ACTUALIZADO

  const handleSummarize = async () => {
    await summarize(messageCount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Resumen Inteligente</h2>
                <p className="text-purple-100 text-sm mt-1">Generado por IA • ChatGPT 4</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-10 w-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Analizar últimos:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={messageCount}
                  onChange={(e) => setMessageCount(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm font-semibold text-gray-900 w-16">
                  {messageCount} msgs
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar Resumen
                </>
              )}
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          {loading && !summary && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Analizando conversación...</p>
              <p className="text-gray-500 text-sm mt-2">Esto puede tomar unos segundos</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error al generar resumen</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {summary && !loading && (
            <div className="space-y-6">
              {/* Resumen General */}
              <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Resumen General</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                    {summary.messageCount} mensajes
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(summary.timeRange.from).toLocaleDateString()} - 
                    {new Date(summary.timeRange.to).toLocaleDateString()}
                  </span>
                </div>
              </section>

              {/* Temas Principales */}
              {summary.mainTopics.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Temas Principales</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.mainTopics.map((topic, i) => (
                      <span 
                        key={i}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Decisiones */}
              {summary.decisions.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">Decisiones Tomadas</h3>
                  </div>
                  <div className="space-y-3">
                    {summary.decisions.map((decision, i) => (
                      <div key={i} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <p className="font-semibold text-green-900 mb-1">{decision.decision}</p>
                        <p className="text-sm text-green-700">{decision.context}</p>
                        {decision.participants.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Users className="h-3 w-3 text-green-600" />
                            <p className="text-xs text-green-600">
                              {decision.participants.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tareas */}
              {summary.tasks.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900">Tareas Identificadas</h3>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tarea</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Asignado</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prioridad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {summary.tasks.map((task, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{task.task}</td>
                            <td className="px-4 py-3 text-sm">
                              {task.assignee ? (
                                <span className="text-gray-900">{task.assignee}</span>
                              ) : (
                                <span className="text-gray-400 italic">Sin asignar</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {task.deadline ? (
                                <span className="text-gray-900">{task.deadline}</span>
                              ) : (
                                <span className="text-gray-400 italic">Sin fecha</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                task.priority === "HIGH" ? "bg-red-100 text-red-800" :
                                task.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {task.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Próximos Pasos */}
              {summary.nextSteps.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Próximos Pasos</h3>
                  </div>
                  <ol className="space-y-2">
                    {summary.nextSteps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Participantes */}
              {summary.participants.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Participantes Activos</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {summary.participants.map((participant, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <p className="font-semibold text-gray-900">{participant.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Nivel de participación: <span className="font-medium">{participant.contributionLevel}</span>
                        </p>
                        {participant.mainTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {participant.mainTopics.slice(0, 3).map((topic, j) => (
                              <span key={j} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {summary && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Resumen generado por IA • Revisa la información importante
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log("Export PDF", summary);
                  // TODO: Implementar export PDF
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
