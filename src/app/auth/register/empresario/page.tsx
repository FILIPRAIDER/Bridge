"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Building2, Globe, MapPin, FileText, Phone, CreditCard, Calendar, ArrowRight, ArrowLeft, Check, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { useCountries } from "@/hooks/useCountries";
import { useCities } from "@/hooks/useCities";

// Onboarding personalizado para empresarios

interface CompanyData {
  name: string;
  sector: string;
  website: string;
  country: string;
  city: string;
  about: string;
}

interface ProfileData {
  phone: string;
  identityType: string;
  documentNumber: string;
  birthdate: string;
}

export default function EmpresarioOnboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { show } = useToast();
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Hooks para países y ciudades
  const { data: countries, loading: countriesLoading } = useCountries();
  const { data: citiesData, loading: citiesLoading } = useCities(selectedCountry);

  // Datos de la compañía
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    sector: "",
    website: "",
    country: "",
    city: "",
    about: "",
  });

  // Datos del perfil personal (empresario siempre usa NIT)
  const [profileData, setProfileData] = useState<ProfileData>({
    phone: "",
    identityType: "NIT", // Siempre NIT para empresarios
    documentNumber: "",
    birthdate: "",
  });

  // Verificar autenticación y rol
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "EMPRESARIO") {
      router.push("/dashboard");
      return;
    }

    // 🔥 FIX: Si no viene del registro inicial, redirigir al dashboard
    const needsOnboarding = localStorage.getItem("empresario_needs_onboarding");
    if (!needsOnboarding || needsOnboarding !== "true") {
      router.push("/dashboard/empresario");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando tu perfil empresarial...</p>
        </div>
      </div>
    );
  }

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar datos de compañía
    if (!companyData.name.trim()) {
      show({ variant: "error", message: "El nombre de la empresa es requerido" });
      return;
    }

    if (!companyData.country) {
      show({ variant: "error", message: "El país es requerido" });
      return;
    }

    if (!companyData.city) {
      show({ variant: "error", message: "La ciudad es requerida" });
      return;
    }

    // Avanzar al siguiente paso
    setCurrentStep(2);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Crear la compañía (enviar website como null si está vacío)
      const companyPayload = {
        ...companyData,
        website: companyData.website.trim() || null, // null si está vacío
      };

      const companyResponse = await api.post<{ id: string }>("/companies", companyPayload);
      
      if (!companyResponse?.id) {
        throw new Error("No se pudo crear la compañía");
      }

      // 2. Actualizar perfil del usuario (siempre con identityType = NIT)
      await api.patch(`/users/${session.user.id}/profile`, {
        phone: profileData.phone || null,
        identityType: "NIT", // Siempre NIT para empresarios
        documentNumber: profileData.documentNumber || null,
        birthdate: profileData.birthdate ? new Date(profileData.birthdate).toISOString() : null,
      });

      // 3. Marcar onboarding como completado
      await api.patch(`/users/${session.user.id}`, {
        onboardingStep: "DONE",
      });

      show({
        variant: "success",
        message: "¡Perfil completado exitosamente!",
      });

      // 4. Limpiar flag de onboarding
      localStorage.removeItem("empresario_needs_onboarding");

      // 5. Redirigir al dashboard empresario
      setTimeout(() => {
        router.push("/dashboard/empresario");
      }, 500);

    } catch (error: any) {
      console.error("Error al completar perfil:", error);
      show({
        variant: "error",
        message: error?.message || "Error al completar el perfil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Completa tu Perfil Empresarial
          </h1>
          <p className="text-gray-600">
            Paso {currentStep} de 2 - {currentStep === 1 ? "Información de la Empresa" : "Tu Información Personal"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${currentStep >= 1 ? "text-gray-900" : "text-gray-400"}`}>
              Empresa
            </span>
            <span className={`text-sm font-medium ${currentStep >= 2 ? "text-gray-900" : "text-gray-400"}`}>
              Perfil Personal
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-gray-800 to-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Company Info */}
        {currentStep === 1 && (
          <form onSubmit={handleCompanySubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <label className="label">
                <Building2 className="h-4 w-4 mr-2" />
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                className="input"
                placeholder="Ej: Tech Solutions S.A.S"
                required
              />
            </div>

            <div>
              <label className="label">
                <FileText className="h-4 w-4 mr-2" />
                Sector / Industria
              </label>
              <select
                value={companyData.sector}
                onChange={(e) => setCompanyData({ ...companyData, sector: e.target.value })}
                className="input"
              >
                <option value="">Selecciona un sector</option>
                <option value="technology">Tecnología</option>
                <option value="finance">Finanzas</option>
                <option value="healthcare">Salud</option>
                <option value="education">Educación</option>
                <option value="retail">Retail / Comercio</option>
                <option value="manufacturing">Manufactura</option>
                <option value="construction">Construcción</option>
                <option value="agriculture">Agricultura</option>
                <option value="logistics">Logística</option>
                <option value="tourism">Turismo</option>
                <option value="entertainment">Entretenimiento</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="label">
                <Globe className="h-4 w-4 mr-2" />
                Sitio Web (opcional)
              </label>
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                className="input"
                placeholder="https://www.tuempresa.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si tu empresa tiene un sitio web, agrégalo aquí
              </p>
            </div>

            {/* País */}
            <div>
              <label className="label">
                <MapPin className="h-4 w-4 mr-2" />
                País *
              </label>
              {countriesLoading ? (
                <div className="input flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando países...
                </div>
              ) : (
                <select
                  value={companyData.country}
                  onChange={(e) => {
                    const country = e.target.value;
                    setCompanyData({ ...companyData, country, city: "" });
                    setSelectedCountry(country);
                  }}
                  className="input"
                  required
                >
                  <option value="">Selecciona un país</option>
                  {countries?.map((c: any) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className="label">
                <MapPin className="h-4 w-4 mr-2" />
                Ciudad *
              </label>
              {!companyData.country ? (
                <div className="input bg-gray-50 text-gray-400 cursor-not-allowed">
                  Primero selecciona un país
                </div>
              ) : citiesLoading ? (
                <div className="input flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando ciudades...
                </div>
              ) : citiesData?.cities && citiesData.cities.length > 0 ? (
                <select
                  value={companyData.city}
                  onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                  className="input"
                  required
                  disabled={!companyData.country}
                >
                  <option value="">Selecciona una ciudad</option>
                  {citiesData.cities.map((city: any) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={companyData.city}
                    onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                    className="input"
                    placeholder="Escribe el nombre de tu ciudad"
                    required
                  />
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    No hay ciudades precargadas para este país. Escribe tu ciudad manualmente.
                  </p>
                </>
              )}
            </div>

            <div>
              <label className="label">
                <FileText className="h-4 w-4 mr-2" />
                Descripción de la Empresa
              </label>
              <textarea
                value={companyData.about}
                onChange={(e) => setCompanyData({ ...companyData, about: e.target.value })}
                className="input min-h-[120px] resize-none"
                placeholder="Cuéntanos sobre tu empresa: ¿qué hacen?, ¿cuál es su misión?, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta información ayudará a los equipos a conocer mejor tu empresa
              </p>
            </div>

            <button
              type="submit"
              className="btn-dark w-full inline-flex items-center justify-center gap-2"
            >
              Continuar
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        )}

        {/* Step 2: Personal Profile */}
        {currentStep === 2 && (
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <label className="label">
                <Phone className="h-4 w-4 mr-2" />
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="input"
                placeholder="+57 300 123 4567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato recomendado: +57 XXX XXX XXXX
              </p>
            </div>

            <div>
              <label className="label">
                <CreditCard className="h-4 w-4 mr-2" />
                NIT de la Empresa
              </label>
              <input
                type="text"
                value={profileData.documentNumber}
                onChange={(e) => setProfileData({ ...profileData, documentNumber: e.target.value })}
                className="input"
                placeholder="900123456-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de Identificación Tributaria (NIT)
              </p>
            </div>

            <div>
              <label className="label">
                <Calendar className="h-4 w-4 mr-2" />
                Fecha de Nacimiento (opcional)
              </label>
              <input
                type="date"
                value={profileData.birthdate}
                onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                className="input"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    ¡Casi listo!
                  </h3>
                  <p className="text-sm text-blue-700">
                    Una vez completes tu perfil, podrás publicar proyectos y conectar con equipos talentosos.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <ArrowLeft className="h-5 w-5" />
                Atrás
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-dark flex-1 inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Completando...
                  </>
                ) : (
                  <>
                    Completar Perfil
                    <Check className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{" "}
            <a href="mailto:soporte@bridge.com" className="text-gray-900 hover:underline font-medium">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
