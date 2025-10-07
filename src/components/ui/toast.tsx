"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastVariant = "success" | "error" | "info" | "warning";
type Toast = { id: string; title?: string; message: string; variant?: ToastVariant; duration?: number };

type ToastContextValue = {
  show: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// Helper para uso fuera de componentes
let toastInstance: ToastContextValue | null = null;

export const toast = {
  success: (message: string, title?: string) => {
    if (toastInstance) {
      toastInstance.show({ message, title, variant: "success" });
    }
  },
  error: (message: string, title?: string) => {
    if (toastInstance) {
      toastInstance.show({ message, title, variant: "error" });
    }
  },
  info: (message: string, title?: string) => {
    if (toastInstance) {
      toastInstance.show({ message, title, variant: "info" });
    }
  },
  warning: (message: string, title?: string) => {
    if (toastInstance) {
      toastInstance.show({ message, title, variant: "warning" });
    }
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: string) => {
    setItems((x) => x.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${idRef.current++}`;
    const duration = t.duration ?? 3200;
    const toast: Toast = { id, variant: t.variant ?? "info", ...t };
    setItems((x) => [...x, toast]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  // Guardar instancia para uso fuera de componentes
  toastInstance = value;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Contenedor visual */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3">
        {items.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors = {
    success: "bg-green-600 text-white",
    error:   "bg-red-600 text-white",
    info:    "bg-gray-900 text-white",
    warning: "bg-amber-500 text-black",
  } as const;

  const Icon = {
    success: () => (<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M9.55 17.3 4.8 12.55l1.4-1.4 3.35 3.35 7.25-7.25 1.4 1.4z"/></svg>),
    error:   () => (<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z"/></svg>),
    info:    () => (<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M11 7h2v2h-2V7Zm0 4h2v6h-2v-6Zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z"/></svg>),
    warning: () => (<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z"/></svg>),
  }[toast.variant ?? "info"];

  return (
    <div className={`pointer-events-auto w-full max-w-md rounded-2xl shadow-lg ring-1 ring-black/10 ${colors[toast.variant ?? "info"]} animate-in fade-in slide-in-from-top-3`}>
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5"><Icon /></div>
        <div className="flex-1">
          {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
          <div className="text-sm opacity-95">{toast.message}</div>
        </div>
        <button onClick={onClose} className="rounded-full/3 p-1 opacity-80 hover:opacity-100 transition" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M18.3 5.71 12 12.01l-6.3-6.3-1.4 1.41 6.3 6.29-6.3 6.3 1.41 1.4 6.29-6.29 6.3 6.29 1.4-1.4-6.29-6.3 6.29-6.29z"/></svg>
        </button>
      </div>
    </div>
  );
}
