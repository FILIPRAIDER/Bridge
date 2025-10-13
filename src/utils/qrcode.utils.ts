// src/utils/qrcode.utils.ts

/**
 * Utilidades para generación y descarga de QR codes
 */

// ============================================
// QR CODE GENERATION
// ============================================

/**
 * Descarga un QR code como imagen PNG
 * @param canvasId ID del elemento canvas que contiene el QR
 * @param filename Nombre del archivo a descargar
 */
export function downloadQRCode(canvasId: string, filename: string = 'telegram-qr.png'): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas not found:', canvasId);
    return;
  }

  try {
    // Obtener el data URL del canvas
    const dataUrl = canvas.toDataURL('image/png');
    
    // Crear un link temporal para descargar
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
  }
}

/**
 * Convierte canvas a Blob para compartir
 * @param canvasId ID del elemento canvas
 * @returns Promise con el Blob
 */
export async function canvasToBlob(canvasId: string): Promise<Blob | null> {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas not found:', canvasId);
    return null;
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Comparte QR code usando Web Share API (móviles)
 * @param canvasId ID del elemento canvas
 * @param title Título para compartir
 * @param text Texto para compartir
 */
export async function shareQRCode(
  canvasId: string,
  title: string = 'Invitación a Telegram',
  text: string = 'Únete a nuestro grupo'
): Promise<boolean> {
  // Verificar si el navegador soporta Web Share API
  if (!navigator.share) {
    console.warn('Web Share API not supported');
    return false;
  }

  try {
    const blob = await canvasToBlob(canvasId);
    
    if (!blob) {
      return false;
    }

    const file = new File([blob], 'telegram-qr.png', { type: 'image/png' });

    await navigator.share({
      title,
      text,
      files: [file]
    });

    return true;
  } catch (error) {
    console.error('Error sharing QR code:', error);
    return false;
  }
}

// ============================================
// QR CODE OPTIONS
// ============================================

/**
 * Opciones por defecto para QR codes de Bridge
 */
export const DEFAULT_QR_OPTIONS = {
  size: 256,
  level: 'M' as const, // L, M, Q, H
  bgColor: '#FFFFFF',
  fgColor: '#000000',
  includeMargin: true,
  marginSize: 4,
};

/**
 * Obtiene opciones de QR personalizadas para tema claro/oscuro
 * @param isDark Si es tema oscuro
 * @returns Opciones de QR
 */
export function getQROptions(isDark: boolean = false) {
  return {
    ...DEFAULT_QR_OPTIONS,
    bgColor: isDark ? '#1a1a1a' : '#FFFFFF',
    fgColor: isDark ? '#FFFFFF' : '#000000',
  };
}
