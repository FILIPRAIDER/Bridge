"use client";

import { useEffect, useState } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TeamOverview } from "@/components/dashboard/lider/TeamOverview";
import { InviteMembers } from "@/components/dashboard/lider/InviteMembers";
import { ManageSkills } from "@/components/dashboard/lider/ManageSkills";
import { ViewInvites } from "@/components/dashboard/lider/ViewInvites";
import { TeamMembersManager } from "@/components/dashboard/lider/TeamMembersManager";
import { ProfileManager } from "@/components/dashboard/miembro/ProfileManager";
import { Loader } from "@/components/ui";
import { useLoadAvatar } from "@/hooks/useLoadAvatar";
import type { Team, TeamMember, MemberProfile } from "@/types/api";

// 🔥 Tabs optimizadas - Sin redundancias
type TabType = "overview" | "profile" | "manage-members" | "team-skills" | "invite" | "invites";

export default function LiderDashboard() {
  const { data: session } = useNextAuthSession();
  useLoadAvatar(); // Cargar avatar automáticamente
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeamId();
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const fetchTeamId = async () => {
    try {
      const userData = await api.get<any>(`/users/${session?.user?.id}`);
      const membership = userData?.teamMemberships?.find((m: any) => m.role === "LIDER");
      
      if (membership?.teamId) {
        setTeamId(membership.teamId);
      } else {
        console.warn("⚠️ User is LIDER but has no team");
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  };

  useEffect(() => {
    if (teamId && session?.user?.id) {
      loadTeamData();
    }
  }, [teamId, session?.user?.id]);

  const loadTeamData = async () => {
    try {
      setIsLoading(true);
      const [teamData, membersData] = await Promise.all([
        api.get<Team>(`/teams/${teamId}`),
        api.get<TeamMember[]>(`/teams/${teamId}/members`),
      ]);
      setTeam(teamData);
      setMembers(membersData);
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const userData = await api.get<any>(`/users/${session.user.id}`);
      
      // 🔍 DEBUG: Ver estructura completa de datos
      console.log('[LiderDashboard] 📊 userData completo:', userData);
      console.log('[LiderDashboard] 📋 userData.profile:', userData.profile);
      
      setProfile(userData.profile || userData);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar ocupa todo el alto */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="LIDER"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hasTeam={true} // Líderes siempre tienen equipo
      />

      {/* Contenedor de navbar + contenido */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar solo en el área de contenido */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Dashboard del Líder
              </h1>
              <p className="mt-2 text-sm lg:text-base text-gray-600">
                Gestiona tu equipo: {team?.name || "Sin nombre"}
              </p>
            </div>

            {isLoading ? (
              <Loader message="Cargando información del equipo..." />
            ) : (
              <>
                {activeTab === "overview" && (
                  <TeamOverview team={team} members={members} onRefresh={loadTeamData} />
                )}
                {activeTab === "profile" && (
                  <ProfileManager profile={profile} onUpdate={loadProfile} />
                )}
                {activeTab === "manage-members" && teamId && session?.user?.id && (
                  <TeamMembersManager teamId={teamId} currentUserId={session.user.id} />
                )}
                {activeTab === "invite" && teamId && (
                  <InviteMembers 
                    teamId={teamId} 
                    onInviteSent={loadTeamData}
                    teamName={team?.name}
                  />
                )}
                {activeTab === "team-skills" && teamId && (
                  <ManageSkills teamId={teamId} members={members} />
                )}
                {activeTab === "invites" && teamId && <ViewInvites teamId={teamId} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
