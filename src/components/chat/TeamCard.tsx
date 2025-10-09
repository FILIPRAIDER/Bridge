'use client';

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

interface TeamCardProps {
  team: Team;
  onViewDetails: () => void;
  onConnect: () => void;
}

export default function TeamCard({ team, onViewDetails, onConnect }: TeamCardProps) {
  // Determinar color según el score de coincidencia
  const scoreColor = team.matchScore >= 90 ? 'text-green-600' : 
                     team.matchScore >= 70 ? 'text-blue-600' : 
                     'text-gray-600';
  
  const scoreBgColor = team.matchScore >= 90 ? 'bg-green-100' : 
                       team.matchScore >= 70 ? 'bg-blue-100' : 
                       'bg-gray-100';

  // Avatar por defecto si no hay URL
  const avatarSrc = team.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=4F46E5&color=fff&size=96`;

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={avatarSrc}
            alt={team.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
            onError={(e) => {
              // Fallback si la imagen falla
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=4F46E5&color=fff&size=96`;
            }}
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>📍</span>
              {team.location}
            </p>
          </div>
        </div>
        
        {/* Match Score Badge */}
        <div className={`${scoreBgColor} ${scoreColor} px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1`}>
          <span className="text-base">⭐</span>
          <span>{team.matchScore}%</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Habilidades</p>
        <div className="flex flex-wrap gap-2">
          {team.skills.slice(0, 6).map((skill, idx) => (
            <span
              key={idx}
              className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium"
            >
              {skill}
            </span>
          ))}
          {team.skills.length > 6 && (
            <span className="text-xs text-gray-500 flex items-center">
              +{team.skills.length - 6} más
            </span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
          <span className="text-lg mb-1">👥</span>
          <span className="font-semibold text-gray-900">{team.members}</span>
          <span className="text-xs text-gray-500">Miembros</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
          <span className="text-lg mb-1">⭐</span>
          <span className="font-semibold text-gray-900">{team.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
          <span className="text-lg mb-1">📅</span>
          <span className="font-semibold text-gray-900 text-xs text-center">{team.availability}</span>
        </div>
      </div>

      {/* Explanation */}
      {team.explanation && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-900 leading-relaxed">
            <span className="font-semibold">Por qué encaja: </span>
            {team.explanation}
          </p>
        </div>
      )}

      {/* Experience Badge */}
      {team.experience && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">🏆 Experiencia:</span>
          <span>{team.experience} año{team.experience !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={onViewDetails}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
        >
          Ver Detalles
        </button>
        <button
          onClick={onConnect}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
        >
          Conectar
        </button>
      </div>
    </div>
  );
}
