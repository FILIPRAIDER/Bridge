"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  variant = "danger",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
      border: "border-red-200",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      button: "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800",
      border: "border-yellow-200",
    },
    info: {
      icon: AlertTriangle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      border: "border-blue-200",
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        {/* Header con gradiente sutil */}
        <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 px-6 py-5 border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className={`${style.iconBg} rounded-xl p-3 shadow-inner`}>
              <Icon className={`h-6 w-6 ${style.iconColor}`} />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-medium text-white ${style.button} transition-all shadow-md hover:shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Hook para usar el dialog fácilmente
export function useConfirmDialog() {
  const [config, setConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (options: Omit<typeof config, "isOpen">) => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        ...options,
        isOpen: true,
        onConfirm: () => {
          options.onConfirm();
          resolve(true);
        },
      });
    });
  };

  const closeConfirm = () => {
    setConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={config.isOpen}
      onClose={closeConfirm}
      onConfirm={config.onConfirm}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
    />
  );

  return {
    showConfirm,
    closeConfirm,
    ConfirmDialogComponent,
  };
}
