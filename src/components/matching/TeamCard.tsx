"use client";

import React from 'react';
import { Star, MapPin, CheckCircle, Users } from 'lucide-react';
import { TeamCandidate } from '@/types/matching';

interface TeamCardProps {
  candidate: TeamCandidate;
  onViewProfile: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ candidate, onViewProfile }) => {
  const { team, matchPercentage, matchedSkills, missingSkills } = candidate;

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getAvailabilityBadge = (status: string) => {
    const badges = {
      AVAILABLE: { text: 'Disponible', color: 'bg-green-100 text-green-800' },
      BUSY: { text: 'Ocupado', color: 'bg-yellow-100 text-yellow-800' },
      NOT_AVAILABLE: { text: 'No disponible', color: 'bg-red-100 text-red-800' }
    };
    return badges[status as keyof typeof badges] || badges.NOT_AVAILABLE;
  };

  const availabilityBadge = getAvailabilityBadge(team.availability);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Team Image */}
          <img
            src={team.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=Team'}
            alt={team.name}
            className="w-16 h-16 rounded-full object-cover bg-gray-100"
          />
          
          {/* Team Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
              {team.verified && (
                <div title="Verificado">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{team.city}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{team.rating}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{team.totalProjects} proyectos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Badge */}
        <div className={`px-4 py-2 rounded-full font-bold text-lg ${getMatchColor(matchPercentage)}`}>
          {matchPercentage}% Match
        </div>
      </div>

      {/* Availability Badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${availabilityBadge.color}`}>
          {availabilityBadge.text}
        </span>
      </div>

      {/* Skills Section */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          ✅ Skills Coincidentes ({matchedSkills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.slice(0, 5).map((skill) => (
            <div
              key={skill.name}
              className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
            >
              {skill.name} <span className="text-xs">L{skill.teamLevel}</span>
            </div>
          ))}
          {matchedSkills.length > 5 && (
            <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{matchedSkills.length - 5} más
            </div>
          )}
        </div>
      </div>

      {missingSkills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            ⚠️ Skills Faltantes ({missingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.slice(0, 3).map((skill) => (
              <div
                key={skill}
                className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
              >
                {skill}
              </div>
            ))}
            {missingSkills.length > 3 && (
              <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{missingSkills.length - 3} más
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onViewProfile(team.id)}
        className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <Users className="w-5 h-5" />
        <span>Ver Perfil del Equipo</span>
      </button>
    </div>
  );
};
