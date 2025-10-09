import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "EMPRESARIO" | "ESTUDIANTE" | "LIDER" | "ADMIN";
    avatarUrl?: string | null;
    companyId?: string | null;
    companyLogoUrl?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "EMPRESARIO" | "ESTUDIANTE" | "LIDER" | "ADMIN";
      avatarUrl?: string | null;
      companyId?: string | null;
      companyLogoUrl?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string; // next-auth usa 'sub' para el id
    role?: "EMPRESARIO" | "ESTUDIANTE" | "LIDER" | "ADMIN";
    avatarUrl?: string | null;
    companyId?: string | null;
    companyLogoUrl?: string | null;
  }
}
