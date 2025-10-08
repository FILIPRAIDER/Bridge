# 📧 NUEVO FLUJO: Emails Manejados desde Frontend

## 🎯 Resumen

El **frontend ahora maneja TODOS los emails de invitación** usando Resend directamente. El backend solo crea el registro de invitación en la base de datos.

---

## ✅ Ventajas de este enfoque

1. **Control total** del template HTML del email
2. **URL siempre correcta** (controlada desde el frontend)
3. **No más "undefined"** en nombres (frontend valida los datos)
4. **Independencia** del backend para emails
5. **Más rápido** (no depender del backend para Resend)

---

## 🔄 Cambios Necesarios en el Backend

### **1. Endpoint POST /teams/:teamId/invites**

**ANTES:**
```javascript
router.post('/teams/:teamId/invites', async (req, res) => {
  // ... crear invitación
  // ... enviar email con Resend ❌
  res.json(invitation)
})
```

**AHORA:**
```javascript
router.post('/teams/:teamId/invites', async (req, res) => {
  const { email, role, byUserId, expiresInDays, sendEmail } = req.body
  
  // 1️⃣ Crear invitación en la base de datos
  const invitation = await prisma.teamInvitation.create({
    data: {
      teamId,
      email: email.toLowerCase(),
      role,
      byUserId,
      token: generateSecureToken(), // Tu función existente
      expiresAt: calculateExpiryDate(expiresInDays),
      status: 'PENDING'
    }
  })

  // 2️⃣ NO enviar email (el frontend lo hará)
  // Si sendEmail === false (valor por defecto ahora), skip el email
  if (sendEmail !== true) {
    console.log('📧 Email será enviado por el frontend')
  }

  // 3️⃣ Retornar la invitación con el token
  res.status(201).json({
    id: invitation.id,
    email: invitation.email,
    token: invitation.token,
    expiresAt: invitation.expiresAt,
    status: invitation.status,
    role: invitation.role
  })
})
```

### **2. Endpoint GET /teams/:teamId/invites/:invitationId**

**Necesario para reenviar emails:**

```javascript
router.get('/teams/:teamId/invites/:invitationId', async (req, res) => {
  const { teamId, invitationId } = req.params

  const invitation = await prisma.teamInvitation.findFirst({
    where: {
      id: invitationId,
      teamId
    }
  })

  if (!invitation) {
    return res.status(404).json({ error: 'Invitación no encontrada' })
  }

  res.json({
    id: invitation.id,
    email: invitation.email,
    token: invitation.token,
    expiresAt: invitation.expiresAt,
    status: invitation.status,
    role: invitation.role
  })
})
```

### **3. Endpoint DELETE /teams/:teamId/invites/:invitationId/resend**

**ELIMINAR o MODIFICAR:**

```javascript
// ❌ Ya no es necesario este endpoint
// El frontend maneja el reenvío directamente con sendInvitationEmail
```

---

## 📋 Endpoints Adicionales Necesarios

### **GET /teams/:teamId**

**Para obtener nombre del equipo:**

```javascript
router.get('/teams/:teamId', async (req, res) => {
  const { teamId } = req.params

  const team = await prisma.team.findUnique({
    where: { id: teamId }
  })

  if (!team) {
    return res.status(404).json({ error: 'Equipo no encontrado' })
  }

  res.json({
    id: team.id,
    name: team.name,
    description: team.description,
    createdAt: team.createdAt
  })
})
```

### **GET /users/:userId**

**Para obtener datos del invitador:**

```javascript
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      // No enviar password u otros datos sensibles
    }
  })

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.json(user)
})
```

---

## 🧪 Testing

### **1. Crear invitación (sin enviar email):**

```bash
curl -X POST "https://proyectoia-backend.onrender.com/teams/TEAM_ID/invites" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "role": "MIEMBRO",
    "byUserId": "USER_ID",
    "expiresInDays": 7,
    "sendEmail": false
  }'

# Respuesta esperada:
{
  "id": "inv_123",
  "email": "test@example.com",
  "token": "abcd1234...",
  "expiresAt": "2025-10-15T...",
  "status": "PENDING",
  "role": "MIEMBRO"
}
```

### **2. Obtener datos del equipo:**

```bash
curl "https://proyectoia-backend.onrender.com/teams/TEAM_ID"

# Respuesta esperada:
{
  "id": "team_123",
  "name": "TransDigitalCoop",
  "description": "...",
  "createdAt": "..."
}
```

### **3. Obtener datos del usuario:**

```bash
curl "https://proyectoia-backend.onrender.com/users/USER_ID"

# Respuesta esperada:
{
  "id": "user_123",
  "name": "Juan Pérez",
  "email": "juan@example.com"
}
```

---

## ✅ Checklist de Implementación

- [ ] Modificar `POST /teams/:teamId/invites` para aceptar `sendEmail: false`
- [ ] Crear/verificar `GET /teams/:teamId`
- [ ] Crear/verificar `GET /users/:userId`
- [ ] Crear `GET /teams/:teamId/invites/:invitationId` (para reenviar)
- [ ] Eliminar lógica de Resend del backend (opcional, si quieres)
- [ ] Testear creación de invitación sin email
- [ ] Testear endpoints de teams y users
- [ ] Desplegar a Render

---

## 📝 Variables de Entorno (Frontend)

El frontend necesita estas variables en Vercel:

```bash
# .env.local (y Vercel Environment Variables)
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE_URL=https://proyectoia-backend.onrender.com
NEXT_PUBLIC_APP_BASE_URL=https://cresia-app.vercel.app
```

---

## 🎨 Template del Email

El frontend usa un template HTML completamente personalizado que incluye:

- ✅ Nombre del invitador (nunca "undefined")
- ✅ Nombre del equipo
- ✅ Avatar del equipo (inicial del nombre)
- ✅ Email del invitado
- ✅ **URL correcta del frontend**: `https://cresia-app.vercel.app/join?token=...`
- ✅ Botón de "Aceptar invitación"
- ✅ Link alternativo para copiar/pegar
- ✅ Footer con branding de Bridge

---

## 🚀 Resultado Final

**Email enviado:**
```
De: Bridge <onboarding@resend.dev>
Para: mimamaelzorro@gmail.com
Asunto: Juan Pérez te invitó a unirte a TransDigitalCoop en Bridge

[Template HTML hermoso con toda la info correcta]

Botón: Aceptar invitación
Link: https://cresia-app.vercel.app/join?token=abcd1234...
```

---

## 🎯 Próximos Pasos

1. **Backend**: Implementar los cambios arriba mencionados
2. **Frontend**: Ya está listo (con este commit)
3. **Testing**: Probar el flujo completo:
   - Crear invitación → Backend responde con token
   - Frontend envía email → Usuario recibe email
   - Usuario hace clic → Redirige a frontend correcto
   - Usuario acepta → Se une al equipo

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:
- `src/actions/send-invitation-email.ts` (envío de email)
- `src/actions/team-invitations.ts` (server actions)
- `src/components/dashboard/lider/InviteMembers.tsx` (UI)
