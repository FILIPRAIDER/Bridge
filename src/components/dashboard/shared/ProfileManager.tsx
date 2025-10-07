"use client";

import { useState } from "react";
import { User, Briefcase, Award, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { ProfileEditor } from "../miembro/ProfileEditor";
import { ExperiencesManager } from "../miembro/ExperiencesManager";
import { CertificationsManager } from "../miembro/CertificationsManager";
import { AvatarUploader } from "../miembro/AvatarUploader";
import type { MemberProfile } from "@/types/api";

interface ProfileManagerProps {
  profile: MemberProfile | null;
  onUpdate: () => void;
}

type SubTab = "info" | "experience" | "certifications";

export function ProfileManager({ profile, onUpdate }: ProfileManagerProps) {
  const { data: session } = useSession();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("info");

  const subTabs = [
    { id: "info" as SubTab, label: "Información", icon: User },
    { id: "experience" as SubTab, label: "Experiencia", icon: Briefcase },
    {
      id: "certifications" as SubTab,
      label: "Certificaciones",
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Foto de Perfil
        </h2>
        <AvatarUploader
          currentAvatarUrl={session?.user?.avatarUrl}
          onUploadSuccess={onUpdate}
        />
      </div>

      {/* Sub-navigation */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm lg:text-base ${
                  activeSubTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeSubTab === "info" && (
        <ProfileEditor profile={profile} onUpdate={onUpdate} />
      )}
      {activeSubTab === "experience" && <ExperiencesManager />}
      {activeSubTab === "certifications" && <CertificationsManager />}
    </div>
  );
}
