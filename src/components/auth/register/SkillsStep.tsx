"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loader2, Plus, Trash2, Star, Search, X } from "lucide-react";
import type { Skill, UserSkill } from "@/types/api";

interface SkillsStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function SkillsStep({ onNext, onSkip }: SkillsStepProps) {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user } = useSession();
  const { show } = useToast();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  // Cargar skills del usuario al inicio
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        const userSkillsData = await api.get<UserSkill[]>(`/users/${user.id}/skills`);
        setUserSkills(Array.isArray(userSkillsData) ? userSkillsData : []);
      } catch (e) {
        console.error("Error cargando skills:", e);
        setUserSkills([]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 Buscar skills en tiempo real con debounce
  useEffect(() => {
    const searchSkills = async () => {
      if (searchTerm.length < 2) {
        setAllSkills([]);
        setIsDropdownOpen(false);
        return;
      }

      try {
        setSearchLoading(true);
        const response = await api.get<{ skills: Skill[]; pagination: any }>(
          `/skills?search=${encodeURIComponent(searchTerm)}&simple=true&limit=50`
        );
        const skillsData = response?.skills || response;
        setAllSkills(Array.isArray(skillsData) ? skillsData : []);
        setIsDropdownOpen(true);
        setHighlightedIndex(0);
      } catch (error) {
        console.error("Error searching skills:", error);
        setAllSkills([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchSkills, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filtrar skills que el usuario ya tiene
  const filteredSkills = Array.isArray(allSkills)
    ? allSkills.filter((skill) => !userSkills.some((us) => us.skillId === skill.id))
    : [];

  const handleAddSkill = async () => {
    if (!user?.id || !selectedSkill) {
      show({ message: "Selecciona un skill", variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/users/${user.id}/skills`, {
        skillId: selectedSkill.id,
        level: selectedLevel,
      });

      show({
        variant: "success",
        title: "Skill agregado",
        message: "",
      });

      // Limpiar y recargar
      setSelectedSkill(null);
      setSearchTerm("");
      setSelectedLevel(3);
      loadUserSkills();
    } catch (e) {
      const error = e as Error;
      show({
        variant: "error",
        title: "Error",
        message: error.message || "Intenta de nuevo",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserSkills = async () => {
    if (!user?.id) return;
    try {
      const userSkillsData = await api.get<UserSkill[]>(`/users/${user.id}/skills`);
      setUserSkills(Array.isArray(userSkillsData) ? userSkillsData : []);
    } catch (e) {
      console.error("Error cargando skills:", e);
    }
  };

  const handleUpdateLevel = async (userSkillId: string, newLevel: number) => {
    if (!user?.id) return;

    try {
      await api.patch<UserSkill>(
        `/users/${user.id}/skills/${userSkillId}`,
        { level: newLevel }
      );

      setUserSkills((prev) =>
        prev.map((us) => (us.id === userSkillId ? { ...us, level: newLevel } : us))
      );

      show({
        variant: "success",
        title: "Nivel actualizado",
        message: "",
      });
    } catch (e) {
      const error = e as Error;
      show({
        variant: "error",
        title: "Error",
        message: error.message,
      });
    }
  };

  const handleDeleteSkill = async (userSkillId: string, skillName: string) => {
    if (!user?.id) return;

    await showConfirm({
      title: "¿Eliminar este skill?",
      message: `Estás a punto de eliminar "${skillName}" de tu perfil. Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/users/${user.id}/skills/${userSkillId}`);
          setUserSkills((prev) => prev.filter((us) => us.id !== userSkillId));
          show({
            variant: "success",
            title: "Skill eliminado",
            message: "",
          });
        } catch (e) {
          const error = e as Error;
          show({
            variant: "error",
            title: "Error al eliminar",
            message: error.message,
          });
        }
      },
    });
  };

  const handleContinue = () => {
    if (userSkills.length === 0) {
      show({
        variant: "error",
        title: "Agrega al menos un skill",
        message: "O puedes omitir este paso si lo prefieres",
      });
      return;
    }
    onNext();
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <ConfirmDialogComponent />
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Tus habilidades</h1>
        <p className="text-gray-600">
          Selecciona tus skills y define tu nivel de dominio (opcional).
        </p>
      </div>

      {/* 🔥 Formulario de agregar skill - Siempre visible */}
      <div className="card p-6 space-y-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Plus className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-lg">Agregar Skill</h3>
        </div>

        {/* Buscar y Seleccionar Skill */}
        <div>
          <label className="label">Buscar y Seleccionar Skill</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length >= 2 && setIsDropdownOpen(true)}
              className="input pl-10 pr-10"
              placeholder="Escribe para buscar skills..."
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSkill(null);
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>

          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
              💡 Escribe al menos 2 caracteres para buscar
            </p>
          )}

          {/* Dropdown de resultados */}
          {isDropdownOpen && filteredSkills.length > 0 && (
            <div
              ref={dropdownRef}
              className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg"
            >
              {filteredSkills.map((skill, index) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => {
                    setSelectedSkill(skill);
                    setSearchTerm(skill.name);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${
                    index === highlightedIndex ? "bg-blue-50" : ""
                  } ${selectedSkill?.id === skill.id ? "bg-blue-50 font-medium" : ""}`}
                >
                  <span className="text-gray-900">{skill.name}</span>
                  {skill.category && (
                    <span className="text-sm text-gray-500 ml-2">• {skill.category}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && !searchLoading && filteredSkills.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No se encontraron skills. Contacta al administrador para agregarlo.
            </p>
          )}
        </div>

        {/* Nivel de Dominio: 3/5 */}
        {selectedSkill && (
          <div>
            <label className="label">Nivel de Dominio: {selectedLevel}/5</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      selectedLevel >= level
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Niveles: 1=Básico • 2=Intermedio • 3=Bueno • 4=Avanzado • 5=Experto
            </p>
          </div>
        )}

        {/* Botón Agregar */}
        <button
          type="button"
          onClick={handleAddSkill}
          disabled={!selectedSkill || loading}
          className="btn btn-dark w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Agregando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Skill
            </>
          )}
        </button>
      </div>

      {/* Lista de skills del usuario */}
      {userSkills.length > 0 ? (
        <div className="space-y-3 mb-6">
          {userSkills.map((userSkill) => (
            <div
              key={userSkill.id}
              className="card p-4 hover:shadow-sm transition flex items-center gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {userSkill.skill?.name || "Skill"}
                </h3>
                {userSkill.skill?.category && (
                  <p className="text-sm text-gray-500">{userSkill.skill.category}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleUpdateLevel(userSkill.id, level)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        userSkill.level >= level
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSkill(userSkill.id, userSkill.skill?.name || "este skill")}
                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No has agregado skills aún.</p>
          <p className="text-sm mt-1">Haz clic en &ldquo;Agregar&rdquo; para comenzar.</p>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={userSkills.length === 0}
          className="btn btn-dark flex-1 disabled:opacity-60 order-1"
        >
          Finalizar registro
        </button>
        <button 
          type="button" 
          onClick={onSkip} 
          className="btn btn-outline w-full sm:w-auto whitespace-nowrap order-2"
        >
          Completar más tarde
        </button>
      </div>
    </div>
  );
}
