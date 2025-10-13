// src/components/telegram/TelegramSetupWizard.tsx

"use client";

import { useState } from "react";
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Users, 
  Link2, 
  MessageSquare,
  Loader2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { TelegramLinkModal } from "./TelegramLinkModal";
import { TelegramInviteModal } from "./TelegramInviteModal";
import type { TelegramSetupStep, TelegramGroup, TelegramMember } from "@/types/telegram";
import { getTelegramBotUsername, copyToClipboard } from "@/utils/telegram.utils";
import { toast } from "@/components/ui/toast";

interface TelegramSetupWizardProps {
  /**
   * Si el wizard está abierto
   */
  isOpen: boolean;
  
  /**
   * Callback para cerrar
   */
  onClose: () => void;
  
  /**
   * ID del área
   */
  areaId: string;
  
  /**
   * Nombre del área
   */
  areaName: string;
  
  /**
   * ID del equipo
   */
  teamId: string;
  
  /**
   * Lista de miembros del área
   */
  members: TelegramMember[];
  
  /**
   * Función para vincular el grupo
   */
  onLinkGroup: (
    chatId: string,
    chatTitle: string,
    chatType: 'group' | 'supergroup' | 'channel',
    teamId: string,
    inviteLink?: string
  ) => Promise<TelegramGroup>;
  
  /**
   * Función para validar código
   */
  validateCode: (code: string) => Promise<{
    valid: boolean;
    chatId?: string;
    chatTitle?: string;
    chatType?: 'group' | 'supergroup' | 'channel';
    message?: string;
  }>;
  
  /**
   * Función para enviar invitaciones
   */
  onSendInvites: (memberIds: string[], message?: string) => Promise<void>;
  
  /**
   * Callback cuando se completa el setup
   */
  onComplete: (group: TelegramGroup) => void;
}

/**
 * Wizard de 6 pasos para configurar Telegram
 */
