// src/components/telegram/TelegramLinkModal.tsx

"use client";

import { useState } from "react";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { formatLinkCode, isValidLinkCode } from "@/utils/telegram.utils";
import { toast } from "@/components/ui/toast";

interface TelegramLinkModalProps {
  /**
   * Si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Callback para cerrar
   */
  onClose: () => void;
  
  /**
   * Callback cuando se valida el código exitosamente
   */
  onCodeValidated: (chatId: string, chatTitle: string, chatType: 'group' | 'supergroup' | 'channel') => void;
  
  /**
   * Función para validar el código con el backend
   */
  validateCode: (code: string) => Promise<{
    valid: boolean;
    chatId?: string;
    chatTitle?: string;
    chatType?: 'group' | 'supergroup' | 'channel';
    message?: string;
  }>;
}

/**
 * Modal para ingresar y validar código de vinculación de Telegram
 */
export function TelegramLinkModal({
  isOpen,
  onClose,
  onCodeValidated,
  validateCode,
}: TelegramLinkModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validar formato
    if (!isValidLinkCode(code)) {
      setError("Código inválido. Debe tener formato TG-XXX-XXX-XXX");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateCode(code);

      if (result.valid && result.chatId && result.chatTitle && result.chatType) {
        toast.success("Código válido");
        onCodeValidated(result.chatId, result.chatTitle, result.chatType);
        handleClose();
      } else {
        setError(result.message || "Código inválido");
      }
    } catch (err: any) {
      setError(err.message || "Error validando código");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError(null);
    setLoading(false);
    onClose();
  };

  const formattedCode = formatLinkCode(code);
  const isValid = isValidLinkCode(code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Vincular Grupo de Telegram
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de Vinculación
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
              placeholder="TG-ABC-123-XYZ"
              disabled={loading}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl font-mono text-center text-lg tracking-wider focus:outline-none transition text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : code && isValid
                  ? "border-green-500 focus:border-green-500"
                  : "border-gray-300 dark:border-gray-700 focus:border-blue-500"
              }`}
            />
            {formattedCode && formattedCode !== code && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Formato: {formattedCode}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Success indicator */}
          {code && isValid && !error && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Código con formato válido
              </p>
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              ¿Dónde encuentro el código?
            </p>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Abre el bot de Bridge en Telegram</li>
              <li>Envía el comando <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">/vincular</code></li>
              <li>El bot te enviará un código de 12 caracteres</li>
              <li>Copia e ingresa ese código aquí</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              "Vincular Grupo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
