"use client";

import { useState, useEffect, useRef } from "react";
import { Target, Plus, Trash2, Loader2, Search, X, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { Skill, UserSkill } from "@/types/api";

interface MySkillsProps {
  userId: string;
}

export function MySkills({ userId }: MySkillsProps) {
  const { show } = useToast();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const userSkillsData = await api.get<UserSkill[]>(`/users/${userId}/skills`);
      setMySkills(Array.isArray(userSkillsData) ? userSkillsData : []);
    } catch (error) {
      console.error("Error loading user skills:", error);
      setMySkills([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar skills en el backend con debounce
  useEffect(() => {
    const searchSkills = async () => {
      if (searchTerm.length < 2) {
        setAllSkills([]);
        return;
      }

      try {
        setSearchLoading(true);
        // ✅ Usar simple=true para obtener solo id y name (más rápido)
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

  const handleAdd = async () => {
    if (!selectedSkill) {
      show({ message: "Selecciona un skill", variant: "warning" });
      return;
    }

    try {
      await api.post(`/users/${userId}/skills`, {
        skillId: selectedSkill.id,
        level: selectedLevel,
      });
      show({ message: "Skill agregado", variant: "success" });
      setSelectedSkill(null);
      setSearchTerm("");
      setSelectedLevel(3);
      loadData();
    } catch (error: any) {
      show({ message: error.message || "Error al agregar skill", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este skill?")) return;
    try {
      await api.delete(`/users/${userId}/skills/${id}`);
      show({ message: "Skill eliminado", variant: "success" });
      loadData();
    } catch (error: any) {
      show({ message: error.message || "Error al eliminar", variant: "error" });
    }
  };

  // Filtrar skills que el usuario ya tiene
  const filteredSkills = Array.isArray(allSkills)
    ? allSkills.filter((skill) => !mySkills.some((us) => us.skillId === skill.id))
    : [];

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || filteredSkills.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSkills.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredSkills[highlightedIndex]) {
          handleSelectSkill(filteredSkills[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        break;
    }
  };

  const handleSelectSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setSearchTerm(skill.name);
    setIsDropdownOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedSkill(null);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Skill Form */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Agregar Skill
        </h2>
        
        <div className="space-y-4">
          {/* Autocomplete Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar y Seleccionar Skill
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedSkill(null);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchTerm.length >= 2 && filteredSkills.length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Escribe para buscar skills..."
                  autoComplete="off"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
                )}
                {!searchLoading && selectedSkill && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Dropdown de resultados */}
              {isDropdownOpen && filteredSkills.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  {filteredSkills.map((skill, index) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSelectSkill(skill)}
                      className={`w-full text-left px-4 py-2.5 transition-colors border-b border-gray-100 last:border-b-0 ${
                        index === highlightedIndex
                          ? "bg-gray-900 text-white"
                          : "hover:bg-gray-50 text-gray-900"
                      }`}
                    >
                      <div className="font-medium">{skill.name}</div>
                      {skill.category && (
                        <div
                          className={`text-xs mt-0.5 ${
                            index === highlightedIndex
                              ? "text-gray-200"
                              : "text-gray-500"
                          }`}
                        >
                          {skill.category}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Helper text */}
              <div className="mt-2 text-xs text-gray-500">
                {searchTerm.length === 0 && (
                  <span>💡 Escribe al menos 2 caracteres para buscar</span>
                )}
                {searchTerm.length > 0 && searchTerm.length < 2 && (
                  <span>✍️ Escribe 1 caracter más...</span>
                )}
                {searchTerm.length >= 2 && !searchLoading && filteredSkills.length === 0 && (
                  <span>❌ No se encontraron skills con "{searchTerm}"</span>
                )}
                {searchTerm.length >= 2 && !searchLoading && filteredSkills.length > 0 && (
                  <span>✅ {filteredSkills.length} skill(s) encontrado(s)</span>
                )}
                {selectedSkill && (
                  <span className="text-green-600 font-medium">
                    ✓ Seleccionado: {selectedSkill.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nivel de Dominio - Diseño mejorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Dominio: {selectedLevel}/5
            </label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded"
                >
                  <svg
                    className={`h-10 w-10 transition-all duration-200 ${
                      level <= selectedLevel
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                        : "fill-gray-200 text-gray-200 group-hover:fill-gray-300"
                    } group-hover:scale-110`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Niveles:</span> 1=Básico • 2=Intermedio • 3=Bueno • 4=Avanzado • 5=Experto
              </p>
            </div>
          </div>

          {/* Botón Agregar - Diseño mejorado */}
          <button
            onClick={handleAdd}
            disabled={!selectedSkill}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
          >
            <Plus className="h-5 w-5" />
            Agregar Skill
          </button>
        </div>
      </div>

      {/* My Skills List */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Mis Skills ({mySkills.length})
        </h2>

        {mySkills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aún no has agregado skills
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mySkills.map((us) => (
              <div
                key={us.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-gray-900" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {us.skill?.name || "Unknown"}
                    </p>
                    {us.skill?.category && (
                      <p className="text-xs text-gray-500">{us.skill.category}</p>
                    )}
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${
                            star <= us.level
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(us.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

