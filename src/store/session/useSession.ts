import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/api";

interface SessionState {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
  companyId?: string;
  teamId?: string;

  setUser: (user: SessionState["user"]) => void;
  setCompanyId: (id: string) => void;
  setTeamId: (id: string) => void;
  clear: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      companyId: undefined,
      teamId: undefined,

      setUser: (user) => set({ user }),
      setCompanyId: (id) => set({ companyId: id }),
      setTeamId: (id) => set({ teamId: id }),
      clear: () => set({ user: null, companyId: undefined, teamId: undefined }),
    }),
    { name: "bridge-session" }
  )
);
