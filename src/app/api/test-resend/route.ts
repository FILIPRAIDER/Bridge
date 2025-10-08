import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing Resend configuration...');
    console.log('📍 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('📍 RESEND_API_KEY preview:', process.env.RESEND_API_KEY?.substring(0, 15) + '...');
    console.log('📍 RESEND_FROM:', process.env.RESEND_FROM || 'Not set (using default)');
    console.log('📍 RESEND_DEV_FORCE_TO:', process.env.RESEND_DEV_FORCE_TO || 'Not set');
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'RESEND_API_KEY not configured in environment variables',
        hint: 'Make sure .env.local has RESEND_API_KEY and restart the server'
      }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM || 'Bridge Test <onboarding@resend.dev>';
    const toEmail = process.env.RESEND_DEV_FORCE_TO || 'delivered@resend.dev';
    
    console.log('📧 Attempting to send test email...');
    console.log('   From:', fromEmail);
    console.log('   To:', toEmail);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: 'Test de Resend - Bridge App',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>✅ Resend funciona correctamente!</h1>
          <p>Este es un email de prueba enviado desde Bridge.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Configuración:</strong></p>
          <ul>
            <li>API Key configurada: ✅</li>
            <li>Servidor Next.js funcionando: ✅</li>
            <li>Resend SDK funcionando: ✅</li>
          </ul>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message || 'Unknown Resend error',
        details: error
      }, { status: 500 });
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Email ID:', data?.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email de prueba enviado correctamente',
      emailId: data?.id,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: true,
      from: fromEmail,
      to: toEmail,
      devModeActive: !!process.env.RESEND_DEV_FORCE_TO
    });
    
  } catch (error) {
    console.error('❌ Exception during test:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
