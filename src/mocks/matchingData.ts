import { TeamCandidate, TeamProfile } from '@/types/matching';

export const mockTeamCandidates: TeamCandidate[] = [
  {
    team: {
      id: "team_001",
      name: "DevTeam FullStack",
      city: "Bogotá",
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=DevTeam",
      rating: 4.8,
      totalProjects: 24,
      verified: true,
      availability: "AVAILABLE",
      profileUrl: "/teams/team_001/profile"
    },
    matchPercentage: 85,
    coverage: 0.625,
    matchedSkills: [
      { name: "React", required: 4, teamLevel: 5 },
      { name: "Node.js", required: 4, teamLevel: 5 },
      { name: "PostgreSQL", required: 3, teamLevel: 4 },
      { name: "TypeScript", required: 4, teamLevel: 5 },
      { name: "Next.js", required: 3, teamLevel: 4 }
    ],
    missingSkills: ["Stripe", "PayPal"]
  },
  {
    team: {
      id: "team_002",
      name: "UI/UX Masters",
      city: "Medellín",
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=UIUX",
      rating: 4.6,
      totalProjects: 18,
      verified: true,
      availability: "BUSY",
      profileUrl: "/teams/team_002/profile"
    },
    matchPercentage: 72,
    coverage: 0.55,
    matchedSkills: [
      { name: "Figma", required: 4, teamLevel: 5 },
      { name: "React", required: 4, teamLevel: 4 },
      { name: "CSS", required: 3, teamLevel: 5 }
    ],
    missingSkills: ["Node.js", "PostgreSQL", "Stripe"]
  },
  {
    team: {
      id: "team_003",
      name: "Mobile Experts",
      city: "Cali",
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=Mobile",
      rating: 4.9,
      totalProjects: 31,
      verified: true,
      availability: "AVAILABLE",
      profileUrl: "/teams/team_003/profile"
    },
    matchPercentage: 68,
    coverage: 0.50,
    matchedSkills: [
      { name: "React Native", required: 4, teamLevel: 5 },
      { name: "Node.js", required: 4, teamLevel: 4 },
      { name: "Firebase", required: 3, teamLevel: 5 }
    ],
    missingSkills: ["PostgreSQL", "Stripe", "PayPal"]
  }
];

