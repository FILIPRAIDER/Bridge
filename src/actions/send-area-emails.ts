'use server'

import { Resend } from 'resend'

// --- helpers ---
const norm = (url?: string) => (url ?? '').replace(/\/+$/, '');
const safeName = (v?: string | null) => (v && v.trim()) ? v.trim() : undefined;

// Validar que la API key esté presente
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY no está configurada')
}

const resend = new Resend(process.env.RESEND_API_KEY)
const FRONTEND_URL = norm(process.env.NEXT_PUBLIC_APP_BASE_URL) || 'https://cresia-app.vercel.app'

// 📧 Configuración de Resend
const RESEND_FROM = process.env.RESEND_FROM || 'Bridge <onboarding@resend.dev>'
const RESEND_DEV_FORCE_TO = process.env.RESEND_DEV_FORCE_TO // Email forzado en dev

interface SendAreaAssignmentEmailParams {
  to: string
  userName: string
  areaName: string
  teamName: string
  inviterName: string
  areaId: string
  teamId: string
}

/**
 * 📧 Server Action: Enviar Email de Asignación a Área
 */
export async function sendAreaAssignmentEmail(params: SendAreaAssignmentEmailParams) {
  try {
    console.log('🚀 [sendAreaAssignmentEmail] INICIANDO con params:', {
      to: params.to,
      userName: params.userName,
      areaName: params.areaName,
      teamName: params.teamName,
      inviterName: params.inviterName
    })
    console.log('🔑 [sendAreaAssignmentEmail] RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY)

    const { to, userName, areaName, teamName, inviterName, areaId, teamId } = params

    const areaUrl = `${FRONTEND_URL}/dashboard/teams/${teamId}/areas/${areaId}`

    // 🔧 En desarrollo, forzar envío a email específico
    const finalRecipient = RESEND_DEV_FORCE_TO || to
    const isDevMode = !!RESEND_DEV_FORCE_TO

    console.log('📧 [sendAreaAssignmentEmail] Llamando a Resend con:', {
      from: RESEND_FROM,
      to: finalRecipient,
      originalTo: to,
      isDevMode,
      subject: `📋 Asignado al área "${areaName}"`
    })

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [finalRecipient],
      subject: `📋 Asignado al área "${areaName}"`,
      html: generateAreaAssignmentEmailHTML({
        userName,
        areaName,
        teamName,
        inviterName,
        areaUrl,
        isDevMode,
        originalRecipient: to,
        devRecipient: isDevMode ? finalRecipient : undefined
      })
    })

    if (error) {
      console.error('❌ [sendAreaAssignmentEmail] Error de Resend:', error)
      throw new Error(error.message || 'Error enviando email')
    }

    console.log('✅ [sendAreaAssignmentEmail] Email enviado exitosamente')
    console.log('   - Resend ID:', data?.id)

    return {
      success: true,
      emailId: data?.id
    }

  } catch (error) {
    console.error('❌ [sendAreaAssignmentEmail] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

interface SendAreaRemovalEmailParams {
  to: string
  userName: string
  areaName: string
  teamName: string
  removerName: string
}

/**
 * 📧 Server Action: Enviar Email de Remoción de Área
 */
export async function sendAreaRemovalEmail(params: SendAreaRemovalEmailParams) {
  try {
    console.log('🚀 [sendAreaRemovalEmail] INICIANDO con params:', {
      to: params.to,
      userName: params.userName,
      areaName: params.areaName,
      teamName: params.teamName,
      removerName: params.removerName
    })

    const { to, userName, areaName, teamName, removerName } = params

    // 🔧 En desarrollo, forzar envío a email específico
    const finalRecipient = RESEND_DEV_FORCE_TO || to
    const isDevMode = !!RESEND_DEV_FORCE_TO

    console.log('📧 [sendAreaRemovalEmail] Llamando a Resend con:', {
      from: RESEND_FROM,
      to: finalRecipient,
      originalTo: to,
      isDevMode
    })

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [finalRecipient],
      subject: `📋 Removido del área "${areaName}"`,
      html: generateAreaRemovalEmailHTML({
        userName,
        areaName,
        teamName,
        removerName,
        isDevMode,
        originalRecipient: to,
        devRecipient: isDevMode ? finalRecipient : undefined
      })
    })

    if (error) {
      console.error('❌ [sendAreaRemovalEmail] Error de Resend:', error)
      throw new Error(error.message || 'Error enviando email')
    }

    console.log('✅ [sendAreaRemovalEmail] Email enviado exitosamente')
    console.log('   - Resend ID:', data?.id)

    return {
      success: true,
      emailId: data?.id
    }

  } catch (error) {
    console.error('❌ [sendAreaRemovalEmail] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

interface SendNewFileEmailParams {
  to: string[]
  fileName: string
  uploaderName: string
  areaName: string
  fileId: string
  areaId: string
  teamId: string
}

/**
 * 📧 Server Action: Enviar Email de Nuevo Archivo
 */
export async function sendNewFileEmail(params: SendNewFileEmailParams) {
  try {
    console.log('🚀 [sendNewFileEmail] INICIANDO con params:', {
      to: params.to,
      fileName: params.fileName,
      uploaderName: params.uploaderName,
      areaName: params.areaName
    })

    const { to, fileName, uploaderName, areaName, fileId, areaId, teamId } = params

    const fileUrl = `${FRONTEND_URL}/dashboard/teams/${teamId}/areas/${areaId}?tab=files&file=${fileId}`

    // 🔧 En desarrollo, forzar envío a email específico
    const finalRecipients = RESEND_DEV_FORCE_TO ? [RESEND_DEV_FORCE_TO] : to
    const isDevMode = !!RESEND_DEV_FORCE_TO

    console.log('📧 [sendNewFileEmail] Llamando a Resend con:', {
      from: RESEND_FROM,
      to: finalRecipients,
      originalTo: to,
      isDevMode
    })

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: finalRecipients,
      subject: `📎 Nuevo archivo: "${fileName}" en "${areaName}"`,
      html: generateNewFileEmailHTML({
        fileName,
        uploaderName,
        areaName,
        fileUrl,
        isDevMode,
        originalRecipients: to,
        devRecipient: isDevMode ? finalRecipients[0] : undefined
      })
    })

    if (error) {
      console.error('❌ [sendNewFileEmail] Error de Resend:', error)
      throw new Error(error.message || 'Error enviando email')
    }

    console.log('✅ [sendNewFileEmail] Email enviado exitosamente')
    console.log('   - Resend ID:', data?.id)

    return {
      success: true,
      emailId: data?.id
    }

  } catch (error) {
    console.error('❌ [sendNewFileEmail] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * 🎨 Generar HTML del email de asignación a área
 */
function generateAreaAssignmentEmailHTML({
  userName,
  areaName,
  teamName,
  inviterName,
  areaUrl,
  isDevMode = false,
  originalRecipient,
  devRecipient
}: {
  userName: string
  areaName: string
  teamName: string
  inviterName: string
  areaUrl: string
  isDevMode?: boolean
  originalRecipient?: string
  devRecipient?: string
}) {
  const devBanner = isDevMode ? `
    <div style="background-color: #fbbf24; padding: 12px 20px; text-align: center; border-bottom: 2px solid #f59e0b; margin-bottom: -1px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #78350f;">
        🔧 MODO DESARROLLO - Email original: ${originalRecipient} → Enviado a: ${devRecipient}
      </p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asignación a Área - Bridge</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  ${devBanner}
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Nueva Asignación de Área</h1>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px; background: white;">
      <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">Hola <strong>${userName}</strong>,</p>
      
      <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">
        <strong>${inviterName}</strong> te ha asignado al área 
        <strong>"${areaName}"</strong> en el equipo <strong>"${teamName}"</strong>.
      </p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
        <p style="margin: 0; color: #475569; font-size: 15px;"><strong>💡 ¿Qué son las áreas?</strong><br><br>
        Las áreas son sub-equipos donde puedes colaborar de forma más enfocada, 
        compartir archivos y comunicarte en tiempo real.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${areaUrl}" 
           style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Ir al Área →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #999; font-size: 14px;">
        © ${new Date().getFullYear()} Bridge Platform
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * 🎨 Generar HTML del email de remoción de área
 */
function generateAreaRemovalEmailHTML({
  userName,
  areaName,
  teamName,
  removerName,
  isDevMode = false,
  originalRecipient,
  devRecipient
}: {
  userName: string
  areaName: string
  teamName: string
  removerName: string
  isDevMode?: boolean
  originalRecipient?: string
  devRecipient?: string
}) {
  const devBanner = isDevMode ? `
    <div style="background-color: #fbbf24; padding: 12px 20px; text-align: center; border-bottom: 2px solid #f59e0b; margin-bottom: -1px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #78350f;">
        🔧 MODO DESARROLLO - Email original: ${originalRecipient} → Enviado a: ${devRecipient}
      </p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Remoción de Área - Bridge</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  ${devBanner}
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">ℹ️ Cambio en Área</h1>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px; background: white;">
      <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">Hola <strong>${userName}</strong>,</p>
      
      <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">
        <strong>${removerName}</strong> te ha removido del área 
        <strong>"${areaName}"</strong> en el equipo <strong>"${teamName}"</strong>.
      </p>
      
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0;">
        <p style="margin: 0; color: #856404; font-size: 15px;"><strong>⚠️ ¿Qué significa esto?</strong><br><br>
        Ya no tendrás acceso al chat, archivos y notificaciones de esta área. 
        Si crees que esto es un error, contacta al líder del equipo.</p>
      </div>
      
      <p style="font-size: 16px; color: #475569;">
        Sigues siendo parte del equipo principal y puedes acceder a otras áreas donde estés asignado.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #999; font-size: 14px;">
        © ${new Date().getFullYear()} Bridge Platform
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * 🎨 Generar HTML del email de nuevo archivo
 */
function generateNewFileEmailHTML({
  fileName,
  uploaderName,
  areaName,
  fileUrl,
  isDevMode = false,
  originalRecipients,
  devRecipient
}: {
  fileName: string
  uploaderName: string
  areaName: string
  fileUrl: string
  isDevMode?: boolean
  originalRecipients?: string[]
  devRecipient?: string
}) {
  const devBanner = isDevMode ? `
    <div style="background-color: #fbbf24; padding: 12px 20px; text-align: center; border-bottom: 2px solid #f59e0b; margin-bottom: -1px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #78350f;">
        🔧 MODO DESARROLLO - Emails originales: ${originalRecipients?.join(', ')} → Enviado a: ${devRecipient}
      </p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Archivo - Bridge</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  ${devBanner}
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">📎 Nuevo Archivo Compartido</h1>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px; background: white;">
      <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">¡Hola!</p>
      
      <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">
        <strong>${uploaderName}</strong> ha compartido un nuevo archivo en el área 
        <strong>"${areaName}"</strong>:
      </p>
      
      <div style="background: #e3f2fd; border: 2px dashed #2196f3; padding: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 10px; color: #1976d2; font-size: 18px; font-weight: 600;">
          📄 ${fileName}
        </p>
        <p style="margin: 0; color: #666; font-size: 14px;">
          Haz clic abajo para ver el archivo
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${fileUrl}" 
           style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); 
                  color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Ver Archivo →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #999; font-size: 14px;">
        © ${new Date().getFullYear()} Bridge Platform
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
