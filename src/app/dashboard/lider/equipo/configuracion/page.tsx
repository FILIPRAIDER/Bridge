"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Camera, 
  Save, 
  X, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { TeamAvatarWithCamera } from '@/components/shared/TeamAvatarWithCamera';
import { BridgeLogo } from '@/components/shared/BridgeLogo';
import { api } from '@/lib/api';

/**
 * Página de Configuración del Equipo
 * 
 * Permite al líder configurar:
 * - Foto de perfil del equipo
 * - Información básica (nombre, descripción)
 * - Datos de contacto
 * - Ubicación
 * 
 * Endpoint del backend:
 * - GET /teams/:teamId - Obtener datos del equipo
 * - PUT /teams/:teamId - Actualizar datos del equipo
 * - POST /teams/:teamId/profile-image - Subir imagen de perfil
 */

interface TeamData {
  id: string;
  name: string;
  description: string;
  profileImage?: string | null;
  city: string;
  country: string;
  website?: string;
  email?: string;
  phone?: string;
  verified: boolean;
}

export default function TeamConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [teamData, setTeamData] = useState<TeamData>({
    id: '',
    name: '',
    description: '',
    profileImage: null,
    city: '',
    country: '',
    website: '',
    email: '',
    phone: '',
    verified: false
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Cargar datos del equipo
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      loadTeamData();
    }
  }, [status, session?.user?.id]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      console.log('🔄 Cargando datos del equipo para usuario:', session?.user?.id);
      
      // 1. Obtener el teamId del usuario desde /users/:userId
      const userData = await api.get<any>(`/users/${session?.user?.id}`);
      
      console.log('✅ Datos del usuario obtenidos:', userData);
      
      // 2. Buscar el equipo donde el usuario es LIDER
      const membership = userData?.teamMemberships?.find((m: any) => m.role === 'LIDER');
      
      if (!membership?.teamId) {
        console.warn('⚠️ No se encontró equipo para el usuario');
        setErrorMessage('No se encontró el equipo asociado a tu cuenta');
        setLoading(false);
        return;
      }

      const teamId = membership.teamId;
      console.log('✅ TeamId encontrado:', teamId);

      // 3. Cargar datos del equipo
      const data = await api.get<any>(`/teams/${teamId}`);
      
      console.log('✅ Datos del equipo cargados:', data);
      
      setTeamData(data);
      setPreviewImage(data.profileImage);
    } catch (error: any) {
      console.error('❌ Error loading team data:', error);
      setErrorMessage(error.message || 'Error al cargar los datos del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  const handleImageUpload = async (file: File) => {
    // Validaciones
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrorMessage('La imagen no debe superar los 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Solo se permiten imágenes JPG, PNG o WebP');
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMessage(null);

      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Subir al servidor
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/teams/${teamData.id}/profile-image`,
        {
          method: 'POST',
          // NO incluir Content-Type - el browser lo maneja automáticamente con el boundary
          // NO incluir Authorization por ahora (el endpoint funciona sin auth temporalmente)
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al subir la imagen');
      }

      const data = await response.json();
      console.log('✅ Upload exitoso:', data);
      
      setTeamData(prev => ({
        ...prev,
        profileImage: data.profileImage
      }));

      setSuccessMessage('¡Imagen actualizada correctamente!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrorMessage('Error al subir la imagen. Intenta de nuevo.');
      // Revertir preview en caso de error
      setPreviewImage(teamData.profileImage || null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/teams/${teamData.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session as any)?.accessToken}`
          },
          body: JSON.stringify({
            name: teamData.name,
            description: teamData.description,
            city: teamData.city,
            country: teamData.country,
            website: teamData.website,
            email: teamData.email,
            phone: teamData.phone
          })
        }
      );

      if (!response.ok) {
        throw new Error('Error al guardar los cambios');
      }

      setSuccessMessage('¡Cambios guardados correctamente!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving team data:', error);
      setErrorMessage('Error al guardar los cambios. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BridgeLogo size="sm" showText={false} />
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración del Equipo
            </h1>
          </div>
          <p className="text-gray-600">
            Gestiona la información y foto de perfil de tu equipo
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 relative">
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Profile Image Section */}
          <div className="relative px-8 py-12">
            <div className="flex flex-col items-center">
              <div className="relative">
                <TeamAvatarWithCamera
                  avatarUrl={previewImage}
                  teamName={teamData.name}
                  size="xl"
                  onCameraClick={handleImageClick}
                  showCamera={!uploadingImage}
                  editable={true}
                  className="ring-4 ring-white/10 shadow-2xl"
                />
                
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-300 text-center max-w-md">
                Haz click en el ícono de cámara para cambiar la foto de tu equipo
                <br />
                <span className="text-xs text-gray-400">JPG, PNG o WebP - Máx. 5MB</span>
              </p>

              {teamData.verified && (
                <div className="mt-3 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-500/20">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">Equipo Verificado</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8 space-y-6 bg-white">
            {/* Nombre del Equipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Equipo *
              </label>
              <input
                type="text"
                value={teamData.name}
                onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: DevTeam Pro"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={teamData.description}
                onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Cuéntanos sobre tu equipo, especialidades y experiencia..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {teamData.description.length}/500 caracteres
              </p>
            </div>

            {/* Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={teamData.city}
                  onChange={(e) => setTeamData({ ...teamData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Bogotá"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  País *
                </label>
                <input
                  type="text"
                  value={teamData.country}
                  onChange={(e) => setTeamData({ ...teamData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Colombia"
                />
              </div>
            </div>

            {/* Datos de Contacto */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información de Contacto
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={teamData.email || ''}
                  onChange={(e) => setTeamData({ ...teamData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contacto@equipo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={teamData.phone || ''}
                  onChange={(e) => setTeamData({ ...teamData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={teamData.website || ''}
                  onChange={(e) => setTeamData({ ...teamData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.equipo.com"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-t border-gray-300/50 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg border border-gray-500/30"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-200">
              <p className="font-medium mb-1 text-white">Sobre la foto de perfil del equipo</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>La foto aparecerá en las búsquedas de matching</li>
                <li>Se mostrará en las tarjetas de tu equipo</li>
                <li>Ayuda a dar una imagen profesional y confiable</li>
                <li>Recomendamos usar el logo del equipo o una foto grupal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
