"use client";

interface BridgeLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export function BridgeLogo({ 
  className = "", 
  showText = true, 
  size = "md", 
  variant = "light" 
}: BridgeLogoProps) {
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

  const isDark = variant === "dark";
  
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <svg 
          viewBox="0 0 32 32" 
          className={`${sizes[size]} transition-transform duration-300 group-hover:scale-105`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="metallic-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="25%" stopColor="#2d2d2d" />
              <stop offset="50%" stopColor="#4a4a4a" />
              <stop offset="75%" stopColor="#2d2d2d" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
            <linearGradient id="metallic-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c0c0c0" />
              <stop offset="25%" stopColor="#d4d4d4" />
              <stop offset="50%" stopColor="#e8e8e8" />
              <stop offset="75%" stopColor="#d4d4d4" />
              <stop offset="100%" stopColor="#c0c0c0" />
            </linearGradient>
            <linearGradient id="shine-top" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="inner-glow">
              <feGaussianBlur stdDeviation="0.5" result="blur"/>
              <feOffset in="blur" dx="0" dy="1" result="offsetBlur"/>
              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect 
            width="32" 
            height="32" 
            rx="6" 
            fill={isDark ? "url(#metallic-dark)" : "url(#metallic-light)"}
            filter="url(#inner-glow)"
          />
          <rect 
            width="32" 
            height="16" 
            rx="6" 
            fill="url(#shine-top)"
          />
          <text 
            x="16" 
            y="24" 
            fontFamily="Arial, sans-serif" 
            fontSize="20" 
            fontWeight="bold" 
            fill={isDark ? "#000000" : "#ffffff"}
            textAnchor="middle"
            style={{ 
              filter: isDark 
                ? "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))" 
                : "drop-shadow(0 1px 2px rgba(255, 255, 255, 0.2))"
            }}
          >
            B
          </text>
        </svg>
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div 
            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"
            style={{ transform: "skewX(-20deg)" }}
          />
        </div>
      </div>
      {showText && (
        <span 
          className={`${textSizes[size]} font-bold tracking-tight transition-colors ${
            isDark 
              ? "text-white" 
              : "text-gray-900"
          }`}
        >
          Bridge
        </span>
      )}
      <style jsx>{`
        @keyframes shine {
          from {
            transform: translateX(-100%) skewX(-20deg);
          }
          to {
            transform: translateX(200%) skewX(-20deg);
          }
        }
        .animate-shine {
          animation: shine 0.75s ease-in-out;
        }
      `}</style>
    </div>
  );
}