export const mockTeamProfiles: Record<string, TeamProfile> = {
  "team_001": {
    id: "team_001",
    name: "DevTeam FullStack",
    description: "Equipo especializado en desarrollo full-stack con React, Node.js y PostgreSQL. Más de 5 años de experiencia construyendo aplicaciones web escalables y robustas.",
    city: "Bogotá",
    country: "Colombia",
    profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=DevTeam",
    website: "https://devteam.example.com",
    email: "contact@devteam.com",
    phone: "+57 300 123 4567",
    verified: true,
    rating: 4.8,
    totalProjects: 24,
    completedProjects: 22,
    skills: [
      { id: "skill_001", name: "React", level: 5, yearsExperience: 6 },
      { id: "skill_002", name: "Node.js", level: 5, yearsExperience: 6 },
      { id: "skill_003", name: "PostgreSQL", level: 4, yearsExperience: 5 },
      { id: "skill_004", name: "TypeScript", level: 5, yearsExperience: 4 },
      { id: "skill_005", name: "Next.js", level: 4, yearsExperience: 3 },
      { id: "skill_006", name: "Docker", level: 4, yearsExperience: 4 }
    ],
    members: [
      {
        id: "member_001",
        name: "Juan Pérez",
        role: "Full-Stack Lead",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
        skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
        yearsExperience: 6
      },
      {
        id: "member_002",
        name: "María González",
        role: "Frontend Developer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
        skills: ["React", "TypeScript", "Next.js", "CSS"],
        yearsExperience: 4
      },
      {
        id: "member_003",
        name: "Carlos Rodríguez",
        role: "Backend Developer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
        skills: ["Node.js", "PostgreSQL", "Docker", "AWS"],
        yearsExperience: 5
      }
    ],
    portfolio: [
      {
        id: "project_001",
        title: "E-commerce de Moda",
        description: "Tienda online completa con sistema de pagos, gestión de inventario y panel administrativo.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
        technologies: ["React", "Next.js", "Stripe", "PostgreSQL"],
        completedAt: "2024-11-15"
      },
      {
        id: "project_002",
        title: "Plataforma de Educación Online",
        description: "Sistema de gestión de cursos con video streaming y sistema de pagos recurrentes.",
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800",
        technologies: ["React", "Node.js", "MongoDB", "AWS"],
        completedAt: "2024-08-20"
      },
      {
        id: "project_003",
        title: "Dashboard Analytics",
        description: "Panel de análisis de datos en tiempo real con visualizaciones interactivas.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        technologies: ["React", "TypeScript", "D3.js", "WebSockets"],
        completedAt: "2024-05-10"
      }
    ],
    availability: {
      status: "AVAILABLE",
      availableFrom: "2025-10-15",
      hoursPerWeek: 40
    },
    budgetRange: {
      min: 10000000,
      max: 50000000,
      currency: "COP"
    }
  },
  "team_002": {
    id: "team_002",
    name: "UI/UX Masters",
    description: "Expertos en diseño de experiencia de usuario y interfaces modernas. Convertimos ideas en productos digitales hermosos y funcionales.",
    city: "Medellín",
    country: "Colombia",
    profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=UIUX",
    website: "https://uiuxmasters.example.com",
    email: "hello@uiuxmasters.com",
    phone: "+57 311 987 6543",
    verified: true,
    rating: 4.6,
    totalProjects: 18,
    completedProjects: 17,
    skills: [
      { id: "skill_010", name: "Figma", level: 5, yearsExperience: 5 },
      { id: "skill_011", name: "Adobe XD", level: 4, yearsExperience: 4 },
      { id: "skill_012", name: "React", level: 4, yearsExperience: 3 },
      { id: "skill_013", name: "CSS/SCSS", level: 5, yearsExperience: 6 },
      { id: "skill_014", name: "Tailwind", level: 4, yearsExperience: 2 }
    ],
    members: [
      {
        id: "member_010",
        name: "Laura Martínez",
        role: "Lead Designer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
        skills: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
        yearsExperience: 5
      },
      {
        id: "member_011",
        name: "Diego Sánchez",
        role: "UX Researcher",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
        skills: ["User Research", "Usability Testing", "Analytics"],
        yearsExperience: 4
      }
    ],
    portfolio: [
      {
        id: "project_010",
        title: "Redesign de App Bancaria",
        description: "Mejora completa de UX/UI para aplicación móvil bancaria, aumentando satisfacción en 45%.",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
        technologies: ["Figma", "User Research", "Prototyping"],
        completedAt: "2024-09-30"
      },
      {
        id: "project_011",
        title: "Landing Page SaaS",
        description: "Diseño moderno y conversión optimizada para startup tech.",
        image: "https://images.unsplash.com/photo-1557853197-aefb550b6fdc?w=800",
        technologies: ["Figma", "React", "Tailwind CSS"],
        completedAt: "2024-07-15"
      }
    ],
    availability: {
      status: "BUSY",
      availableFrom: "2025-11-01",
      hoursPerWeek: 30
    },
    budgetRange: {
      min: 8000000,
      max: 30000000,
      currency: "COP"
    }
  },
  "team_003": {
    id: "team_003",
    name: "Mobile Experts",
    description: "Especialistas en desarrollo de aplicaciones móviles nativas y multiplataforma. React Native, Flutter y tecnologías móviles de última generación.",
    city: "Cali",
    country: "Colombia",
    profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=Mobile",
    website: "https://mobileexperts.example.com",
    email: "info@mobileexperts.com",
    phone: "+57 320 456 7890",
    verified: true,
    rating: 4.9,
    totalProjects: 31,
    completedProjects: 30,
    skills: [
      { id: "skill_020", name: "React Native", level: 5, yearsExperience: 5 },
      { id: "skill_021", name: "Flutter", level: 4, yearsExperience: 3 },
      { id: "skill_022", name: "Node.js", level: 4, yearsExperience: 5 },
      { id: "skill_023", name: "Firebase", level: 5, yearsExperience: 4 },
      { id: "skill_024", name: "Swift", level: 3, yearsExperience: 3 }
    ],
    members: [
      {
        id: "member_020",
        name: "Andrés López",
        role: "Mobile Lead",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andres",
        skills: ["React Native", "Flutter", "iOS", "Android"],
        yearsExperience: 6
      },
      {
        id: "member_021",
        name: "Camila Torres",
        role: "Mobile Developer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Camila",
        skills: ["React Native", "Firebase", "Redux"],
        yearsExperience: 4
      }
    ],
    portfolio: [
      {
        id: "project_020",
        title: "App de Delivery",
        description: "Aplicación de entrega de comida con tracking en tiempo real y pagos integrados.",
        image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800",
        technologies: ["React Native", "Firebase", "Google Maps API"],
        completedAt: "2024-10-01"
      },
      {
        id: "project_021",
        title: "Fitness Tracker",
        description: "App de seguimiento de ejercicio con integración a wearables.",
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
        technologies: ["Flutter", "Firebase", "HealthKit"],
        completedAt: "2024-06-20"
      }
    ],
    availability: {
      status: "AVAILABLE",
      availableFrom: "2025-10-20",
      hoursPerWeek: 40
    },
    budgetRange: {
      min: 12000000,
      max: 60000000,
      currency: "COP"
    }
  }
};
