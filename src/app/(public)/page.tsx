import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center bg-white dark:bg-gray-950 transition-colors">
      {/* Fondo cuadrícula */}
      <div className="bg-grid-fade dark:opacity-30" aria-hidden="true" />

      {/* HERO: centrado vertical y horizontal */}
      <section className="mx-auto max-w-7xl w-full px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 relative">
        {/* Layout responsive: columna única en mobile, grid en desktop */}
        <div className="grid gap-8 lg:gap-12 items-center lg:grid-cols-2">
          {/* Izquierda: claim */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <p className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 backdrop-blur transition-colors">
                <span className="flex items-center justify-center h-2 w-2">
                  <span className="animate-pulse-dot inline-flex rounded-full h-2 w-2 bg-green-500 dark:bg-green-400"></span>
                </span>
                Conecta empresas y equipos universitarios
              </p>
            </div>

            {/* Título - Mejor spacing para móvil */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#0f172a] dark:text-white transition-colors">
              Encuentra oportunidades o talento para tus proyectos
            </h1>

            {/* Descripción */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed transition-colors">
               Una nueva forma de colaborar. Bridge conecta desafíos empresariales con mentes universitarias brillantes.
            </p>

            {/* Botón Comienza Ahora */}
            <div className="flex justify-center lg:justify-start pt-2">
              <Link 
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#0b0f19] dark:bg-white text-white dark:text-gray-900 px-8 py-4 font-semibold shadow-lg hover:shadow-xl hover:bg-[#111827] dark:hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 text-base sm:text-lg w-full sm:w-auto"
              >
                Comienza ahora
              </Link>
            </div>
          </div>

          {/* Derecha: imagen del teléfono (solo visible en desktop) */}
          <div className="hidden lg:flex w-full justify-end relative">
            <div className="relative w-full max-w-[350px] h-[500px]">
              <Image
                src="/phone.png"
                alt="Bridge Mobile App"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="350px"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
