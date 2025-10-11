"use client";

import { useEffect, useRef, useState } from "react";

interface BridgeLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  textColor?: "dark" | "light"; // dark = negro, light = blanco
}

export function BridgeLogo({ 
  className = "", 
  showText = true, 
  size = "md",
  textColor = "dark" // Por defecto negro
}: BridgeLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: "h-7 w-7",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  // Efecto de reflejo automático cada 5 segundos (más espaciado)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered && containerRef.current) {
        containerRef.current.classList.add('auto-shine');
        setTimeout(() => {
          containerRef.current?.classList.remove('auto-shine');
        }, 2000); // Duración más larga
      }
    }, 5000); // Más tiempo entre reflejos

    return () => clearInterval(interval);
  }, [isHovered]);
  
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        ref={containerRef}
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg 
          viewBox="0 0 32 32" 
          className={`${sizes[size]} transition-all duration-300 group-hover:scale-105 group-hover:rotate-2`}
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente metalizado oscuro (para fondos claros) */}
            <linearGradient id="metallic-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a0a0a" />
              <stop offset="20%" stopColor="#1a1a1a" />
              <stop offset="40%" stopColor="#2d2d2d" />
              <stop offset="50%" stopColor="#3f3f3f" />
              <stop offset="60%" stopColor="#2d2d2d" />
              <stop offset="80%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>

            {/* Gradiente gris claro (para fondos oscuros) */}
            <linearGradient id="metallic-silver" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a8a8a8" />
              <stop offset="20%" stopColor="#b8b8b8" />
              <stop offset="40%" stopColor="#c8c8c8" />
              <stop offset="50%" stopColor="#d0d0d0" />
              <stop offset="60%" stopColor="#c8c8c8" />
              <stop offset="80%" stopColor="#b8b8b8" />
              <stop offset="100%" stopColor="#a8a8a8" />
            </linearGradient>
            
            {/* Gradiente de brillo dinámico (claro) */}
            <linearGradient id="dynamic-shine-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Gradiente de brillo dinámico (oscuro) */}
            <linearGradient id="dynamic-shine-dark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
              <stop offset="30%" stopColor="#000000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            {/* Filtro de profundidad mejorado */}
            <filter id="premium-depth">
              <feGaussianBlur stdDeviation="0.4" result="blur"/>
              <feOffset in="blur" dx="0" dy="1" result="offsetBlur"/>
              <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
            </filter>
          </defs>
          
          {/* Fondo metalizado - Cambia según textColor */}
          <rect 
            width="32" 
            height="32" 
            rx="7" 
            fill={textColor === "light" ? "url(#metallic-silver)" : "url(#metallic-dark)"}
            filter="url(#premium-depth)"
          />
          
          {/* Borde fuerte para contraste en fondos oscuros */}
          <rect 
            width="30" 
            height="30" 
            x="1"
            y="1"
            rx="6" 
            fill="none"
            stroke={textColor === "light" ? "#404040" : "#e5e5e5"}
            strokeWidth="1.5"
            opacity="0.8"
          />
          
          {/* Capa de brillo superior */}
          <rect 
            width="32" 
            height="16" 
            rx="7" 
            fill={textColor === "light" ? "url(#dynamic-shine-light)" : "url(#dynamic-shine-light)"}
          />
          
          {/* Letra B con efecto 3D - Siempre negro en plateado, blanco en oscuro */}
          <text 
            x="16" 
            y="23.5" 
            fontFamily="Arial, sans-serif" 
            fontSize="20" 
            fontWeight="900" 
            fill={textColor === "light" ? "#0a0a0a" : "#ffffff"}
            textAnchor="middle"
            style={{ 
              filter: textColor === "light" 
                ? "drop-shadow(0 1px 2px rgba(255, 255, 255, 0.6)) drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.3))"
                : "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6)) drop-shadow(0 1px 1px rgba(255, 255, 255, 0.1))",
              letterSpacing: "0.5px"
            }}
          >
            B
          </text>
        </svg>
        
        {/* Efecto de reflejo al hover - Color según el fondo */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div 
            className={`shine-effect absolute -inset-full opacity-0 group-hover:opacity-100 ${
              textColor === "light" 
                ? "bg-gradient-to-r from-transparent via-black/30 to-transparent"
                : "bg-gradient-to-r from-transparent via-white/40 to-transparent"
            }`}
            style={{ 
              transform: "skewX(-15deg) translateX(-100%)",
              filter: "blur(3px)"
            }}
          />
        </div>

        {/* Efecto de reflejo automático */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div 
            className={`auto-shine-effect absolute -inset-full opacity-0 ${
              textColor === "light"
                ? "bg-gradient-to-r from-transparent via-black/20 to-transparent"
                : "bg-gradient-to-r from-transparent via-white/30 to-transparent"
            }`}
            style={{ 
              transform: "skewX(-15deg) translateX(-100%)",
              filter: "blur(2px)"
            }}
          />
        </div>

        {/* Partículas de brillo */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="sparkle sparkle-1" />
          <div className="sparkle sparkle-2" />
          <div className="sparkle sparkle-3" />
        </div>
      </div>
      
      {showText && (
        <span 
          className={`${textSizes[size]} font-bold tracking-tight transition-all duration-300 ${
            textColor === "light" 
              ? "text-white group-hover:text-gray-100" 
              : "text-gray-900 group-hover:text-black"
          }`}
        >
          Bridge
        </span>
      )}
      
      <style jsx>{`
        /* Animación de reflejo al hover - Más lenta y suave */
        .shine-effect {
          animation: shineHover 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes shineHover {
          0% {
            transform: skewX(-15deg) translateX(-100%);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: skewX(-15deg) translateX(200%);
            opacity: 0;
          }
        }

        /* Animación automática del reflejo - Más lenta y elegante */
        .auto-shine .auto-shine-effect {
          animation: autoShine 2s cubic-bezier(0.3, 0, 0.2, 1);
        }

        @keyframes autoShine {
          0% {
            transform: skewX(-15deg) translateX(-150%);
            opacity: 0;
          }
          25% {
            opacity: 0.8;
          }
          75% {
            opacity: 0.8;
          }
          100% {
            transform: skewX(-15deg) translateX(250%);
            opacity: 0;
          }
        }

        /* Partículas de brillo */
        .sparkle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          animation: sparkle 0.6s ease-out;
        }

        .sparkle-1 {
          top: 20%;
          left: 30%;
          animation-delay: 0.1s;
        }

        .sparkle-2 {
          top: 60%;
          left: 70%;
          animation-delay: 0.2s;
        }

        .sparkle-3 {
          top: 40%;
          left: 50%;
          animation-delay: 0.15s;
        }

        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.5) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
