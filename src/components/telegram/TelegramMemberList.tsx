// src/components/telegram/TelegramMemberList.tsx

"use client";

import { useState } from "react";
import { Check, Mail, CheckCircle2, UserCheck } from "lucide-react";
import type { TelegramMember } from "@/types/telegram";

interface TelegramMemberListProps {
  /**
   * Lista de miembros del área
   */
  members: TelegramMember[];
  
  /**
   * IDs de miembros seleccionados
   */
  selectedIds: string[];
  
  /**
   * Callback cuando cambia la selección
   */
  onSelectionChange: (ids: string[]) => void;
  
  /**
   * Permitir selección múltiple
   */
  multiSelect?: boolean;
  
  /**
   * Mostrar miembros ya unidos
   */
  showJoined?: boolean;
}

/**
 * Lista de miembros con checkbox para invitar a Telegram
 */
export function TelegramMemberList({
  members,
  selectedIds,
  onSelectionChange,
  multiSelect = true,
  showJoined = true,
}: TelegramMemberListProps) {
  const [selectAll, setSelectAll] = useState(false);

  // Filtrar miembros según showJoined
  const filteredMembers = showJoined 
    ? members 
    : members.filter((m) => !m.joinedTelegram);

  const toggleMember = (id: string) => {
    if (multiSelect) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((i) => i !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    } else {
      onSelectionChange([id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      onSelectionChange([]);
    } else {
      // Seleccionar todos los que NO se han unido aún
      const notJoinedIds = filteredMembers
        .filter((m) => !m.joinedTelegram)
        .map((m) => m.id);
      onSelectionChange(notJoinedIds);
    }
    setSelectAll(!selectAll);
  };

  if (filteredMembers.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-8 text-center">
        <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500 dark:text-gray-400">
          {showJoined 
            ? "No hay miembros en esta área"
            : "Todos los miembros ya se unieron a Telegram"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Seleccionar todos */}
      {multiSelect && filteredMembers.some((m) => !m.joinedTelegram) && (
        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Seleccionar todos
          </span>
          <button
            onClick={toggleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {selectAll ? "Deseleccionar" : "Seleccionar"}
          </button>
        </div>
      )}

      {/* Lista de miembros */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredMembers.map((member) => {
          const isSelected = selectedIds.includes(member.id);
          const isJoined = member.joinedTelegram;
          const isInvited = member.invited && !isJoined;

          return (
            <button
              key={member.id}
              onClick={() => !isJoined && toggleMember(member.id)}
              disabled={isJoined}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                isJoined
                  ? "bg-green-50 dark:bg-green-900/20 cursor-not-allowed opacity-75"
                  : isSelected
                  ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {/* Checkbox o Check */}
              <div className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center ${
                isJoined
                  ? "bg-green-500 border-green-500"
                  : isSelected
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}>
                {(isSelected || isJoined) && <Check className="h-3 w-3 text-white" />}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {member.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {member.email}
                </p>
                {member.telegramUsername && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    @{member.telegramUsername}
                  </p>
                )}
              </div>

              {/* Estado */}
              <div className="flex-shrink-0">
                {isJoined && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Unido
                  </span>
                )}
                {isInvited && (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Mail className="h-3 w-3" />
                    Invitado
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info de selección */}
      {multiSelect && selectedIds.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
          {selectedIds.length} {selectedIds.length === 1 ? "miembro seleccionado" : "miembros seleccionados"}
        </p>
      )}
    </div>
  );
}
