'use client';

import { X } from 'lucide-react';

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

interface TeamDetailsModalProps {
  team: Team;
  onClose: () => void;
  onConnect: () => void;
}

export default function TeamDetailsModal({ team, onClose, onConnect }: TeamDetailsModalProps) {
  const scoreColor = team.matchScore >= 90 ? 'text-green-600' : 
                     team.matchScore >= 70 ? 'text-blue-600' : 
                     'text-gray-600';
  
  const scoreBgColor = team.matchScore >= 90 ? 'bg-green-100' : 
                       team.matchScore >= 70 ? 'bg-blue-100' : 
                       'bg-gray-100';

  const avatarSrc = team.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=4F46E5&color=fff&size=128`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Equipo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Team Info */}
          <div className="flex items-start gap-4">
            <img
              src={avatarSrc}
              alt={team.name}
              className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=4F46E5&color=fff&size=128`;
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>📍</span>
                <span>{team.location}</span>
              </div>
              <div className={`inline-flex items-center gap-2 ${scoreBgColor} ${scoreColor} px-4 py-2 rounded-full text-sm font-bold`}>
                <span className="text-lg">⭐</span>
                <span>{team.matchScore}% de coincidencia</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          {team.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>💡</span>
                Por qué este equipo es ideal para ti
              </h4>
              <p className="text-blue-800 leading-relaxed">
                {team.explanation}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-gray-900">{team.members}</div>
              <div className="text-sm text-gray-500">Miembros</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-gray-900">{team.rating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-900">{team.experience || 'N/A'}</div>
              <div className="text-sm text-gray-500">Años exp.</div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <span>📅</span>
              Disponibilidad
            </h4>
            <p className="text-green-800">{team.availability}</p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🛠️</span>
              Habilidades del Equipo
            </h4>
            <div className="flex flex-wrap gap-2">
              {team.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-white text-gray-700 font-medium transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={onConnect}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            Conectar con Equipo
          </button>
        </div>
      </div>
    </div>
  );
}
