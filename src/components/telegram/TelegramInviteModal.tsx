// src/components/telegram/TelegramInviteModal.tsx

"use client";

import { useState } from "react";
import { X, Mail, QrCode, Link2, Loader2, Send, Copy, Check } from "lucide-react";
import { TelegramMemberList } from "./TelegramMemberList";
import { TelegramQRCode } from "./TelegramQRCode";
import type { TelegramMember } from "@/types/telegram";
import { copyToClipboard } from "@/utils/telegram.utils";
import { toast } from "@/components/ui/toast";

interface TelegramInviteModalProps {
  /**
   * Si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Callback para cerrar
   */
  onClose: () => void;
  
  /**
   * Link de invitación del grupo
   */
  inviteLink: string;
  
  /**
   * Lista de miembros del área
   */
  members: TelegramMember[];
  
  /**
   * Callback para enviar invitaciones por email
   */
  onSendInvites: (memberIds: string[], message?: string) => Promise<void>;
  
  /**
   * Tab inicial a mostrar (por defecto: "email")
   */
  defaultTab?: "email" | "qr" | "link";
}

type Tab = "email" | "qr" | "link";

/**
 * Modal para invitar miembros a Telegram (3 tabs: Email, QR, Link)
 */
export function TelegramInviteModal({
  isOpen,
  onClose,
  inviteLink,
  members,
  onSendInvites,
  defaultTab = "email",
}: TelegramInviteModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendEmails = async () => {
    if (selectedMemberIds.length === 0) {
      toast.error("Selecciona al menos un miembro");
      return;
    }

    setSending(true);
    try {
      await onSendInvites(selectedMemberIds, customMessage || undefined);
      toast.success("Invitaciones enviadas");
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Error enviando invitaciones");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(inviteLink);
    if (success) {
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Error copiando link");
    }
  };

  const handleClose = () => {
    setSelectedMemberIds([]);
    setCustomMessage("");
    setSending(false);
    setCopied(false);
    onClose();
  };

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: "email", label: "Por Email", icon: Mail },
    { id: "qr", label: "Código QR", icon: QrCode },
    { id: "link", label: "Link Directo", icon: Link2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Invitar Miembros a Telegram
          </h2>
          <button
            onClick={handleClose}
            disabled={sending}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab: Email */}
          {activeTab === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Seleccionar Miembros
                </label>
                <TelegramMemberList
                  members={members}
                  selectedIds={selectedMemberIds}
                  onSelectionChange={setSelectedMemberIds}
                  multiSelect
                  showJoined={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensaje Personalizado (Opcional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Agrega un mensaje personalizado a la invitación..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab: QR */}
          {activeTab === "qr" && (
            <div className="flex flex-col items-center">
              <TelegramQRCode url={inviteLink} size={256} showActions />
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 w-full">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Instrucciones:</strong> Los miembros pueden escanear este código QR 
                  desde Telegram para unirse al grupo automáticamente.
                </p>
              </div>
            </div>
          )}

          {/* Tab: Link */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link de Invitación
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>⚠️ Importante:</strong> Este link permite a cualquier persona unirse al grupo. 
                  Compártelo solo con miembros de confianza.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opciones de Compartir:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Compartir por WhatsApp, email o redes sociales</li>
                  <li>Incluir en documentos o presentaciones</li>
                  <li>Publicar en canales internos de comunicación</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === "email" && (
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleClose}
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendEmails}
              disabled={sending || selectedMemberIds.length === 0}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Invitaciones ({selectedMemberIds.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
