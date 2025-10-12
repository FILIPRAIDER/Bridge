"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CreateAreaRequest } from "@/types/areas";

interface CreateAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateAreaRequest) => Promise<void>;
}

const AREA_COLORS = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#8B5CF6", label: "Púrpura" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Naranja" },
  { value: "#EF4444", label: "Rojo" },
  { value: "#6B7280", label: "Gris" },
];

const AREA_ICONS = ["💻", "🎨", "📊", "🚀", "📱", "🔬", "💡", "📝", "🎯", "⚙️"];

export function CreateAreaModal({ isOpen, onClose, onCreate }: CreateAreaModalProps) {
  const [formData, setFormData] = useState<CreateAreaRequest>({
    name: "",
    description: "",
    color: AREA_COLORS[0].value,
    icon: AREA_ICONS[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
      setFormData({ name: "", description: "", color: AREA_COLORS[0].value, icon: AREA_ICONS[0] });
    } catch (error) {
      console.error("Error creating area:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 px-6 py-5 border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Crear Nueva Área</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Área *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Desarrollo, Diseño, Marketing..."
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el propósito de esta área..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all resize-none"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icono
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AREA_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`h-12 flex items-center justify-center text-2xl rounded-lg border-2 transition-all ${
                    formData.icon === icon
                      ? "border-gray-900 bg-gray-100 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AREA_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    formData.color === color.value
                      ? "border-gray-900 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-sm font-medium text-gray-700">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Vista previa:</p>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{formData.name || "Nombre del área"}</p>
                {formData.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">{formData.description}</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Área"}
          </button>
        </div>
      </div>
    </div>
  );
}
