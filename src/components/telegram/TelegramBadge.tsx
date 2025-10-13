// src/components/telegram/TelegramBadge.tsx

import { Send } from "lucide-react";

interface TelegramBadgeProps {
  /**
   * Origen del mensaje: 'web' | 'telegram'
   */
  source: 'web' | 'telegram';
  
  /**
   * Tamaño del badge
   */
  size?: 'sm' | 'md';
  
  /**
   * Mostrar solo el ícono o también el texto
   */
  iconOnly?: boolean;
}

/**
 * Badge que indica el origen de un mensaje (Web o Telegram)
 */
export function TelegramBadge({ source, size = 'sm', iconOnly = false }: TelegramBadgeProps) {
  if (source !== 'telegram') return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium ${sizeClasses[size]}`}>
      <Send className={iconSizes[size]} />
      {!iconOnly && <span>Telegram</span>}
    </span>
  );
}
