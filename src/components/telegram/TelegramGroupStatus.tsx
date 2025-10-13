// src/components/telegram/TelegramGroupStatus.tsx

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { TelegramGroup } from "@/types/telegram";

interface TelegramGroupStatusProps {
  group: TelegramGroup | null;
  loading?: boolean;
}

/**
 * Muestra el estado de conexión del grupo de Telegram
 */
export function TelegramGroupStatus({ group, loading }: TelegramGroupStatusProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        <span>Verificando conexión...</span>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <XCircle className="h-4 w-4 text-gray-400" />
        <span>No hay grupo vinculado</span>
      </div>
    );
  }

  if (!group.isActive) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
        <AlertCircle className="h-4 w-4" />
        <span>Grupo inactivo</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
      <CheckCircle2 className="h-4 w-4" />
      <span>Conectado a <strong>{group.chatTitle}</strong></span>
    </div>
  );
}
