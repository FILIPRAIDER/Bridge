"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/store/session";
import { useToast } from "@/components/ui/toast";
import { Loader2, Plus, Trash2, Star, Search } from "lucide-react";
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
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [search, setSearch] = useState("");
  const { user } = useSession();
  const { show } = useToast();

  // Cargar skills del usuario y catálogo completo
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        const [userSkillsData, allSkillsData] = await Promise.all([
          api.get<UserSkill[]>(`/users/${user.id}/skills`),
          api.get<Skill[]>("/skills"),
        ]);
        
        // 🔥 FIX: Asegurarnos que sean arrays
        setUserSkills(Array.isArray(userSkillsData) ? userSkillsData : []);
        setAllSkills(Array.isArray(allSkillsData) ? allSkillsData : []);
      } catch (e) {
        console.error("Error cargando skills:", e);
        // En caso de error, asegurar que sean arrays vacíos
        setUserSkills([]);
        setAllSkills([]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // 🔥 FIX: Verificar que allSkills sea array antes de filtrar
  const filteredSkills = Array.isArray(allSkills) ? allSkills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
    const notAlreadyAdded = !userSkills.some((us) => us.skillId === skill.id);
    return matchesSearch && notAlreadyAdded;
  }) : [];

  const handleAddSkill = async () => {
    if (!user?.id || !selectedSkillId) return;

    setLoading(true);
    try {
      const newUserSkill = await api.post<UserSkill>(
        `/users/${user.id}/skills`,
        {
          skillId: selectedSkillId,
          level: selectedLevel,
        }
      );

      // Enriquecer con datos del skill
      const skill = allSkills.find((s) => s.id === selectedSkillId);
      setUserSkills((prev) => [...prev, { ...newUserSkill, skill }]);

      show({
        variant: "success",
        title: "Skill agregado",
        message: "",
      });

      setSelectedSkillId("");
      setSelectedLevel(3);
      setShowAdd(false);
      setSearch("");
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

  const handleDeleteSkill = async (userSkillId: string) => {
    if (!user?.id) return;
    if (!confirm("¿Eliminar este skill?")) return;

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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Tus habilidades</h1>
          <p className="text-gray-600">
            Selecciona tus skills y define tu nivel de dominio (opcional).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-outline flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {/* Formulario de agregar skill */}
      {showAdd && (
        <div className="card p-6 space-y-4 mb-6">
          <h3 className="font-semibold text-lg">Agregar skill</h3>

          <div>
            <label className="label">Buscar skill</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
                placeholder="ej. React, Python, Figma..."
              />
            </div>

            {search && filteredSkills.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => {
                      setSelectedSkillId(skill.id);
                      setSearch(skill.name);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                      selectedSkillId === skill.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="font-medium">{skill.name}</span>
                    {skill.category && (
                      <span className="text-sm text-gray-500 ml-2">
                        • {skill.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {search && filteredSkills.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No se encontraron skills. Contacta al administrador para agregarlo.
              </p>
            )}
          </div>

          {selectedSkillId && (
            <div>
              <label className="label">Nivel (1-5)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    className={`p-3 rounded-xl border-2 transition ${
                      selectedLevel >= level
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        selectedLevel >= level
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                1 = Básico, 3 = Intermedio, 5 = Experto
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={!selectedSkillId || loading}
              className="btn btn-dark flex-1 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Agregando...
                </>
              ) : (
                "Agregar skill"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setSelectedSkillId("");
                setSearch("");
              }}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
                onClick={() => handleDeleteSkill(userSkill.id)}
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
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={userSkills.length === 0}
          className="btn btn-dark flex-1 disabled:opacity-60"
        >
          Finalizar registro
        </button>
        <button type="button" onClick={onSkip} className="btn btn-outline">
          Completar más tarde
        </button>
      </div>
    </div>
  );
}
