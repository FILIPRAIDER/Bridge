import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { coreFetch } from "@/lib/core";

const authOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        });
        const parsed = schema.safeParse(creds);
        if (!parsed.success) return null;

        // core-api devuelve { id, name, email, role }
        const user = await coreFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        });

        if (!user) return null;

        // 🔥 Obtener companyId y avatarUrl del usuario
        try {
          const userDetails = await coreFetch(`/users/${user.id}`);
          
          // Obtener companyId para EMPRESARIO
          if (user.role === "EMPRESARIO" && userDetails?.companyId) {
            user.companyId = userDetails.companyId;
            console.log('[NextAuth] ✅ CompanyId obtenido:', user.companyId);
          }
          
          // Obtener avatarUrl para TODOS los usuarios
          if (userDetails?.avatarUrl) {
            user.avatarUrl = userDetails.avatarUrl;
            console.log('[NextAuth] ✅ AvatarUrl obtenido:', user.avatarUrl);
          }
          
          // Obtener company.logoUrl si es EMPRESARIO
          if (user.role === "EMPRESARIO" && userDetails?.company?.logoUrl) {
            user.companyLogoUrl = userDetails.company.logoUrl;
            console.log('[NextAuth] ✅ Company LogoUrl obtenido:', user.companyLogoUrl);
          }
        } catch (error) {
          console.error('[NextAuth] ❌ Error obteniendo detalles del usuario:', error);
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        token.role = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl || null;
        token.companyId = (user as any).companyId || null;
        token.companyLogoUrl = (user as any).companyLogoUrl || null;
      }
      
      // Actualizar avatar cuando se llama update() desde el cliente
      if (trigger === "update" && updateSession?.user?.avatarUrl) {
        token.avatarUrl = updateSession.user.avatarUrl;
      }
      
      // Actualizar companyId cuando se llama update() desde el cliente
      if (trigger === "update" && updateSession?.user?.companyId) {
        token.companyId = updateSession.user.companyId;
      }
      
      // Actualizar companyLogoUrl cuando se llama update() desde el cliente
      if (trigger === "update" && updateSession?.user?.companyLogoUrl) {
        token.companyLogoUrl = updateSession.user.companyLogoUrl;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as any;
        session.user.avatarUrl = token.avatarUrl as any;
        session.user.companyId = token.companyId as any;
        session.user.companyLogoUrl = token.companyLogoUrl as any;
        // @ts-ignore
        session.user.id = token.sub as string; // <-- importante para usar userId luego
      }
      return session;
    },
  },
} satisfies NextAuthOptions;

export default authOptions;
