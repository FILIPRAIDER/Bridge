"use client";

import { useEffect, useState } from "react";

interface BridgeLoaderProps {
  message?: string;
  submessage?: string;
}

export function BridgeLoader({ message, submessage }: BridgeLoaderProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center z-50">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo animado */}
        <div className="relative mb-8">
          {/* Círculo exterior pulsante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-white/10 animate-ping" />
          </div>
          
          {/* Círculo medio rotante */}
          <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            <svg className="w-40 h-40" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="70 200"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Logo central */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-300 rounded-2xl shadow-2xl shadow-white/20" />
            <span className="relative text-6xl font-bold bg-gradient-to-br from-gray-900 via-black to-gray-800 bg-clip-text text-transparent">
              B
            </span>
          </div>
        </div>

        {/* Texto principal */}
        <div className="text-center space-y-3 max-w-md px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {message || "Bridge"}
          </h2>
          
          {submessage && (
            <p className="text-gray-400 text-sm md:text-base">
              {submessage}
            </p>
          )}

          {/* Dots animados */}
          <div className="flex items-center justify-center gap-2 h-8">
            <span className="text-white text-lg font-medium">
              Cargando{dots}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-white via-gray-300 to-white animate-slide-right" />
          </div>
        </div>

        {/* Badge inferior */}
        <div className="mt-12 flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Conectando de forma segura</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slide-right {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(200%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-slide-right {
          animation: slide-right 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