export function TelegramSetupWizard({
  isOpen,
  onClose,
  areaId,
  areaName,
  teamId,
  members,
  onLinkGroup,
  validateCode,
  onSendInvites,
  onComplete,
}: TelegramSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<TelegramSetupStep>("intro");
  const [linkedGroup, setLinkedGroup] = useState<TelegramGroup | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const botUsername = getTelegramBotUsername();

  const steps: TelegramSetupStep[] = [
    "intro",
    "create-group",
    "add-bot",
    "link-code",
    "invite-members",
    "success",
  ];

  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleCodeValidated = async (
    chatId: string,
    chatTitle: string,
    chatType: 'group' | 'supergroup' | 'channel'
  ) => {
    setLoading(true);
    try {
      const group = await onLinkGroup(chatId, chatTitle, chatType, teamId);
      setLinkedGroup(group);
      setShowLinkModal(false);
      handleNext(); // Ir a invite-members
    } catch (err: any) {
      toast.error(err.message || "Error vinculando grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (linkedGroup) {
      onComplete(linkedGroup);
    }
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep("intro");
    setLinkedGroup(null);
    setLoading(false);
    onClose();
  };

  const handleCopyBotUsername = async () => {
    const success = await copyToClipboard(`@${botUsername}`);
    if (success) {
      toast.success("Username copiado");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Configurar Telegram
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>Paso {currentStepIndex + 1} de {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* STEP 1: Intro */}
            {currentStep === "intro" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Send className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ¡Conecta tu equipo con Telegram!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sincroniza los mensajes de <strong>{areaName}</strong> con un grupo de Telegram
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ¿Qué vamos a hacer?
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Crear un grupo de Telegram",
                      "Agregar el bot de Bridge al grupo",
                      "Vincular el grupo con esta área",
                      "Invitar a los miembros del equipo",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {i + 1}
                          </span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Tiempo estimado:</strong> 5 minutos
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Create Group */}
            {currentStep === "create-group" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Paso 1: Crear Grupo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Crea un nuevo grupo en Telegram para tu equipo
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Instrucciones:
                  </p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                    <li>Abre Telegram en tu móvil o computadora</li>
                    <li>Toca el botón de "Nuevo Mensaje" o "Menú"</li>
                    <li>Selecciona "Nuevo Grupo"</li>
                    <li>
                      Dale un nombre al grupo (sugerido: <strong>"{areaName}"</strong>)
                    </li>
                    <li>Puedes agregar algunos miembros ahora o hacerlo después</li>
                    <li>Toca "Crear" para finalizar</li>
                  </ol>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>💡 Tip:</strong> Convierte el grupo en "Supergrupo" para tener más 
                    funciones y capacidad de miembros ilimitada.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: Add Bot */}
            {currentStep === "add-bot" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Paso 2: Agregar el Bot
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Agrega el bot de Bridge a tu grupo
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Instrucciones:
                  </p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                    <li>Entra al grupo que acabas de crear</li>
                    <li>Toca el nombre del grupo en la parte superior</li>
                    <li>Selecciona "Agregar Miembros"</li>
                    <li>
                      Busca el bot: 
                      <button
                        onClick={handleCopyBotUsername}
                        className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-mono hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                      >
                        @{botUsername}
                        <Copy className="h-3 w-3" />
                      </button>
                    </li>
                    <li>Selecciona el bot y agrégalo al grupo</li>
                    <li>Dale permisos de administrador (recomendado)</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>✅ Permisos necesarios:</strong> Enviar mensajes, Ver mensajes, 
                      Invitar usuarios
                    </p>
                  </div>
                  <a
                    href={`https://t.me/${botUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center gap-2 font-medium"
                  >
                    Abrir Bot
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {/* STEP 4: Link Code */}
            {currentStep === "link-code" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Link2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Paso 3: Vincular Grupo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Obtén el código de vinculación del bot
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Instrucciones:
                  </p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                    <li>En el grupo de Telegram, escribe el comando: <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">/link</code></li>
                    <li>El bot responderá con un código de 12 caracteres (ej: TG-ABC-123-XYZ)</li>
                    <li>Copia ese código</li>
                    <li>Haz clic en el botón de abajo e ingresa el código</li>
                  </ol>
                </div>

                <button
                  onClick={() => setShowLinkModal(true)}
                  className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium text-lg flex items-center justify-center gap-2"
                >
                  <Link2 className="h-5 w-5" />
                  Ingresar Código de Vinculación
                </button>

                {linkedGroup && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-900 dark:text-green-100">
                      <strong>¡Grupo vinculado!</strong> {linkedGroup.chatTitle} está conectado a {areaName}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Invite Members */}
            {currentStep === "invite-members" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Paso 4: Invitar Miembros
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Invita a tu equipo a unirse al grupo
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Tienes {members.length} miembros en <strong>{areaName}</strong>. 
                    Puedes invitarlos ahora o hacerlo más tarde desde la configuración.
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Enviar Invitaciones
                  </button>
                </div>

                <div className="flex gap-3 text-sm">
                  <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Por Email
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Con QR y link
                    </p>
                  </div>
                  <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Código QR
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Para escanear
                    </p>
                  </div>
                  <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Link Directo
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Para compartir
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Success */}
            {currentStep === "success" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ¡Configuración Completa!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tu grupo de Telegram está listo para usar
                  </p>
                </div>

                {linkedGroup && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Grupo:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{linkedGroup.chatTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Área:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{areaName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo:</span>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">{linkedGroup.chatType}</span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-left space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                    ¿Qué sigue?
                  </p>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Los mensajes de este chat se sincronizarán automáticamente con Telegram</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Los mensajes de Telegram aparecerán aquí en tiempo real</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Puedes gestionar la configuración desde el botón de Telegram en el chat</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {currentStep !== "intro" && currentStep !== "success" && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </button>
            )}

            <div className="flex-1" />

            {currentStep === "intro" && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-2"
              >
                Comenzar
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep !== "intro" && currentStep !== "link-code" && currentStep !== "success" && (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep === "link-code" && linkedGroup && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-2"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep === "success" && (
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TelegramLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onCodeValidated={handleCodeValidated}
        validateCode={validateCode}
      />

      {linkedGroup && (
        <TelegramInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          inviteLink={linkedGroup.inviteLink || ""}
          members={members}
          onSendInvites={onSendInvites}
        />
      )}
    </>
  );
}
