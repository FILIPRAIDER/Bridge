"use client";

import { useState, useEffect } from "react";
import { Target, Plus, Trash2, Loader2, Search } from "lucide-react";
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
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(3);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsData, userSkillsData] = await Promise.all([
        api.get<Skill[]>("/skills"),
        api.get<UserSkill[]>(`/users/${userId}/skills`),
      ]);
      setAllSkills(skillsData);
      setMySkills(userSkillsData);
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedSkillId) {
      show({ message: "Selecciona un skill", variant: "warning" });
      return;
    }

    try {
      await api.post(`/users/${userId}/skills`, {
        skillId: selectedSkillId,
        level: selectedLevel,
      });
      show({ message: "Skill agregado", variant: "success" });
      setSelectedSkillId("");
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

  const filteredSkills = allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !mySkills.some((us) => us.skillId === skill.id)
  );

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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Agregar Skill
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="label">Buscar Skill</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Buscar..."
              />
            </div>
          </div>

          <div>
            <label className="label">Seleccionar Skill</label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="input"
            >
              <option value="">Seleccionar...</option>
              {filteredSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                  {skill.category ? ` (${skill.category})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Nivel de Dominio: {selectedLevel}/5
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className="cursor-pointer"
                >
                  <svg
                    className={`h-8 w-8 ${
                      level <= selectedLevel
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    } hover:scale-110 transition-transform`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              1 = Básico | 2 = Intermedio | 3 = Bueno | 4 = Avanzado | 5 = Experto
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedSkillId}
            className="btn-dark inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

