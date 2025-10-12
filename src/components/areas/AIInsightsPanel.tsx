'use client';

import { useState, useEffect } from 'react';
import { useAreaAI } from '@/hooks/useAreaAI';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Info,
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  FileText,
  MessageSquare,
  Loader2,
  X
} from 'lucide-react';

interface AIInsightsPanelProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIInsightsPanel({ teamId, isOpen, onClose }: AIInsightsPanelProps) {
  const { getAreaInsights, getPredictions, loadingInsights, loadingPredictions, error } = useAreaAI();
  const [insights, setInsights] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && teamId) {
      loadData();
    }
  }, [isOpen, teamId]);

  const loadData = async () => {
    const [insightsData, predictionsData] = await Promise.all([
      getAreaInsights(teamId),
      getPredictions(teamId),
    ]);
    setInsights(insightsData);
    setPredictions(predictionsData);
  };

  if (!isOpen) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'WARNING':
        return 'from-orange-50 to-orange-100 border-orange-200';
      case 'ERROR':
        return 'from-red-50 to-red-100 border-red-200';
      case 'SUCCESS':
        return 'from-green-50 to-green-100 border-green-200';
      default:
        return 'from-blue-50 to-blue-100 border-blue-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'GROWING':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'DECLINING':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] m-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Análisis IA</h2>
                <p className="text-sm text-gray-300">
                  Insights y recomendaciones inteligentes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Loading State */}
          {(loadingInsights || loadingPredictions) && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                <p className="text-gray-600">Analizando tu equipo...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error al cargar insights</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Insights Section */}
          {!loadingInsights && insights.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                Alertas Inteligentes
              </h3>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${getInsightColor(
                      insight.type
                    )} border rounded-xl p-4`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{insight.message}</p>
                        {insight.details && insight.details.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {insight.details.map((detail: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {insight.actionLabel && (
                          <button className="mt-3 px-4 py-2 bg-white/80 hover:bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                            {insight.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictions Section */}
          {!loadingPredictions && predictions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Predicciones
              </h3>
              <div className="space-y-3">
                {predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      {getTrendIcon(prediction.trend)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {prediction.areaName}
                          </h4>
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded-full ${
                              prediction.trend === 'GROWING'
                                ? 'bg-green-100 text-green-700'
                                : prediction.trend === 'DECLINING'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {prediction.growthPercentage > 0 ? '+' : ''}
                            {prediction.growthPercentage}%
                          </span>
                        </div>

                        {/* Predicted Activity */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-blue-700">Archivos</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">
                              {prediction.predictedActivity.files}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-700">Mensajes</span>
                            </div>
                            <p className="text-lg font-bold text-green-900">
                              {prediction.predictedActivity.messages}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-purple-600" />
                              <span className="text-xs text-purple-700">Miembros</span>
                            </div>
                            <p className="text-lg font-bold text-purple-900">
                              {prediction.predictedActivity.members}
                            </p>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {prediction.recommendations && prediction.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">
                              💡 Recomendaciones:
                            </p>
                            <ul className="space-y-1">
                              {prediction.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-gray-400 mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        {prediction.suggestedActions && prediction.suggestedActions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {prediction.suggestedActions.map((action: any, idx: number) => (
                              <button
                                key={idx}
                                className="px-3 py-1.5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg text-sm font-medium transition-all"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingInsights &&
            !loadingPredictions &&
            insights.length === 0 &&
            predictions.length === 0 &&
            !error && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Todo en orden
                </h3>
                <p className="text-sm text-gray-600">
                  No hay alertas ni recomendaciones en este momento
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Última actualización: {new Date().toLocaleTimeString('es-ES')}
            </p>
            <button
              onClick={loadData}
              disabled={loadingInsights || loadingPredictions}
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Actualizar Análisis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
