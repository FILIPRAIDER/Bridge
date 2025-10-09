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

        return user ?? null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        token.role = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl || null;
      }
      
      // Actualizar avatar cuando se llama update() desde el cliente
      if (trigger === "update" && updateSession?.user?.avatarUrl) {
        token.avatarUrl = updateSession.user.avatarUrl;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as any;
        session.user.avatarUrl = token.avatarUrl as any;
        // @ts-ignore
        session.user.id = token.sub as string; // <-- importante para usar userId luego
      }
      return session;
    },
  },
} satisfies NextAuthOptions;

export default authOptions;
