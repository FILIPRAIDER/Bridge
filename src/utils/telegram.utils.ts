// src/utils/telegram.utils.ts

/**
 * Utilidades para integración con Telegram
 */

// ============================================
// FORMAT & VALIDATION
// ============================================

/**
 * Formatea un código de vinculación de Telegram
 * @param code Código sin formato (ej: "TGABC123XYZ")
 * @returns Código formateado (ej: "TG-ABC-123-XYZ")
 */
export function formatLinkCode(code: string): string {
  if (!code) return '';
  
  // Remover espacios y guiones
  const clean = code.replace(/[\s-]/g, '').toUpperCase();
  
  // Formato: TG-ABC-123-XYZ
  if (clean.length === 12 && clean.startsWith('TG')) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5, 8)}-${clean.slice(8, 11)}`;
  }
  
  return clean;
}

/**
 * Valida si un código de vinculación es válido
 * @param code Código a validar
 * @returns true si es válido
 */
export function isValidLinkCode(code: string): boolean {
  if (!code) return false;
  
  const clean = code.replace(/[\s-]/g, '').toUpperCase();
  
  // Debe tener 12 caracteres y empezar con TG
  if (clean.length !== 12 || !clean.startsWith('TG')) {
    return false;
  }
  
  // Resto debe ser alfanumérico
  const rest = clean.slice(2);
  return /^[A-Z0-9]+$/.test(rest);
}

// ============================================
// CLIPBOARD
// ============================================

/**
 * Copia texto al portapapeles
 * @param text Texto a copiar
 * @returns true si tuvo éxito
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores sin soporte o HTTP
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

// ============================================
// TELEGRAM UTILS
// ============================================

/**
 * Obtiene el username del bot desde env o usa default
 */
export function getTelegramBotUsername(): string {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'BridgeAppBot';
}

/**
 * Genera URL de Telegram para abrir un grupo
 * @param inviteLink Link de invitación completo
 * @returns URL de Telegram
 */
export function getTelegramGroupUrl(inviteLink: string): string {
  if (inviteLink.startsWith('https://t.me/')) {
    return inviteLink;
  }
  return `https://t.me/${inviteLink}`;
}

/**
 * Extrae el código de invitación de un link de Telegram
 * @param link Link completo (ej: "https://t.me/+ABC123xyz")
 * @returns Código de invitación
 */
export function extractInviteCode(link: string): string {
  if (link.includes('t.me/+')) {
    return link.split('t.me/+')[1];
  }
  if (link.includes('t.me/joinchat/')) {
    return link.split('t.me/joinchat/')[1];
  }
  return link;
}

// ============================================
// MESSAGE FORMATTING
// ============================================

/**
 * Formatea un mensaje para mostrar el origen
 * @param source 'web' | 'telegram'
 * @returns Label de origen
 */
export function getMessageSourceLabel(source: 'web' | 'telegram'): string {
  return source === 'telegram' ? 'Telegram' : 'Web';
}

/**
 * Obtiene el nombre completo de un usuario de Telegram
 * @param firstName Nombre
 * @param lastName Apellido
 * @param username Username de Telegram
 * @returns Nombre formateado
 */
export function getTelegramUserDisplayName(
  firstName?: string,
  lastName?: string,
  username?: string
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (username) {
    return `@${username}`;
  }
  return 'Usuario de Telegram';
}

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Convierte timestamp de Telegram (Unix) a Date
 * @param timestamp Unix timestamp en segundos
 * @returns Date object
 */
export function telegramTimestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Formatea fecha relativa (hace 5 minutos, hace 2 horas, etc)
 * @param date Fecha a formatear
 * @returns String con tiempo relativo
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHour < 24) return `Hace ${diffHour}h`;
  if (diffDay < 7) return `Hace ${diffDay}d`;
  
  return past.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });
}
