# 🚨 URGENTE: Corregir Email de Invitación

## ❌ Problemas Actuales en el Email

### 1. Sale "undefined" en lugar del nombre del usuario
**Actual:**
```
undefined te ha invitado a formar parte de este equipo
```

**Debería decir:**
```
Juan Pérez te ha invitado a formar parte de este equipo
```

### 2. El link apunta al backend en lugar del frontend
**URL Actual (INCORRECTA):**
```
https://proyectoia-backend.onrender.com/join?token=d9ed470e...
```

**URL Correcta (debe ser):**
```
https://tu-frontend.vercel.app/join?token=d9ed470e...
```

---

## ✅ Solución

### En el endpoint `POST /teams/:teamId/invites`

Necesitas hacer 2 cambios:

### **1. Buscar el nombre del usuario que invita**

Antes de enviar el email, busca el usuario con el `byUserId`:

```typescript
// routes/teams.ts o donde tengas el endpoint

router.post('/:teamId/invites', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role, byUserId, message, expiresInDays = 7 } = req.body;
    
    // 🔍 BUSCAR EL USUARIO QUE INVITA
    const invitingUser = await prisma.user.findUnique({
      where: { id: byUserId },
      select: { name: true, email: true }
    });
    
    if (!invitingUser) {
      return res.status(404).json({ 
        error: { message: 'Usuario que invita no encontrado' } 
      });
    }
    
    // Crear la invitación
    const invitation = await prisma.invitation.create({
      data: {
        teamId,
        email: email.toLowerCase(),
        role,
        byUserId,
        token: generateToken(), // Tu función para generar token
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      }
    });
    
    // 📧 ENVIAR EMAIL CON EL NOMBRE CORRECTO
    await sendInvitationEmail({
      to: email,
      inviterName: invitingUser.name, // ← USAR EL NOMBRE REAL
      teamName: team.name,
      token: invitation.token,
      acceptUrl: `${process.env.FRONTEND_URL}/join?token=${invitation.token}` // ← URL DEL FRONTEND
    });
    
    return res.status(201).json(invitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    return res.status(500).json({ 
      error: { message: 'Error interno del servidor' } 
    });
  }
});
```

---

### **2. Configurar la URL del Frontend**

En tu archivo `.env` del backend, agrega:

```bash
# .env (Backend)

# URL del frontend para los links en emails
FRONTEND_URL=https://tu-frontend.vercel.app

# O si usas otro nombre:
APP_URL=https://tu-frontend.vercel.app
NEXT_PUBLIC_APP_BASE_URL=https://tu-frontend.vercel.app
```

---

### **3. Actualizar la función que envía el email**

