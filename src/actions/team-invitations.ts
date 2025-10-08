'use server'

import { revalidatePath } from 'next/cache'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001'

// Tipos
interface SendInvitationParams {
  teamId: string
  email: string
  role: 'LIDER' | 'MIEMBRO'
  byUserId: string
  message?: string
  expiresInDays?: number
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
 * Esta función se ejecuta en el servidor de Next.js y se comunica
 * con tu backend en Express/Render.
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
      expiresInDays = 7
    } = params

    // 🔍 Validaciones básicas del lado del servidor
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email inválido' }
    }

    if (!teamId || !byUserId) {
      return { success: false, error: 'Datos incompletos' }
    }

    console.log(`📤 [Server Action] Enviando invitación desde Next.js Server`)
    console.log(`   - Backend: ${API_BASE_URL}`)
    console.log(`   - Team: ${teamId}`)
    console.log(`   - Email: ${email}`)
    console.log(`   - Role: ${role}`)

    // Llamar al backend
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
        expiresInDays
      })
    })

    // Leer la respuesta
    const data = await response.json()

    if (!response.ok) {
      console.error(`❌ [Server Action] Error del backend:`, data)
      return {
        success: false,
        error: data.message || data.error || 'Error enviando invitación'
      }
    }

    console.log(`✅ [Server Action] Invitación enviada exitosamente`)

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
        acceptUrl: data.acceptUrl || `${process.env.NEXT_PUBLIC_APP_BASE_URL}/join?token=${data.token}`
      }
    }

  } catch (error) {
    console.error('❌ [Server Action] Error en sendTeamInvitation:', error)
    
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
    console.log(`🔄 [Server Action] Reenviando invitación: ${invitationId}`)

    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invites/${invitationId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ byUserId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error reenviando invitación')
    }

    console.log(`✅ [Server Action] Invitación reenviada`)

    return { success: true }
  } catch (error) {
    console.error('❌ [Server Action] Error reenviando invitación:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}
