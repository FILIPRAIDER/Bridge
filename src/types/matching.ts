// Types for Team Matching and Profile functionality

export interface TeamCandidate {
  team: {
    id: string;
    name: string;
    city: string;
    profileImage?: string;
    rating: number;
    totalProjects: number;
    verified: boolean;
    availability: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
    profileUrl: string;
  };
  matchPercentage: number;
  coverage: number;
  matchedSkills: Array<{
    name: string;
    required: number;
    teamLevel: number;
  }>;
  missingSkills: string[];
}

export interface TeamProfile {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  profileImage?: string;
  website?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  rating: number;
  totalProjects: number;
  completedProjects: number;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    yearsExperience: number;
  }>;
  members: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
    skills: string[];
    yearsExperience: number;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    image?: string;
    technologies: string[];
    completedAt: string;
  }>;
  availability: {
    status: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
    availableFrom: string;
    hoursPerWeek: number;
  };
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface ConnectionRequest {
  projectId: string;
  companyId: string;
  message: string;
}

export interface ConnectionResponse {
  connectionId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  team: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    title: string;
  };
  createdAt: string;
  message: string;
}
