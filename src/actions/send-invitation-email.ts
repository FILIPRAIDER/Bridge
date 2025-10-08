'use server'

import { Resend } from 'resend'

// --- helpers ---
const norm = (url?: string) => (url ?? '').replace(/\/+$/, '');
const safeName = (v?: string | null) => (v && v.trim()) ? v.trim() : undefined;
const pickName = (o: any) =>
  safeName(o?.name) ||
  safeName(o?.fullName) ||
  safeName(o?.displayName) ||
  safeName(o?.username) ||
  (typeof o?.email === 'string' ? o.email.split('@')[0] : undefined);

// Validar que la API key esté presente
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY no está configurada')
}

const resend = new Resend(process.env.RESEND_API_KEY)
const FRONTEND_URL = norm(process.env.NEXT_PUBLIC_APP_BASE_URL) || 'https://cresia-app.vercel.app'
const API_BASE_URL = norm(process.env.NEXT_PUBLIC_API_BASE_URL) || 'http://localhost:4001'

interface SendInvitationEmailParams {
  email: string
  token: string
  teamId: string
  invitedByUserId: string
  inviterName?: string
  teamName?: string
}

/**
 * 📧 Server Action: Enviar Email de Invitación
 * 
 * Este server action se encarga SOLO de enviar el email.
 * El backend solo crea el registro de invitación.
 */
export async function sendInvitationEmail(params: SendInvitationEmailParams) {
  try {
    const { email, token, teamId, invitedByUserId, inviterName: inviterNameParam, teamName: teamNameParam } = params

    let finalInviterName = safeName(inviterNameParam)
    let finalTeamName = safeName(teamNameParam)

    // Obtener nombre del equipo si falta
    if (!finalTeamName) {
      try {
        const r = await fetch(`${API_BASE_URL}/teams/${teamId}`, { cache: 'no-store' })
        if (r.ok) {
          const team = await r.json()
          finalTeamName = safeName(team?.name) || 'Equipo'
        }
      } catch (e) {
        console.warn('⚠️ No se pudo obtener info del equipo del backend:', e)
      }
    }

    // Obtener nombre del invitador si falta
    if (!finalInviterName) {
      try {
        const r = await fetch(`${API_BASE_URL}/users/${invitedByUserId}`, { cache: 'no-store' })
        if (r.ok) {
          const user = await r.json()
          finalInviterName = pickName(user) || 'Un miembro del equipo'
        }
      } catch (e) {
        console.warn('⚠️ No se pudo obtener info del invitador del backend:', e)
      }
    }

    // Defaults finales
    finalInviterName ||= 'Un miembro del equipo'
    finalTeamName ||= 'un equipo en Bridge'

    const acceptUrl = `${FRONTEND_URL}/join?token=${encodeURIComponent(token)}`

    const { data, error } = await resend.emails.send({
      from: 'Bridge <onboarding@resend.dev>', // Cambiar cuando tengas dominio verificado
      to: [email],
      subject: `${finalInviterName} te invitó a unirte a ${finalTeamName} en Bridge`,
      html: generateInvitationEmailHTML({
        inviterName: finalInviterName,
        teamName: finalTeamName,
        inviteeEmail: email,
        acceptUrl
      })
    })

    if (error) {
      console.error('❌ [sendInvitationEmail] Error de Resend:', error)
      throw new Error(error.message || 'Error enviando email')
    }

    console.log('✅ [sendInvitationEmail] Email enviado exitosamente')
    console.log('   - Resend ID:', data?.id)

    return {
      success: true,
      emailId: data?.id
    }

  } catch (error) {
    console.error('❌ [sendInvitationEmail] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * 🎨 Generar HTML del email de invitación
 */
function generateInvitationEmailHTML({
  inviterName,
  teamName,
  inviteeEmail,
  acceptUrl
}: {
  inviterName: string
  teamName: string
  inviteeEmail: string
  acceptUrl: string
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a equipo en Bridge</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ¡Hola!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                Tienes una nueva invitación para unirte a un equipo en Bridge.
              </p>

              <!-- Team Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <tr>
                  <td>
                    <div style="text-align: center; margin-bottom: 16px;">
                      <div style="width: 64px; height: 64px; border-radius: 50%; background-color: #1a1a1a; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #ffffff; font-size: 24px; font-weight: 700;">
                          ${teamName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #1a1a1a; text-align: center;">
                      ${teamName}
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #666666; text-align: center;">
                      <strong>${inviterName}</strong> te ha invitado a formar parte de este equipo
                    </p>
                    <p style="margin: 12px 0 0; font-size: 14px; color: #888888; text-align: center;">
                      Correo de invitación: <a href="mailto:${inviteeEmail}" style="color: #1a1a1a; text-decoration: none;">${inviteeEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${acceptUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                      Aceptar invitación
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #888888; word-break: break-all;">
                ${acceptUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">
                <strong>Bridge</strong> - Conectando talento y oportunidades
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Si no esperabas esta invitación, puedes ignorar este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
