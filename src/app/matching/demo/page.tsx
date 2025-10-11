"use client";

import React from 'react';
import { MatchingResults } from '@/components/matching';
import { mockTeamCandidates } from '@/mocks/matchingData';

/**
 * Página de ejemplo para probar los componentes de matching
 * Esta página usa mock data para testing sin necesidad del backend
 * 
 * Para acceder: /matching/demo
 * 
 * TODO: Integrar con el flujo real del chat cuando el backend esté listo
 */
export default function MatchingDemoPage() {
  // IDs de ejemplo - en producción vendrían del contexto/sesión
  const mockProjectId = "project_123";
  const mockCompanyId = "company_456";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de Demo */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">🧪 Modo Demo:</span> Esta página usa datos de prueba. 
            Los endpoints del backend aún no están implementados.
          </p>
        </div>
      </div>

      {/* Componente Principal */}
      <MatchingResults
        projectId={mockProjectId}
        companyId={mockCompanyId}
        candidates={mockTeamCandidates}
        useMockData={true}
      />
    </div>
  );
}
