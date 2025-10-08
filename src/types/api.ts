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

export interface Sector {
  id: string;
  name: string; // slug: "technology", "finance", etc.
  nameEs: string; // "Tecnología", "Finanzas", etc.
  nameEn: string; // "Technology", "Finance", etc.
  description?: string;
  icon?: string; // emoji: "💻", "💰", etc.
  order: number;
  active: boolean;
}

export interface Country {
  code: string; // ISO alpha-2: "CO", "US", "MX", etc.
  name: string;
  dialCode: string;
  flag: string; // emoji
}

export interface CitiesResponse {
  ok: boolean;
  countryCode: string;
  cities: string[];
  total: number;
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
  
  // UBICACIÓN (NUEVO)
  country?: string; // Código ISO: "CO", "US", "MX", etc.
  city?: string; // Ciudad desde lista predefinida
  address?: string; // Dirección completa (opcional)
  location?: string; // ⚠️ DEPRECATED (mantener temporalmente)
  
  availability?: number; // Días disponibles (1-60)
  stack?: string;
  
  // SECTOR (ACTUALIZADO)
  sectorId?: string; // FK a tabla Sector
  sector?: Sector; // Relación poblada
  
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