```typescript
// services/email.service.ts o donde tengas la función de email

interface SendInvitationEmailParams {
  to: string;
  inviterName: string; // ← Nombre del usuario que invita
  teamName: string;
  token: string;
  acceptUrl: string; // ← URL completa del frontend
}

export async function sendInvitationEmail(params: SendInvitationEmailParams) {
  const { to, inviterName, teamName, token, acceptUrl } = params;
  
  // Si usas Resend, Nodemailer, SendGrid, etc.
  await resend.emails.send({
    from: 'Bridge <noreply@tudominio.com>',
    to: to,
    subject: `Invitación para unirte a ${teamName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            background-color: #1a1a1a; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 8px; 
            display: inline-block; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>¡Hola!</h1>
          
          <p>Tienes una nueva invitación para unirte a un equipo en Bridge.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>${teamName}</h2>
            <p><strong>${inviterName}</strong> te ha invitado a formar parte de este equipo</p>
            <p style="color: #666;">Correo de invitación: ${to}</p>
          </div>
          
          <a href="${acceptUrl}" class="button">Aceptar invitación</a>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Esta invitación expirará en 7 días.
          </p>
        </div>
      </body>
      </html>
    `
  });
}
```

---

## 📝 Resumen de Cambios Necesarios

### **En el Backend:**

1. **Buscar el usuario que invita:**
   ```typescript
   const invitingUser = await prisma.user.findUnique({
     where: { id: byUserId },
     select: { name: true }
   });
   ```

2. **Pasar el nombre al email:**
   ```typescript
   inviterName: invitingUser.name
   ```

3. **Usar URL del frontend:**
   ```typescript
   acceptUrl: `${process.env.FRONTEND_URL}/join?token=${token}`
   ```

4. **Configurar variable de entorno:**
   ```bash
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```

---

## ✅ Resultado Esperado

### **Email correcto:**
```
¡Hola!

Tienes una nueva invitación para unirte a un equipo en Bridge.

┌─────────────────────────────────────┐
│ TransDigitalCoop                    │
│ Juan Pérez te ha invitado a formar  │
│ parte de este equipo                │
│ Correo: filipraider123@gmail.com    │
└─────────────────────────────────────┘

[Aceptar invitación]
↓
https://tu-frontend.vercel.app/join?token=d9ed470e...
```

---

## 🧪 Testing

Después de hacer los cambios:

1. **Reinicia el backend**
2. **Envía una invitación de prueba**
3. **Verifica el email recibido:**
   - ✅ Debe mostrar el nombre del usuario (no "undefined")
   - ✅ El botón debe apuntar al frontend (no al backend)

---

## 🚀 Variables de Entorno Necesarias

```bash
# Backend .env

# Base de datos
DATABASE_URL=postgresql://...

# Frontend URL (para links en emails)
FRONTEND_URL=https://tu-frontend.vercel.app

# Email service (Resend, SendGrid, etc.)
RESEND_API_KEY=re_...
EMAIL_FROM=Bridge <noreply@tudominio.com>
```

---

## ⚠️ Checklist

- [ ] Buscar usuario con `byUserId` antes de crear invitación
- [ ] Pasar `inviterName` a la función de email
- [ ] Configurar `FRONTEND_URL` en variables de entorno
- [ ] Actualizar `acceptUrl` para usar `FRONTEND_URL`
- [ ] Probar enviando una invitación
- [ ] Verificar email recibido
- [ ] Confirmar que el link redirige al frontend

---

## 🎯 Código de Referencia Completo

```typescript
// POST /teams/:teamId/invites

router.post('/:teamId/invites', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role, byUserId, expiresInDays = 7 } = req.body;
    
    // 1. Buscar el equipo
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!team) {
      return res.status(404).json({ error: { message: 'Equipo no encontrado' } });
    }
    
    // 2. Buscar el usuario que invita
    const invitingUser = await prisma.user.findUnique({
      where: { id: byUserId },
      select: { name: true, email: true }
    });
    
    if (!invitingUser) {
      return res.status(404).json({ error: { message: 'Usuario no encontrado' } });
    }
    
    // 3. Crear invitación
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    
    const invitation = await prisma.invitation.create({
      data: {
        teamId,
        email: email.toLowerCase(),
        role,
        byUserId,
        token,
        expiresAt
      }
    });
    
    // 4. Enviar email con nombre correcto y URL del frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const acceptUrl = `${frontendUrl}/join?token=${token}`;
    
    await sendInvitationEmail({
      to: email,
      inviterName: invitingUser.name,  // ← Nombre real
      teamName: team.name,
      token: token,
      acceptUrl: acceptUrl  // ← URL del frontend
    });
    
    // 5. Responder
    return res.status(201).json({
      ...invitation,
      acceptUrl
    });
    
  } catch (error) {
    console.error('Error creating invitation:', error);
    return res.status(500).json({ 
      error: { message: 'Error interno del servidor' } 
    });
  }
});
```

---

## 📧 Contacto

Si necesitas ayuda implementando estos cambios, avisa. Los cambios son simples pero críticos para la funcionalidad de invitaciones.
