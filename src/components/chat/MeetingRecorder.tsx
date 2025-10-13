"use client";

import { useMeetingMinutes } from "@/hooks/useMeetingMinutes";
import { 
  Mic, 
  Square, 
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface MeetingRecorderProps {
  teamId: string;  // ⚠️ NUEVO: Requerido
  areaId: string;
  areaName: string;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function MeetingRecorder({ teamId, areaId, areaName, onRecordingStateChange }: MeetingRecorderProps) {
  const { 
    minutes, 
    loading, 
    isRecording, 
    startRecording, 
    stopRecording, 
    clearMinutes 
  } = useMeetingMinutes(teamId, areaId);  // ⚠️ ACTUALIZADO
  
  const [showMinutes, setShowMinutes] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleStart = () => {
    startRecording();
    onRecordingStateChange?.(true);
    // Iniciar contador de tiempo
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    // Guardar interval para limpiarlo después
    (window as any).__meetingInterval = interval;
  };

  const handleToggle = () => {
    if (isRecording) {
      handleStop();
    } else {
      handleStart();
    }
  };

  const handleStop = async () => {
    if ((window as any).__meetingInterval) {
      clearInterval((window as any).__meetingInterval);
    }
    setElapsedTime(0);
    onRecordingStateChange?.(false);
    
    const result = await stopRecording();
    if (result) {
      setShowMinutes(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Botón oculto para controlar desde el header */}
      <button
        id="meeting-recorder-btn"
        onClick={handleToggle}
        className="hidden"
        aria-hidden="true"
      />

      {/* Indicador de Grabación Compacto */}
      {isRecording && (
        <div className="fixed bottom-6 right-6 z-40 bg-white border-2 border-red-500 rounded-xl p-4 shadow-xl min-w-[280px] animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="font-bold text-red-900">Grabando Minuta</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Los mensajes se están registrando automáticamente
          </p>

          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full font-medium disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                Finalizar y Generar
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal de Minuta Generada */}
      {showMinutes && minutes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{minutes.title}</h2>
                    <p className="text-red-100 text-sm mt-1">
                      {minutes.date} • Duración: {minutes.duration}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowMinutes(false);
                    clearMinutes();
                  }}
                  className="h-10 w-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6 custom-scrollbar">
              {/* Participantes */}
              <section className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                  Participantes ({minutes.participants.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {minutes.participants.map((participant, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border border-orange-200 rounded-lg text-sm font-medium text-gray-700">
                      {participant}
                    </span>
                  ))}
                </div>
              </section>

              {/* Resumen */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3">📋 Resumen General</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {minutes.summary}
                </p>
              </section>

              {/* Temas Discutidos */}
              {minutes.topics.length > 0 && (
                <section>
                  <h3 className="font-bold text-gray-900 mb-4">💬 Temas Discutidos</h3>
                  <div className="space-y-4">
                    {minutes.topics.map((topic, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-900 mb-2">{topic.topic}</h4>
                        <p className="text-sm text-gray-700 mb-3">{topic.discussion}</p>
                        {topic.decisions.length > 0 && (
                          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                            <p className="text-xs font-semibold text-green-900 mb-2">Decisiones:</p>
                            <ul className="text-sm text-green-800 space-y-1">
                              {topic.decisions.map((decision, j) => (
                                <li key={j} className="flex gap-2">
                                  <span>•</span>
                                  <span>{decision}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tareas y Compromisos */}
              {minutes.actionItems.length > 0 && (
                <section>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Tareas y Compromisos
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tarea</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Responsable</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha Límite</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prioridad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {minutes.actionItems.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.task}</td>
                            <td className="px-4 py-3 text-sm">
                              {item.assignee || <span className="text-gray-400 italic">Sin asignar</span>}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.deadline || <span className="text-gray-400 italic">Sin fecha</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.priority === "HIGH" ? "bg-red-100 text-red-800" :
                                item.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Próxima Reunión */}
              {minutes.nextMeeting && (
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Próxima Reunión
                  </h3>
                  <p className="text-blue-800">{minutes.nextMeeting}</p>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Minuta generada por IA • Revisa y edita según necesidad
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log("Export PDF", minutes);
                    // TODO: Implementar export
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
