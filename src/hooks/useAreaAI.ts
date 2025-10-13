import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface MemberSuggestion {
  memberId: string;
  memberName: string;
  memberEmail: string;
  matchScore: number;
  reasons: string[];
  suggestedRole: 'MEMBER' | 'LEADER';
  skillsMatch: number;
  workload: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface AreaInsight {
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ERROR';
  category: 'OVERLOAD' | 'SKILL_GAP' | 'BALANCED' | 'BOTTLENECK' | 'OPPORTUNITY';
  message: string;
  details: string[];
  actionLabel?: string;
  actionType?: string;
  actionData?: any;
}

interface SmartChatSuggestion {
  type: 'RESOURCE' | 'EXPERT' | 'CODE_SNIPPET' | 'DOCUMENTATION';
  title: string;
  description: string;
  resources?: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  experts?: Array<{
    name: string;
    expertise: string;
  }>;
}

interface AreaPrediction {
  areaId: string;
  areaName: string;
  trend: 'GROWING' | 'STABLE' | 'DECLINING';
  growthPercentage: number;
  predictedActivity: {
    files: number;
    messages: number;
    members: number;
  };
  recommendations: string[];
  suggestedActions: Array<{
    label: string;
    type: string;
    data: any;
  }>;
}

interface UseAreaAIReturn {
  // Asignación inteligente
  getSuggestions: (areaId: string) => Promise<MemberSuggestion[]>;
  loadingSuggestions: boolean;

  // Insights del área
  getAreaInsights: (teamId: string) => Promise<AreaInsight[]>;
  loadingInsights: boolean;

  // Chat inteligente
  getChatSuggestions: (areaId: string, message: string) => Promise<SmartChatSuggestion | null>;
  loadingChatSuggestions: boolean;

  // Generación de descripción
  generateDescription: (areaName: string, context?: string) => Promise<string>;
  loadingDescription: boolean;

  // Predicciones
  getPredictions: (teamId: string) => Promise<AreaPrediction[]>;
  loadingPredictions: boolean;

  // Detección de conflictos
  detectBottlenecks: (areaId: string) => Promise<AreaInsight[]>;
  loadingBottlenecks: boolean;

  error: string | null;
}

export function useAreaAI(): UseAreaAIReturn {
  const { data: session } = useSession();
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingChatSuggestions, setLoadingChatSuggestions] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loadingBottlenecks, setLoadingBottlenecks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 IMPORTANTE: Backend IA corre en puerto 4101 (dev) o bridge-ai-api.onrender.com (prod)
  const apiBaseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:4101';

  // Helper para obtener headers con autenticación
  // ⚠️ NOTA: Todos los endpoints de IA requieren autenticación según el equipo backend
  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Obtener token JWT de la sesión
    const token = (session as any)?.accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // 1. Sugerencias de asignación inteligente
  const getSuggestions = async (areaId: string): Promise<MemberSuggestion[]> => {
    setLoadingSuggestions(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/areas/${areaId}/suggest-members`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener sugerencias');
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return [];
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 2. Insights y análisis del área
  const getAreaInsights = async (teamId: string): Promise<AreaInsight[]> => {
    setLoadingInsights(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/teams/${teamId}/area-insights`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener insights');
      }

      const data = await response.json();
      return data.insights || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return [];
    } finally {
      setLoadingInsights(false);
    }
  };

  // 3. Sugerencias inteligentes en chat
  const getChatSuggestions = async (
    areaId: string,
    message: string
  ): Promise<SmartChatSuggestion | null> => {
    setLoadingChatSuggestions(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/areas/${areaId}/chat-suggestions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener sugerencias de chat');
      }

      const data = await response.json();
      return data.suggestion || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setLoadingChatSuggestions(false);
    }
  };

  // 4. Generación de descripción con IA
  const generateDescription = async (areaName: string, context?: string): Promise<string> => {
    setLoadingDescription(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/areas/generate-description`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ areaName, context }),
      });

      if (!response.ok) {
        throw new Error('Error al generar descripción');
      }

      const data = await response.json();
      return data.description || '';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return '';
    } finally {
      setLoadingDescription(false);
    }
  };

  // 5. Predicciones de actividad
  const getPredictions = async (teamId: string): Promise<AreaPrediction[]> => {
    setLoadingPredictions(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/teams/${teamId}/predictions`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener predicciones');
      }

      const data = await response.json();
      return data.predictions || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return [];
    } finally {
      setLoadingPredictions(false);
    }
  };

  // 6. Detección de cuellos de botella
  const detectBottlenecks = async (areaId: string): Promise<AreaInsight[]> => {
    setLoadingBottlenecks(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/areas/${areaId}/bottlenecks`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al detectar cuellos de botella');
      }

      const data = await response.json();
      return data.bottlenecks || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return [];
    } finally {
      setLoadingBottlenecks(false);
    }
  };

  return {
    getSuggestions,
    loadingSuggestions,
    getAreaInsights,
    loadingInsights,
    getChatSuggestions,
    loadingChatSuggestions,
    generateDescription,
    loadingDescription,
    getPredictions,
    loadingPredictions,
    detectBottlenecks,
    loadingBottlenecks,
    error,
  };
}
