import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/auth.config';
import crypto from 'crypto';

interface CreateInvitationBody {
  teamId: string;
  email: string;
  role: string;
  byUserId: string;
  expiresInDays?: number;
}

/**
 * Endpoint temporal para crear invitaciones
 * Este endpoint funciona mientras el backend implementa POST /invitations
 * 
 * Una vez que el backend esté listo, cambiar InviteMembers.tsx para usar:
 * await api.post('/invitations', { ... })
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

    // Generar token único y seguro
    const token = crypto.randomBytes(32).toString('hex');
    const invitationId = crypto.randomUUID();
    
    // Calcular fecha de expiración
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Datos de la invitación
    const invitation = {
      id: invitationId,
      email: email.toLowerCase().trim(),
      token,
      teamId,
      invitedByUserId: byUserId,
      role,
      status: 'PENDING',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    console.log('✅ [API /api/invitations/create] Invitación temporal creada:', {
      id: invitation.id,
      email: invitation.email,
      teamId: invitation.teamId,
      expiresAt: invitation.expiresAt,
    });

    // NOTE: Esta es una solución temporal
    // Cuando el backend implemente POST /invitations, este endpoint puede ser eliminado
    // y InviteMembers.tsx debe cambiar a usar api.post('/invitations', ...)

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
