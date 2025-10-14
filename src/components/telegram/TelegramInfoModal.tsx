// src/components/telegram/TelegramInfoModal.tsx

"use client";

import { X, Users, QrCode, Link2, Copy, ExternalLink } from "lucide-react";
import { TelegramQRCode } from "./TelegramQRCode";
import { copyToClipboard } from "@/utils/telegram.utils";
import { toast } from "@/components/ui/toast";
import type { TelegramGroup } from "@/types/telegram";

interface TelegramInfoModalProps {
  /**
   * Si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Callback para cerrar
   */
  onClose: () => void;
  
  /**
   * Grupo de Telegram vinculado
   */
  group: TelegramGroup;
  
  /**
   * Nombre del área
   */
  areaName: string;
}

/**
 * Modal informativo para MIEMBROS - Solo muestra info del grupo y QR/Link
 * No permite configurar (eso es solo para LÍDER)
 */
export function TelegramInfoModal({
  isOpen,
  onClose,
  group,
  areaName,
}: TelegramInfoModalProps) {
  if (!isOpen) return null;

  const inviteLink = group.inviteLink || `https://t.me/${group.chatTitle}`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(inviteLink);
    if (success) {
      toast.success("Link copiado al portapapeles");
    } else {
      toast.error("Error al copiar link");
    }
  };

  const handleOpenTelegram = () => {
    window.open(inviteLink, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Grupo de Telegram
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {areaName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info del grupo */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {group.chatTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Grupo vinculado • {group.chatType === 'supergroup' ? 'Supergrupo' : 'Grupo'}
                </p>
              </div>
            </div>
          </div>

          {/* Métodos de unión */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <QrCode className="h-4 w-4" />
                Escanea con tu móvil
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <TelegramQRCode
                  url={inviteLink}
                  size={180}
                  showActions={false}
                />
              </div>
            </div>

            {/* Link de invitación */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Link2 className="h-4 w-4" />
                Link de invitación
              </div>
              <div className="space-y-3">
                {/* Link copiable */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-gray-700 dark:text-gray-300 break-all">
                      {inviteLink}
                    </code>
                    <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition flex-shrink-0"
                      title="Copiar link"
                    >
                      <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Botón abrir Telegram */}
                <button
                  onClick={handleOpenTelegram}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir en Telegram
                </button>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cómo unirte
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1.</span>
                <span>Escanea el código QR con la cámara de tu móvil</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">2.</span>
                <span>O copia el link y ábrelo en Telegram</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">3.</span>
                <span>¡Listo! Ya podrás recibir notificaciones y participar</span>
              </li>
            </ul>
          </div>

          {/* Nota informativa */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ <strong>Nota:</strong> Los mensajes del grupo de Telegram se sincronizarán automáticamente con esta área. 
              Solo el líder puede configurar y administrar el grupo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
