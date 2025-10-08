import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
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

            <h1 className="text-3xl sm:text-5xl font-bold leading-[0.8] tracking-tight text-[#0f172a] mb-6">
              Encuentra oportunidades o talento para tus proyectos
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
               Una nueva forma de colaborar. Bridge conecta desafíos empresariales con mentes universitarias brillantes.
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
