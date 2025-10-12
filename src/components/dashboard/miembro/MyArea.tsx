"use client";

import { FolderOpen } from "lucide-react";

interface MyAreaProps {
  userId: string;
}

export function MyArea({ userId }: MyAreaProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      {/* Icon */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 mb-6 shadow-inner">
        <FolderOpen className="h-16 w-16 text-gray-600" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Mi Área
      </h2>

      {/* Description */}
      <p className="text-gray-600 text-center max-w-md px-4">
        Esta funcionalidad estará disponible próximamente. Aquí podrás ver tu área asignada,
        compartir archivos y chatear con tu equipo en tiempo real.
      </p>

      {/* Feature List */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full mx-4 shadow-sm">
        <p className="font-semibold text-gray-900 mb-3">Próximamente podrás:</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Ver información de tu área
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Compartir archivos con tu equipo
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Chatear en tiempo real
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Ver actividad reciente
          </li>
        </ul>
      </div>
    </div>
  );
}
