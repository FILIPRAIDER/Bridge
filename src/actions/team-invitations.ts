'use server'

import { revalidatePath } from 'next/cache'
import { sendInvitationEmail } from './send-invitation-email'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001'
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://cresia-app.vercel.app'

// Tipos
interface SendInvitationParams {
  teamId: string
  email: string
  role: 'LIDER' | 'MIEMBRO'
  byUserId: string
  message?: string
  expiresInDays?: number
  inviterName?: string // 🔥 NUEVO: Nombre del invitador desde sesión
  teamName?: string    // 🔥 NUEVO: Nombre del equipo si lo tenemos
}

interface InvitationResult {
  success: boolean
  error?: string
  data?: {
    id: string
    email: string
    token: string
    expiresAt: string
    acceptUrl: string
  }
}

/**
 * 📧 Server Action: Enviar Invitación a Equipo
 * 
 * NUEVO FLUJO:
 * 1. Backend crea el registro de invitación (token, expiresAt, etc.)
 * 2. Frontend envía el email con Resend (control total del template y URL)
 */
export async function sendTeamInvitation(
  params: SendInvitationParams
): Promise<InvitationResult> {
  try {
    const {
      teamId,
      email,
      role = 'MIEMBRO',
      byUserId,
      message,
      expiresInDays = 7,
      inviterName, // 🔥 NUEVO
      teamName     // 🔥 NUEVO
    } = params

    // 🔍 Validaciones básicas del lado del servidor
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email inválido' }
    }

    if (!teamId || !byUserId) {
      return { success: false, error: 'Datos incompletos' }
    }

    console.log(`📤 [sendTeamInvitation] Iniciando proceso de invitación`)
    console.log(`   - Backend: ${API_BASE_URL}`)
    console.log(`   - Team: ${teamId}`)
    console.log(`   - Email: ${email}`)
    console.log(`   - Role: ${role}`)

    // 1️⃣ Llamar al backend SOLO para crear el registro (NO enviar email)
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        role,
        byUserId,
        message: message || undefined,
        expiresInDays,
        sendEmail: false // 🔥 IMPORTANTE: No enviar email desde backend
      })
    })

    // Leer la respuesta
    const data = await response.json()

    if (!response.ok) {
      console.error(`❌ [sendTeamInvitation] Error del backend:`, data)
      return {
        success: false,
        error: data.message || data.error || 'Error creando invitación'
      }
    }

    console.log(`✅ [sendTeamInvitation] Invitación creada en backend`)
    console.log(`   - ID: ${data.id}`)
    console.log(`   - Token: ${data.token?.substring(0, 10)}...`)

    // 2️⃣ Enviar email desde nuestro server action
    console.log(`📧 [sendTeamInvitation] Enviando email desde frontend...`)
    const emailResult = await sendInvitationEmail({
      email: data.email,
      token: data.token,
      teamId,
      invitedByUserId: byUserId,
      inviterName, // 🔥 Pasar nombre del invitador
      teamName     // 🔥 Pasar nombre del equipo
    })

    if (!emailResult.success) {
      console.error(`⚠️ [sendTeamInvitation] Email no enviado pero invitación creada:`, emailResult.error)
      // No fallar la operación completa, la invitación ya está creada
      // El usuario puede reenviar el email después
    } else {
      console.log(`✅ [sendTeamInvitation] Email enviado exitosamente`)
    }

    // Revalidar la página de invitaciones para mostrar la nueva
    revalidatePath(`/dashboard/lider`)
    revalidatePath(`/teams/${teamId}/invites`)

    return {
      success: true,
      data: {
        id: data.id,
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt,
        acceptUrl: `${FRONTEND_URL}/join?token=${data.token}`
      }
    }

  } catch (error) {
    console.error('❌ [sendTeamInvitation] Error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión con el servidor'
    }
  }
}

/**
 * 📋 Server Action: Obtener invitaciones de un equipo
 */
export async function getTeamInvitations(teamId: string) {
  try {
    console.log(`📥 [Server Action] Obteniendo invitaciones del team: ${teamId}`)

    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // No cachear para obtener datos frescos
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error obteniendo invitaciones')
    }

    const invitations = await response.json()

    console.log(`✅ [Server Action] ${invitations.length} invitaciones obtenidas`)

    return { success: true, data: invitations }
  } catch (error) {
    console.error('❌ [Server Action] Error obteniendo invitaciones:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * ❌ Server Action: Cancelar invitación
 */
export async function cancelInvitation(invitationId: string, teamId: string, byUserId: string) {
  try {
    console.log(`🗑️ [Server Action] Cancelando invitación: ${invitationId}`)

    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invites/${invitationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ byUserId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error cancelando invitación')
    }

    console.log(`✅ [Server Action] Invitación cancelada`)

    // Revalidar para actualizar la lista
    revalidatePath(`/dashboard/lider`)
    revalidatePath(`/teams/${teamId}/invites`)

    return { success: true }
  } catch (error) {
    console.error('❌ [Server Action] Error cancelando invitación:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * 🔄 Server Action: Reenviar invitación
 */
export async function resendInvitation(invitationId: string, teamId: string, byUserId: string) {
  try {
    console.log(`🔄 [resendInvitation] Reenviando invitación: ${invitationId}`)

    // 1️⃣ Obtener los datos de la invitación desde el backend
    const invitationResponse = await fetch(`${API_BASE_URL}/teams/${teamId}/invites/${invitationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!invitationResponse.ok) {
      throw new Error('No se encontró la invitación')
    }

    const invitation = await invitationResponse.json()
    console.log(`   - Email: ${invitation.email}`)
    console.log(`   - Token: ${invitation.token?.substring(0, 10)}...`)

    // 2️⃣ Enviar email desde nuestro server action
    const emailResult = await sendInvitationEmail({
      email: invitation.email,
      token: invitation.token,
      teamId,
      invitedByUserId: byUserId
    })

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Error enviando email')
    }

    console.log(`✅ [resendInvitation] Email reenviado exitosamente`)

    return { success: true }
  } catch (error) {
    console.error('❌ [resendInvitation] Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}
