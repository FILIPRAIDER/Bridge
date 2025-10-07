"use client";

import { useEffect, useMemo, useState, forwardRef } from "react";

type Props = {
  name: string;
  placeholder?: string;
  onValidityChange?: (ok: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ name, placeholder = "••••••••", onValidityChange, onChange, value: externalValue }, ref) => {
    const [show, setShow] = useState(false);
    const [internalValue, setInternalValue] = useState("");
    
    // Usar valor controlado externamente si existe, sino usar el interno
    const value = externalValue !== undefined ? externalValue : internalValue;

    const checks = useMemo(() => {
      const hasLen = value.length >= 8 && value.length <= 72;
      const hasUpper = /[A-Z]/.test(value);
      const hasNum = /[0-9]/.test(value);
      const hasSpec = /[!@#$%^&*()_\-+={}\[\]|\\:;"'<>,.?/]/.test(value);
      const score = [hasLen, hasUpper, hasNum, hasSpec].filter(Boolean).length;
      const ok = score === 4;
      return { hasLen, hasUpper, hasNum, hasSpec, score, ok };
    }, [value]);

    // ✅ Avisar al padre DESPUÉS del render
    useEffect(() => {
      onValidityChange?.(checks.ok);
    }, [checks.ok, onValidityChange]);

    // Indicador de fuerza
    const strengthBar = useMemo(() => {
      const bars = 4;
      const active = checks.score;
      const palette = ["bg-red-500", "bg-amber-500", "bg-lime-500", "bg-green-600"];
      return Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < active ? palette[Math.min(active - 1, palette.length - 1)] : "bg-gray-200"
          }`}
        />
      ));
    }, [checks.score]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (externalValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={ref}
            name={name}
            type={show ? "text" : "password"}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="input pr-12"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-3 my-auto h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? (
              <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5">
                <path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0-3C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8Z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5">
                <path fill="currentColor" d="M3.28 2.22 2.22 3.28l3.05 3.05C3.99 7.42 2.78 8.6 2 10c1.73 4.89 6 8 11 8 1.9 0 3.67-.47 5.25-1.3l2.47 2.47 1.06-1.06-18.5-18.9ZM12 6c4.85 0 9.1 3.06 10.83 8-1.05 2.95-3.2 5.1-5.83 6.15l-2.1-2.1c.69-.49 1.1-1.27 1.1-2.15a3 3 0 0 0-3-3c-.88 0-1.66.41-2.15 1.1L8 10.1A5 5 0 0 1 12 6Z"/>
              </svg>
            )}
          </button>
        </div>

      <div className="grid grid-cols-4 gap-1">{strengthBar}</div>

      <ul className="mt-1 space-y-1 text-sm">
        <Rule ok={checks.hasLen}   text="Entre 8 y 72 caracteres" />
        <Rule ok={checks.hasUpper} text="Al menos una mayúscula" />
        <Rule ok={checks.hasNum}   text="Al menos un número" />
        <Rule ok={checks.hasSpec}  text="Al menos un carácter especial" />
      </ul>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-gray-600"}`}>
      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
        ok ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
      }`}>
        {ok ? "✓" : "•"}
      </span>
      <span>{text}</span>
    </li>
  );
}
