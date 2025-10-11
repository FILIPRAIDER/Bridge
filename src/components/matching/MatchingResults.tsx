"use client";

import React, { useState } from 'react';
import { TeamCard } from './TeamCard';
import { TeamProfileModal } from './TeamProfileModal';
import { ConnectModal } from './ConnectModal';
import { CheckCircle } from 'lucide-react';
import { TeamCandidate } from '@/types/matching';

interface MatchingResultsProps {
  projectId: string;
  companyId: string;
  candidates: TeamCandidate[];
  useMockData?: boolean;
}

export const MatchingResults: React.FC<MatchingResultsProps> = ({
  projectId,
  companyId,
  candidates,
  useMockData = true
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');

  const handleViewProfile = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowProfileModal(true);
  };

  const handleConnect = (teamId: string) => {
    const candidate = candidates.find(c => c.team.id === teamId);
    if (candidate) {
      setSelectedTeamId(teamId);
      setSelectedTeamName(candidate.team.name);
      setShowProfileModal(false);
      setShowConnectModal(true);
    }
  };

  const handleConnectionSuccess = () => {
    setConnectionSuccess(true);
    setTimeout(() => {
      setConnectionSuccess(false);
    }, 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Equipos Encontrados 🎯
        </h1>
        <p className="text-gray-600">
          Encontramos <span className="font-semibold text-blue-600">{candidates.length} equipos</span> que coinciden con tu proyecto
        </p>
      </div>

      {/* Success Banner */}
      {connectionSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-fade-in">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">¡Solicitud enviada exitosamente! ✨</p>
            <p className="text-sm text-green-700">El equipo recibirá una notificación y te contactará pronto</p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {candidates.map((candidate) => (
            <TeamCard
              key={candidate.team.id}
              candidate={candidate}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron equipos para este proyecto</p>
        </div>
      )}

      {/* Modals */}
      {selectedTeamId && (
        <>
          <TeamProfileModal
            teamId={selectedTeamId}
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onConnect={handleConnect}
            useMockData={useMockData}
          />

          <ConnectModal
            teamName={selectedTeamName}
            teamId={selectedTeamId}
            projectId={projectId}
            companyId={companyId}
            isOpen={showConnectModal}
            onClose={() => setShowConnectModal(false)}
            onSuccess={handleConnectionSuccess}
          />
        </>
      )}
    </div>
  );
};
