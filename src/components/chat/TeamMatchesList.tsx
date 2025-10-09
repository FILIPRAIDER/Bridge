'use client';

import { useState } from 'react';
import TeamCard from './TeamCard';
import TeamDetailsModal from './TeamDetailsModal';

interface Team {
  teamId: string;
  name: string;
  avatarUrl?: string;
  skills: string[];
  members: number;
  rating: number;
  location: string;
  availability: string;
  matchScore: number;
  explanation?: string;
  experience?: number | null;
}

interface TeamMatchesListProps {
  projectId?: string;
  teams: Team[];
  totalMatches: number;
}

export default function TeamMatchesList({ projectId, teams, totalMatches }: TeamMatchesListProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleConnect = (teamId: string) => {
    // TODO: Implementar lógica para conectar con el equipo
    console.log('🤝 Conectando con equipo:', teamId);
    
    // Aquí puedes:
    // 1. Abrir modal de contacto
    // 2. Iniciar chat con el líder del equipo
    // 3. Enviar solicitud de conexión
    // 4. Redirigir a página de detalles
  };

  return (
    <div className="my-6 space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Equipos Encontrados
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {totalMatches} equipo{totalMatches !== 1 ? 's' : ''} que coincide{totalMatches !== 1 ? 'n' : ''} con tu proyecto
          </p>
        </div>
        
        {/* Badge de resultados */}
        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {totalMatches} resultado{totalMatches !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map(team => (
          <TeamCard
            key={team.teamId}
            team={team}
            onViewDetails={() => setSelectedTeam(team)}
            onConnect={() => handleConnect(team.teamId)}
          />
        ))}
      </div>

      {/* Empty state (si no hay equipos) */}
      {teams.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron equipos
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Intenta ajustar los criterios de búsqueda o describe tu proyecto de forma más específica.
          </p>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onConnect={() => {
            handleConnect(selectedTeam.teamId);
            setSelectedTeam(null);
          }}
        />
      )}
    </div>
  );
}
