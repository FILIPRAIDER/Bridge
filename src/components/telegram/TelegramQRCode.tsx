// src/components/telegram/TelegramQRCode.tsx

"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { downloadQRCode, shareQRCode } from "@/utils/qrcode.utils";
import { toast } from "@/components/ui/toast";

interface TelegramQRCodeProps {
  /**
   * URL del grupo de Telegram (link de invitación)
   */
  url: string;
  
  /**
   * Tamaño del QR en píxeles
   */
  size?: number;
  
  /**
   * Mostrar botones de acción (descargar/compartir)
   */
  showActions?: boolean;
  
  /**
   * ID para el canvas (usado para descargar)
   */
  canvasId?: string;
}

/**
 * Componente para mostrar QR code de invitación a Telegram
 */
export function TelegramQRCode({
  url,
  size = 256,
  showActions = true,
  canvasId = "telegram-qr-canvas",
}: TelegramQRCodeProps) {
  const handleDownload = () => {
    downloadQRCode(canvasId, "invitacion-telegram.png");
    toast.success("QR descargado");
  };

  const handleShare = async () => {
    const success = await shareQRCode(canvasId, "Invitación a Telegram", "Únete a nuestro grupo");
    
    if (success) {
      toast.success("QR compartido");
    } else {
      // Fallback: copiar URL
      try {
        await navigator.clipboard.writeText(url);
        toast.info("Link copiado al portapapeles");
      } catch {
        toast.error("No se pudo compartir");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div className="rounded-2xl bg-white p-4 shadow-lg">
        <QRCodeCanvas
          id={canvasId}
          value={url}
          size={size}
          level="M"
          includeMargin
          className="rounded-lg"
        />
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        </div>
      )}

      {/* Info */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Escanea este código QR desde Telegram para unirte al grupo
      </p>
    </div>
  );
}
