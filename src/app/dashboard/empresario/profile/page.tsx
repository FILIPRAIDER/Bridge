"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, Mail, Calendar, Globe, Briefcase, Edit2, Save, X, Camera, User } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { CompanyLogoUploadModal } from '@/components/dashboard/empresario/CompanyLogoUploadModal';
import { AvatarUploader } from '@/components/dashboard/miembro/AvatarUploader';

interface CompanyData {
  id: string;
  name: string;
  sector: string | null;
  website: string | null;
  about: string | null;
  logoUrl: string | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  profile: {
    location: string | null;
    birthdate: string | null;
    jobTitle: string | null;
    bio: string | null;
  } | null;
}

export default function EmpresarioProfilePage() {
  const { data: session, update } = useSession();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    bio: '',
    website: '',
    about: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, [session]);

  const fetchProfileData = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      console.log('[EmpresarioProfile] 🔍 Cargando datos del usuario:', session.user.id);

      // 🔥 Fetch user data with profile
      const userResponse = await api.get<UserData>(`/users/${session.user.id}`);
      
      console.log('[EmpresarioProfile] 📊 Datos del usuario recibidos:', userResponse);

      setUserData(userResponse);

      // Set form data for personal profile
      setFormData({
        jobTitle: userResponse.profile?.jobTitle || '',
        bio: userResponse.profile?.bio || '',
        website: '',
        about: '',
      });

      // 🔥 Si el usuario tiene companyId, cargar la empresa
      if ((userResponse as any).companyId) {
        console.log('[EmpresarioProfile] 🏢 Cargando empresa:', (userResponse as any).companyId);
        const companyResponse = await api.get<CompanyData>(`/companies/${(userResponse as any).companyId}`);
        
        console.log('[EmpresarioProfile] ✅ Empresa cargada:', companyResponse);
        
        setCompanyData(companyResponse);

        // Update form data with company info
        setFormData(prev => ({
          ...prev,
          website: companyResponse.website || '',
          about: companyResponse.about || '',
        }));
      } else {
        console.warn('[EmpresarioProfile] ⚠️ Usuario no tiene companyId vinculado');
        setCompanyData(null);
      }
    } catch (error: any) {
      console.error('[EmpresarioProfile] ❌ Error fetching profile:', error);
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

      // 🔥 Actualizar perfil personal (jobTitle, bio)
      await api.patch(`/users/${session.user.id}/profile`, {
        jobTitle: formData.jobTitle || undefined,
        bio: formData.bio || undefined,
      });

      // 🔥 Actualizar empresa (solo si existe)
      if (companyData?.id) {
        await api.patch(`/companies/${companyData.id}`, {
          website: formData.website || undefined,
          about: formData.about || undefined,
        });
      }

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
      jobTitle: userData?.profile?.jobTitle || '',
      bio: userData?.profile?.bio || '',
      website: companyData?.website || '',
      about: companyData?.about || '',
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
        {/* Header con botón de editar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Editar
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

        {/* Secciones del perfil */}
        <div className="space-y-6">
          {/* 1. PERFIL PERSONAL */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <User className="h-5 w-5" />
              Tu Perfil Personal
            </h2>
            <p className="text-sm text-gray-500 mb-6">Información sobre ti como profesional</p>
            
            <div className="space-y-6">
              {/* Avatar + Nombre */}
              <div className="flex items-start gap-6">
                {/* Avatar Personal */}
                <div className="flex-shrink-0">
                  <AvatarUploader
                    currentAvatarUrl={userData?.avatarUrl || session?.user?.avatarUrl}
                    onUploadSuccess={async (newUrl: string) => {
                      await update({
                        ...session,
                        user: {
                          ...session?.user,
                          avatarUrl: newUrl,
                        },
                      });
                      fetchProfileData();
                      show({ message: 'Avatar actualizado ✅', variant: 'success' });
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Tu foto de perfil</p>
                </div>

                {/* Información básica */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <p className="text-gray-900 font-medium">{userData?.name || session?.user?.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo / Título
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="Ej: CEO, Fundador, Director"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{userData?.profile?.jobTitle || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Cuéntanos brevemente sobre ti (2-3 líneas)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {userData?.profile?.bio || 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. INFORMACIÓN DE LA EMPRESA */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </h2>
            <p className="text-sm text-gray-500 mb-6">Datos de tu empresa</p>
            
            <div className="space-y-6">
              {/* Logo + Info básica */}
              <div className="flex items-start gap-6">
                {/* Logo de la empresa */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => companyData?.id && setIsLogoModalOpen(true)}
                    disabled={!companyData?.id}
                    className="relative w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden bg-white hover:border-gray-400 transition-all duration-200 disabled:cursor-not-allowed group"
                    title={companyData?.id ? "Click para cambiar el logo" : "No disponible"}
                  >
                    {companyData?.logoUrl ? (
                      <img
                        src={companyData.logoUrl}
                        alt={companyData.name || "Logo"}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-white" />
                      </div>
                    )}
                    
                    {companyData?.id && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-2.5">
                          <Camera className="h-5 w-5 text-gray-900" />
                        </div>
                      </div>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">Logo empresa</p>
                </div>

                {/* Datos de la empresa */}
                <div className="flex-1 space-y-4">
                  {/* Nombre - SOLO LECTURA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Empresa
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-medium">{companyData?.name || 'No especificado'}</p>
                      <span className="text-xs text-gray-500">🔒 No editable</span>
                    </div>
                  </div>

                  {/* Sector - SOLO LECTURA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Briefcase className="inline h-4 w-4 mr-1" />
                      Sector
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900">{companyData?.sector || 'No especificado'}</p>
                      <span className="text-xs text-gray-500">🔒 No editable</span>
                    </div>
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

                  {/* About */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acerca de la Empresa
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.about}
                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                        placeholder="Descripción de la empresa..."
                        rows={3}
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
            </div>
          </div>

          {/* 3. INFORMACIÓN DE CUENTA */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información de Cuenta
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">{session?.user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Rol</span>
                <span className="text-sm font-medium text-gray-900">Empresario</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Miembro desde</span>
                <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Logo Upload Modal */}
      {companyData?.id && (
        <CompanyLogoUploadModal
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          companyId={companyData.id}
          currentLogoUrl={companyData.logoUrl}
          onUploadSuccess={(newUrl) => {
            fetchProfileData();
            setIsLogoModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
