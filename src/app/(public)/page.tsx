import Link from "next/link";
import { Building2, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)]">
      {/* Fondo cuadrícula */}
      <div className="bg-grid-fade" aria-hidden="true" />

      {/* HERO: centrado y balanceado */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-24 relative">
        {/* Layout responsive: columna única en mobile, grid en desktop */}
        <div className="grid gap-8 lg:gap-12 items-center lg:grid-cols-2">
          {/* Izquierda: claim */}
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 bg-white/60 border border-gray-200 rounded-full px-4 py-1.5 mb-6 backdrop-blur">
              <span className="flex items-center justify-center h-2 w-2">
                <span className="animate-pulse-dot inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Conecta empresas y equipos universitarios
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#0f172a] mb-6">
              Encuentra oportunidades o talento para tus proyectos
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto lg:mx-0">
              Publica proyectos o gestiona tu equipo y aplica. Mobile-first, moderna y sencilla.
            </p>

            {/* Botón Comienza Ahora */}
            <div className="flex justify-center lg:justify-start">
              <Link 
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#0b0f19] text-white px-6 sm:px-8 py-3 sm:py-3.5 font-semibold shadow-md hover:shadow-lg hover:bg-[#111827] transition-all transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Comienza ahora
              </Link>
            </div>
          </div>

          {/* Derecha: cards centradas */}
          <div className="w-full max-w-lg mx-auto space-y-4 sm:space-y-6">
            {/* Empresa */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative card p-5 sm:p-6 md:p-7 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl grid place-items-center bg-gradient-to-br from-gray-900 to-gray-700 shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Soy empresa
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Crea un proyecto (ciudad/área/skills) y luego ejecuta el matching para ver candidatos.
                    </p>
                  </div>
                </div>
                <Link 
                  href="/empresa" 
                  className="inline-flex items-center justify-center rounded-xl bg-[#0b0f19] text-white px-6 py-3 font-semibold shadow-md hover:shadow-lg hover:bg-[#111827] transition-all transform hover:-translate-y-0.5"
                >
                  Explorar como empresa
                </Link>
              </div>
            </div>

            {/* Equipo / Estudiantes */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative card p-5 sm:p-6 md:p-7 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl grid place-items-center bg-gradient-to-br from-gray-900 to-gray-700 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Soy equipo / estudiante
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Crea tu equipo, gestiona miembros y skills, recibe invitaciones y aplica a proyectos.
                    </p>
                  </div>
                </div>
                <Link 
                  href="/auth/register" 
                  className="inline-flex items-center justify-center rounded-xl bg-[#0b0f19] text-white px-6 py-3 font-semibold shadow-md hover:shadow-lg hover:bg-[#111827] transition-all transform hover:-translate-y-0.5"
                >
                  Ir al panel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
