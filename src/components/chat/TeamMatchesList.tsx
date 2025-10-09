'use client';

import { useState } from 'react';
import { Info, Sparkles, Search } from 'lucide-react';
import TeamCard from './TeamCard';
import TeamDetailsModal from './TeamDetailsModal';

interface MatchedSkill {
  teamSkill: string;
  searchSkill: string;
  matchType: 'exact' | 'partial';
  score: number;
}

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
  matchedSkills?: MatchedSkill[];
}

interface SearchInfo {
  originalSkills: string[];
  expandedSkills: string[];
  totalTeamsAnalyzed: number;
  teamsWithSkills?: number;
}

interface TeamMatchesListProps {
  projectId?: string;
  teams: Team[];
  totalMatches: number;
  searchInfo?: SearchInfo; // 🔥 NUEVO: Info de la búsqueda inteligente
}

export default function TeamMatchesList({ projectId, teams, totalMatches, searchInfo }: TeamMatchesListProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showSearchDetails, setShowSearchDetails] = useState(false);

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
      {/* 🔥 NUEVO: Search Info Banner */}
      {searchInfo && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold text-gray-900">Búsqueda Inteligente Activada</h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Nuevo ✨
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                Analicé <strong>{searchInfo.totalTeamsAnalyzed} equipos</strong> buscando:{' '}
                <strong className="text-blue-700">{searchInfo.originalSkills.join(', ')}</strong>
              </p>
              
              {/* Expandible para ver skills relacionadas */}
              <button
                onClick={() => setShowSearchDetails(!showSearchDetails)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Search className="w-3 h-3" />
                <span>{showSearchDetails ? 'Ocultar' : 'Ver'} skills relacionadas buscadas</span>
              </button>
              
              {showSearchDetails && (
                <div className="mt-3 p-3 bg-white/80 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1 font-medium">
                    También busqué equipos con estas tecnologías relacionadas:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {searchInfo.expandedSkills
                      .filter(skill => !searchInfo.originalSkills.includes(skill))
                      .slice(0, 15)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    {searchInfo.expandedSkills.length > 15 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        +{searchInfo.expandedSkills.length - 15} más
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-blue-100">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <span>
                        Esto mejora los resultados encontrando equipos con skills equivalentes o relacionadas
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
