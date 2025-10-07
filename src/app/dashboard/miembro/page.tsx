"use client";

import { useEffect, useState } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ProfileManager } from "@/components/dashboard/miembro/ProfileManager";
import { TeamInfo } from "@/components/dashboard/miembro/TeamInfo";
import { MySkills } from "@/components/dashboard/miembro/MySkills";
import { Loader } from "@/components/ui";
import { useLoadAvatar } from "@/hooks/useLoadAvatar";
import type { Team, TeamMember, MemberProfile } from "@/types/api";

type TabType = "profile" | "team" | "skills";

export default function MiembroDashboard() {
  const { data: session } = useNextAuthSession();
  useLoadAvatar(); // Cargar avatar automáticamente
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

  const loadData = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const userData = await api.get<any>(`/users/${session.user.id}`);
      setProfile(userData.profile);
      
      const membership = userData?.teamMemberships?.[0];
      if (membership?.teamId) {
        const [teamData, membersData] = await Promise.all([
          api.get<Team>(`/teams/${membership.teamId}`),
          api.get<TeamMember[]>(`/teams/${membership.teamId}/members`),
        ]);
        setTeam(teamData);
        setMembers(membersData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar ocupa todo el alto */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="ESTUDIANTE"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenedor de navbar + contenido */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar solo en el área de contenido */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Mi Dashboard
              </h1>
              <p className="mt-2 text-sm lg:text-base text-gray-600">
                Hola, {session?.user?.name || session?.user?.email}
              </p>
            </div>

            {isLoading ? (
              <Loader message="Cargando tu información..." />
            ) : (
              <>
                {activeTab === "profile" && (
                  <ProfileManager profile={profile} onUpdate={loadData} />
                )}
                {activeTab === "team" && session?.user?.id && (
                  <TeamInfo team={team} members={members} userId={session.user.id} />
                )}
                {activeTab === "skills" && session?.user?.id && (
                  <MySkills userId={session.user.id} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
