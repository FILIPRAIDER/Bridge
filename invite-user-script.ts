/**
 * Script temporal para invitar usuario mientras se arregla el backend
 * 
 * Usuario: juanguillermogarcessantero@gmail.com
 * Equipo: TransDigitalCoop
 * 
 * Ejecutar en el backend con: ts-node invite-user-script.ts
 * o compilar y ejecutar: tsc invite-user-script.ts && node invite-user-script.js
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function inviteUser(): Promise<void> {
  console.log("🚀 Iniciando script de invitación...\n");

  try {
    // 1. Buscar el equipo "TransDigitalCoop"
    console.log("📍 [1/6] Buscando equipo TransDigitalCoop...");
    const team = await prisma.team.findFirst({
      where: {
        name: {
          contains: "TransDigitalCoop",
          mode: "insensitive"
        }
      }
    });

    if (!team) {
      console.error("❌ Equipo 'TransDigitalCoop' no encontrado");
      console.log("\n💡 Equipos disponibles:");
      const teams = await prisma.team.findMany({
        select: { id: true, name: true }
      });
      teams.forEach(t => console.log(`   - ${t.name} (${t.id})`));
      process.exit(1);
    }

    console.log(`✅ Equipo encontrado: ${team.name} (${team.id})\n`);

    // 2. Buscar el líder del equipo (quien envía la invitación)
    console.log("📍 [2/6] Buscando líder del equipo...");
    const leader = await prisma.teamMember.findFirst({
      where: {
        teamId: team.id,
        role: "LIDER"
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!leader) {
      console.error("❌ No se encontró un líder para este equipo");
      process.exit(1);
    }

    console.log(`✅ Líder: ${leader.user.name || leader.user.email} (${leader.user.id})\n`);

    // 3. Verificar si el usuario ya existe
    console.log("📍 [3/6] Verificando si el usuario existe...");
    const email = "juanguillermogarcessantero@gmail.com";
    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (invitedUser) {
      console.log(`✅ Usuario ya existe: ${invitedUser.name || invitedUser.email} (${invitedUser.id})`);
      
      // Verificar si ya es miembro
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: invitedUser.id
          }
        }
      });

      if (existingMember) {
        console.log("⚠️  Este usuario YA ES MIEMBRO del equipo");
        console.log(`   Rol: ${existingMember.role}`);
        console.log(`   Fecha de ingreso: ${existingMember.joinedAt}`);
        process.exit(0);
      }
    } else {
      console.log("ℹ️  Usuario no existe en la plataforma (se creará al aceptar la invitación)\n");
    }

    // 4. Verificar invitaciones pendientes
    console.log("📍 [4/6] Verificando invitaciones pendientes...");
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        teamId: team.id,
        email: email.toLowerCase(),
        status: "PENDING"
      }
    });

    if (existingInvite) {
      console.log("⚠️  Ya existe una invitación PENDING para este usuario");
      console.log(`   ID: ${existingInvite.id}`);
      console.log(`   Token: ${existingInvite.token}`);
      console.log(`   Creada: ${existingInvite.createdAt}`);
      console.log(`   Expira: ${existingInvite.expiresAt}`);
      
      const acceptUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/join?token=${existingInvite.token}`;
      console.log(`\n🔗 URL de aceptación: ${acceptUrl}`);
      
      process.exit(0);
    }

    console.log("✅ No hay invitaciones pendientes\n");

    // 5. Crear la invitación
    console.log("📍 [5/6] Creando invitación...");
    
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

    console.log(`📅 Fecha actual: ${now.toISOString()}`);
    console.log(`📅 Fecha de expiración: ${expiresAt.toISOString()}`);
    console.log(`🔑 Token generado: ${token.substring(0, 20)}...`);

    const invitation = await prisma.teamInvite.create({
      data: {
        teamId: team.id,
        email: email.toLowerCase(),
        role: "MIEMBRO",
        token,
        status: "PENDING",
        invitedBy: leader.userId,
        message: "Invitación creada mediante script temporal",
        expiresAt
      }
    });

    console.log(`✅ Invitación creada exitosamente!`);
    console.log(`   ID: ${invitation.id}`);
    console.log(`   Email: ${invitation.email}`);
    console.log(`   Rol: ${invitation.role}`);
    console.log(`   Estado: ${invitation.status}`);
    console.log(`   Expira: ${invitation.expiresAt}\n`);

    // 6. Generar URL de aceptación
    console.log("📍 [6/6] Generando URL de aceptación...");
    const baseUrl = process.env.APP_BASE_URL || 'https://cresia-app.vercel.app';
    const acceptUrl = `${baseUrl}/join?token=${token}`;

    console.log("\n" + "=".repeat(70));
    console.log("🎉 ¡INVITACIÓN CREADA EXITOSAMENTE!");
    console.log("=".repeat(70));
    console.log(`\n📧 Email invitado: ${email}`);
    console.log(`👥 Equipo: ${team.name}`);
    console.log(`👤 Invitado por: ${leader.user.name || leader.user.email}`);
    console.log(`⏰ Expira: ${expiresAt.toLocaleDateString()} a las ${expiresAt.toLocaleTimeString()}`);
    console.log(`\n🔗 URL de aceptación:\n${acceptUrl}`);
    console.log("\n" + "=".repeat(70));
    console.log("\n💡 IMPORTANTE: Envía esta URL al usuario invitado para que pueda unirse al equipo.\n");

  } catch (error) {
    console.error("\n❌ Error ejecutando el script:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
inviteUser()
  .catch(error => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
