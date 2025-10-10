"use client";

interface BridgeLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BridgeLogo({ className = "", showText = true, size = "md" }: BridgeLogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Logo con efecto cromado/metálico */}
      <div className="relative">
        <svg 
          viewBox="0 0 32 32" 
          className={`${sizes[size]} drop-shadow-lg`}
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente metálico/cromado */}
            <linearGradient id="metallic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="30%" stopColor="#374151" />
              <stop offset="50%" stopColor="#4b5563" />
              <stop offset="70%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            
            {/* Gradiente para el brillo */}
            <linearGradient id="shine-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Filtro de sombra interior */}
            <filter id="inner-shadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
              <feOffset dx="0" dy="1" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Rectángulo de fondo con gradiente metálico */}
          <rect 
            x="2" 
            y="2" 
            width="28" 
            height="28" 
            rx="6" 
            fill="url(#metallic-gradient)"
            filter="url(#inner-shadow)"
          />
          
          {/* Capa de brillo */}
          <rect 
            x="2" 
            y="2" 
            width="28" 
            height="14" 
            rx="6" 
            fill="url(#shine-gradient)"
          />
          
          {/* Letra B en blanco con sombra */}
          <text 
            x="16" 
            y="23" 
            fontFamily="Arial, sans-serif" 
            fontSize="18" 
            fontWeight="bold" 
            fill="#ffffff" 
            textAnchor="middle"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}
          >
            B
          </text>
        </svg>
        
        {/* Destello animado ocasional */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div 
            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              transform: 'skewX(-15deg)',
              animation: 'shine 3s ease-in-out 2s infinite',
            }}
          />
        </div>
      </div>

      {/* Texto Bridge */}
      {showText && (
        <span className={`${textSizes[size]} font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent`}>
          Bridge
        </span>
      )}

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-200%) skewX(-15deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
