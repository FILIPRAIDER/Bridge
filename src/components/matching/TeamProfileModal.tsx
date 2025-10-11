"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Star,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Users,
  Calendar,
  DollarSign,
  Award,
  Briefcase
} from 'lucide-react';
import { TeamProfile } from '@/types/matching';
import { formatCurrency } from '@/utils/currency';

interface TeamProfileModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (teamId: string) => void;
  useMockData?: boolean; // Para testing sin backend
}

export const TeamProfileModal: React.FC<TeamProfileModalProps> = ({
  teamId,
  isOpen,
  onClose,
  onConnect,
  useMockData = true // Default true para testing
}) => {
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'portfolio'>('overview');

  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamProfile();
    }
  }, [isOpen, teamId]);

  const fetchTeamProfile = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        // Usar mock data para testing
        const { mockTeamProfiles } = await import('@/mocks/matchingData');
        const mockProfile = mockTeamProfiles[teamId];
        if (mockProfile) {
          setProfile(mockProfile);
        } else {
          console.error('Mock profile not found for teamId:', teamId);
        }
      } else {
        // Llamada real al backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
        const response = await fetch(`${apiUrl}/teams/${teamId}/profile`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el perfil');
        }
        
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching team profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatBudgetAmount = (amount: number, currency: string) => {
    return formatCurrency(amount, currency as 'COP' | 'USD');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : profile ? (
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
                <div className="flex items-start space-x-6">
                  <img
                    src={profile.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=Team'}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-3xl font-bold">{profile.name}</h2>
                      {profile.verified && (
                        <CheckCircle className="w-7 h-7 text-blue-200" />
                      )}
                    </div>
                    
                    <p className="text-blue-100 mb-4">{profile.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.city}, {profile.country}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span className="font-semibold">{profile.rating}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{profile.completedProjects} proyectos completados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex space-x-8 px-8">
                  {[
                    { id: 'overview', label: 'Resumen', icon: Award },
                    { id: 'members', label: 'Equipo', icon: Users },
                    { id: 'portfolio', label: 'Portfolio', icon: Briefcase }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.website && (
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {profile.website}
                            </a>
                          </div>
                        )}
                        
                        {profile.email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                              {profile.email}
                            </a>
                          </div>
                        )}
                        
                        {profile.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Habilidades Técnicas</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {profile.skills?.map((skill) => (
                          <div key={skill.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                L{skill.level}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{skill.yearsExperience} años</p>
                            
                            {/* Skill Level Bar */}
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 rounded-full h-2 transition-all"
                                style={{ width: `${(skill.level / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Availability & Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Availability */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <span>Disponibilidad</span>
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <span className={`font-semibold ${
                              profile.availability?.status === 'AVAILABLE' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {profile.availability?.status === 'AVAILABLE' ? 'Disponible' : 'Ocupado'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Desde:</span>
                            <span className="font-semibold">{profile.availability?.availableFrom}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Horas/semana:</span>
                            <span className="font-semibold">{profile.availability?.hoursPerWeek}h</span>
                          </div>
                        </div>
                      </div>

                      {/* Budget Range */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-gray-600" />
                          <span>Rango de Presupuesto</span>
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mínimo:</span>
                            <span className="font-semibold">
                              {formatBudgetAmount(profile.budgetRange?.min || 0, profile.budgetRange?.currency || 'COP')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Máximo:</span>
                            <span className="font-semibold">
                              {formatBudgetAmount(profile.budgetRange?.max || 0, profile.budgetRange?.currency || 'COP')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.members?.map((member) => (
                      <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover bg-gray-100"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                            <p className="text-xs text-gray-500 mb-3">{member.yearsExperience} años de experiencia</p>
                            
                            <div className="flex flex-wrap gap-2">
                              {member.skills?.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {member.skills && member.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{member.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.portfolio?.map((project) => (
                      <div key={project.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {project.image && (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-6">
                          <h4 className="font-semibold text-lg text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies?.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Completado: {new Date(project.completedAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Connect Button */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={() => onConnect(teamId)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Users className="w-5 h-5" />
                  <span>Conectar con este Equipo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600">
              No se pudo cargar el perfil del equipo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
