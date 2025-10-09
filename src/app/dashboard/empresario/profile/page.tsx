"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, Mail, Calendar, MapPin, Globe, Briefcase, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

interface CompanyData {
  id: string;
  name: string;
  sector: string | null;
  website: string | null;
  about: string | null;
}

interface ProfileData {
  location: string | null;
  birthdate: string | null;
}

export default function EmpresarioProfilePage() {
  const { data: session } = useSession();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    sector: '',
    website: '',
    about: '',
    location: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, [session]);

  const fetchProfileData = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      // 🔥 Fetch user data with profile
      const userData = await api.get<any>(`/users/${session.user.id}`);
      
      setProfileData(userData.profile || null);

      // 🔥 Si el usuario tiene companyId, cargar la empresa
      if (userData.companyId) {
        const companyResponse = await api.get<CompanyData>(`/companies/${userData.companyId}`);
        setCompanyData(companyResponse);

        // Set form data
        setFormData({
          companyName: companyResponse.name || '',
          sector: companyResponse.sector || '',
          website: companyResponse.website || '',
          about: companyResponse.about || '',
          location: userData.profile?.location || '',
        });
      } else {
        // Si no tiene empresa, dejar campos vacíos
        setCompanyData(null);
        setFormData({
          companyName: '',
          sector: '',
          website: '',
          about: '',
          location: userData.profile?.location || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      show({
        message: error?.message || 'Error al cargar el perfil',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    try {
      setSaving(true);

      // 🔥 Actualizar empresa (solo si existe)
      if (companyData?.id) {
        await api.patch(`/companies/${companyData.id}`, {
          name: formData.companyName || undefined,
          sector: formData.sector || undefined,
          website: formData.website || undefined,
          about: formData.about || undefined,
        });
      }

      // 🔥 Actualizar perfil (location)
      await api.patch(`/users/${session.user.id}/profile`, {
        location: formData.location || undefined,
      });

      show({
        message: 'Perfil actualizado exitosamente ✅',
        variant: 'success',
      });

      setEditing(false);
      fetchProfileData();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      show({
        message: error?.message || 'Error al guardar cambios',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      companyName: companyData?.name || '',
      sector: companyData?.sector || '',
      website: companyData?.website || '',
      about: companyData?.about || '',
      location: profileData?.location || '',
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {companyData?.name || 'Mi Empresa'}
                </h1>
                <p className="text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Editar Perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </h2>
            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{companyData?.name || 'No especificado'}</p>
                )}
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Sector
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="Ej: Tecnología, Salud, Educación..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{companyData?.sector || 'No especificado'}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Sitio Web
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">
                    {companyData?.website ? (
                      <a
                        href={companyData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {companyData.website}
                      </a>
                    ) : (
                      'No especificado'
                    )}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Ubicación
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ciudad, País"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData?.location || 'No especificado'}</p>
                )}
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acerca de la Empresa
                </label>
                {editing ? (
                  <textarea
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Cuéntanos sobre tu empresa..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {companyData?.about || 'No especificado'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información de Cuenta
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">{session?.user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Rol</span>
                <span className="text-sm font-medium text-gray-900">Empresario</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Miembro desde</span>
                <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {profileData?.birthdate
                    ? new Date(profileData.birthdate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
