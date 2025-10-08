export type Role = "EMPRESARIO" | "ESTUDIANTE" | "LIDER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  sector?: string;
  city?: string;
  website?: string;
  about?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  seniority?: string;
  location?: string;
  availability?: number; // Días disponibles (1-60)
  stack?: string;
  sector?: string;
  phone?: string;
  phoneE164?: string; // Formato E.164 (+573001234567)
  phoneCountry?: string; // ISO alpha-2 (CO, US, etc.)
  identityType?: "CC" | "TI" | "CE" | "PEP" | "PASAPORTE" | "NIT";
  documentNumber?: string;
  birthdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  userId: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  issueDate: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  level: number; // 1-5
  skill?: Skill;
  createdAt: string;
  updatedAt: string;
}

export interface ImageKitAuthResponse {
  provider: "imagekit";
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  folder: string;
  urlEndpoint?: string;
  uploadApiEndpoint?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: "LIDER" | "MIEMBRO";
  joinedAt: string;
  user?: User;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: "MIEMBRO";
  status: "PENDING" | "ACCEPTED" | "CANCELED" | "EXPIRED";
  token: string;
  expiresAt: string;
  sentAt: string;
  acceptedAt?: string;
  cancelledAt?: string;
}
