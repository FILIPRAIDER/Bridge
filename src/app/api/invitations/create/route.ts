import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/auth.config';

interface CreateInvitationBody {
  teamId: string;
  email: string;
  role: string;
  byUserId: string;
  expiresInDays?: number;
}

/**
 * Endpoint proxy que llama al backend para crear invitaciones
 * El backend se encarga de generar el token y guardarlo en la base de datos
 */
export async function POST(req: NextRequest) {
  try {
    console.log('📧 [API /api/invitations/create] Iniciando...');

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('❌ [API /api/invitations/create] No autenticado');
      return NextResponse.json(
        { error: { message: 'No autenticado' } },
        { status: 401 }
      );
    }

    const body: CreateInvitationBody = await req.json();
    const { teamId, email, role, byUserId, expiresInDays = 7 } = body;

    console.log('📋 [API /api/invitations/create] Body:', {
      teamId,
      email,
      role,
      byUserId,
      expiresInDays,
    });

    // Validar datos requeridos
    if (!teamId || !email || !byUserId) {
      console.error('❌ [API /api/invitations/create] Faltan datos requeridos');
      return NextResponse.json(
        { error: { message: 'Faltan datos requeridos: teamId, email, byUserId' } },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ [API /api/invitations/create] Email inválido');
      return NextResponse.json(
        { error: { message: 'Formato de email inválido' } },
        { status: 400 }
      );
    }

    // Llamar al backend para crear la invitación
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://proyectoia-backend.onrender.com';
    
    console.log('🔄 [API /api/invitations/create] Llamando al backend:', `${BACKEND_URL}/teams/${teamId}/invites`);
    
    const backendResponse = await fetch(`${BACKEND_URL}/teams/${teamId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        role: role || 'MIEMBRO',
        byUserId,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('❌ [API /api/invitations/create] Error del backend:', errorData);
      return NextResponse.json(
        { error: { message: errorData.message || 'Error al crear invitación en el backend' } },
        { status: backendResponse.status }
      );
    }

    const invitation = await backendResponse.json();
    
    console.log('✅ [API /api/invitations/create] Invitación creada en backend:', {
      id: invitation.id,
      email: invitation.email,
      teamId: invitation.teamId,
      token: invitation.token?.substring(0, 10) + '...',
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error('❌ [API /api/invitations/create] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: { message: 'Error al crear invitación', details: errorMessage } },
      { status: 500 }
    );
  }
}
