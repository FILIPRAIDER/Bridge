"use client";

import { useState } from "react";
import { User, Briefcase, Award } from "lucide-react";
import { ProfileCard } from "./ProfileCard";
import { ProfileEditor } from "./ProfileEditor";
import { ExperiencesManager } from "./ExperiencesManager";
import { CertificationsManager } from "./CertificationsManager";
import type { MemberProfile } from "@/types/api";

interface ProfileManagerProps {
  profile: MemberProfile | null;
  onUpdate: () => void;
}

type SubTab = "info" | "experience" | "certifications";

export function ProfileManager({ profile, onUpdate }: ProfileManagerProps) {
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
      {/* Profile Card Preview with integrated avatar uploader */}
      <ProfileCard profile={profile} onUpdate={onUpdate} />

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

