# 🚨 ERROR: Endpoint `/api/telegram/link` - 400 Bad Request

> **Fecha:** 13 de Octubre, 2025  
> **Reportado por:** Frontend Team  
> **Prioridad:** 🔴 ALTA - Bloquea funcionalidad de vinculación de Telegram

---

## 📋 Resumen del Problema

El endpoint `POST /api/telegram/link` está rechazando las peticiones del frontend con error **400 Bad Request**, indicando que faltan los campos `code` y `project_id`.

**Error exacto en consola:**
```
:4001/api/telegram/link:1  Failed to load resource: the server responded with a status of 400 (Bad Request)
Error validating and linking with code: Error: code and project_id are required
```

---

## 🔍 Análisis del Problema

### **1. Diferencia en Nomenclatura**

El backend está esperando `project_id`, pero en Bridge Web usamos **áreas dentro de equipos**:

```
Estructura de Bridge Web:
- Team (Equipo)
  └─ Area (Área/Subequipo)
      └─ Telegram Group (opcional)
```

**Backend espera:**
```json
{
  "code": "TG-527-A3K9X2M",
  "project_id": "..."
}
```

**Frontend está enviando:**
```json
{
  "code": "TG-527-A3K9X2M",
  "areaId": "cmgpup4110001i283khlmam1t",
  "teamId": "cmghgdtiv0002gu6zbruvqg4t"
}
```

---

## 📦 Request que Frontend Envía

### **Endpoint:**
```
POST http://localhost:4001/api/telegram/link
```

### **Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### **Body:**
```json
{
  "code": "TG-527-A3K9X2M",
  "areaId": "cmgpup4110001i283khlmam1t",
  "teamId": "cmghgdtiv0002gu6zbruvqg4t"
}
```

---

## 🎯 Solución Propuesta

### **Opción 1: Backend Acepta `areaId` + `teamId` (RECOMENDADO)**

Modificar el endpoint para aceptar la estructura de Bridge Web:

```javascript
// Backend: /api/telegram/link
app.post('/api/telegram/link', async (req, res) => {
  const { code, areaId, teamId } = req.body;
  
  // Validar que existan los campos necesarios
  if (!code || !areaId || !teamId) {
    return res.status(400).json({
      success: false,
      error: 'code, areaId and teamId are required'
    });
  }
  
  // Validar el código
  const linkData = await validateLinkCode(code);
  
  if (!linkData) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired code'
    });
  }
  
  // Vincular el grupo con el área
  const group = await linkTelegramGroupToArea({
    chatId: linkData.chatId,
    chatTitle: linkData.chatTitle,
    chatType: linkData.chatType,
    areaId: areaId,
    teamId: teamId,
    inviteLink: linkData.inviteLink,
    linkedBy: req.user.id
  });
  
  // Notificar al bot de Telegram
  await notifyBotGroupLinked(linkData.chatId, {
    areaName: group.area.name,
    teamName: group.team.name
  });
  
  return res.json({
    success: true,
    group: group,
    message: 'Group linked successfully'
  });
});
```

**✅ Ventajas:**
- Consistente con la estructura de Bridge Web
- No requiere cambios en el frontend
- Permite vincular grupos específicamente a áreas

---

### **Opción 2: Frontend Envía `project_id`**

Si el backend requiere mantener `project_id`, el frontend puede mapear:

```typescript
// Frontend: telegram.service.ts
static async validateAndLinkWithCode(code: string, areaId: string, teamId: string) {
  const result = await this.linkGroup({
    code,
    project_id: areaId, // 🔄 Usar areaId como project_id
  });
  
  return result;
}
```

**❌ Desventajas:**
- Confuso para el frontend (llamar "project_id" a lo que es un "areaId")
- Pierde información del teamId
- No es consistente con la arquitectura de Bridge Web

---

## 📂 Estructura de Datos

### **TelegramGroup en Base de Datos**

```prisma
model TelegramGroup {
  id          String   @id @default(cuid())
  chatId      String   @unique
  chatTitle   String
  chatType    String   // 'group' | 'supergroup' | 'channel'
  
  // Relaciones
  areaId      String
  area        Area     @relation(fields: [areaId], references: [id])
  
  teamId      String
  team        Team     @relation(fields: [teamId], references: [id])
  
  // Metadata
  inviteLink  String?
  isActive    Boolean  @default(true)
  linkedBy    String   // userId
  linkedAt    DateTime @default(now())
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🔄 Flujo Completo

### **1. Usuario en Telegram**
```
1. Usuario va al grupo de Telegram
2. Escribe: /vincular
3. Bot genera código: TG-527-A3K9X2M
4. Bot responde:
   "🔗 Código de vinculación: TG-527-A3K9X2M
    Ve a Bridge Web y pega este código.
    ⏱️ Expira en 5 minutos."
```

### **2. Backend del Bot (telegram-gateway)**
```javascript
// Cuando el usuario escribe /vincular
bot.onText(/\/vincular/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Generar código único
  const code = generateLinkCode(); // "TG-527-A3K9X2M"
  
  // Guardar en Redis (expira en 5 minutos)
  await redis.setex(`telegram:link:${code}`, 300, JSON.stringify({
    chatId: chatId.toString(),
    chatTitle: msg.chat.title,
    chatType: msg.chat.type,
    inviteLink: msg.chat.invite_link,
    createdAt: new Date().toISOString()
  }));
  
  // Responder al usuario
  await bot.sendMessage(chatId, 
    `🔗 Código de vinculación generado\n\n` +
    `Código: ${code}\n\n` +
    `📋 Para vincular:\n` +
    `1. Ve a Bridge Web\n` +
    `2. Abre tu área\n` +
    `3. Ve a Chat → Conectar Telegram\n` +
    `4. Pega este código\n\n` +
    `⏱️ Expira en 5 minutos`
  );
});
```

### **3. Usuario en Bridge Web**
```
1. Usuario va a su área
2. Click en "Conectar Telegram"
3. Sigue el wizard hasta Step 3
4. Click en "Ingresar Código"
5. Pega: TG-527-A3K9X2M
6. Click en "Vincular Grupo"
```

### **4. Frontend (Bridge Web)**
```typescript
// src/services/telegram.service.ts
static async validateAndLinkWithCode(code: string, areaId: string, teamId: string) {
  const headers = await this.getAuthHeaders();
  
  const response = await fetch('http://localhost:4001/api/telegram/link', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      code: code,        // "TG-527-A3K9X2M"
      areaId: areaId,    // "cmgpup4110001i283khlmam1t"
      teamId: teamId     // "cmghgdtiv0002gu6zbruvqg4t"
    })
  });
  
  return response.json();
}
```

### **5. Backend (core-api) - ❌ AQUÍ FALLA**
```javascript
// PROBLEMA: Backend rechaza porque espera 'project_id'
app.post('/api/telegram/link', (req, res) => {
  const { code, project_id } = req.body;
  
  if (!code || !project_id) {
    return res.status(400).json({
      success: false,
      error: 'code and project_id are required' // ❌ ERROR
    });
  }
  
  // ...
});
```

**✅ SOLUCIÓN: Aceptar areaId + teamId**
```javascript
app.post('/api/telegram/link', async (req, res) => {
  const { code, areaId, teamId } = req.body;
  
  if (!code || !areaId || !teamId) {
    return res.status(400).json({
      success: false,
      error: 'code, areaId and teamId are required'
    });
  }
  
  // Validar código en Redis
  const linkData = await redis.get(`telegram:link:${code}`);
  
  if (!linkData) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired code'
    });
  }
  
  const data = JSON.parse(linkData);
  
  // Crear vinculación en DB
  const group = await prisma.telegramGroup.create({
    data: {
      chatId: data.chatId,
      chatTitle: data.chatTitle,
      chatType: data.chatType,
      inviteLink: data.inviteLink,
      areaId: areaId,
      teamId: teamId,
      linkedBy: req.user.id,
      isActive: true
    },
    include: {
      area: true,
      team: true
    }
  });
  
  // Eliminar código usado
  await redis.del(`telegram:link:${code}`);
  
  // Notificar al bot
  await fetch('http://telegram-gateway:3002/bot/notify-linked', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: data.chatId,
      areaName: group.area.name,
      teamName: group.team.name
    })
  });
  
  return res.json({
    success: true,
    group: {
      id: group.id,
      chatId: group.chatId,
      chatTitle: group.chatTitle,
      chatType: group.chatType,
      areaId: group.areaId,
      teamId: group.teamId,
      inviteLink: group.inviteLink,
      linkedAt: group.linkedAt
    },
    message: 'Group linked successfully'
  });
});
```

---

## 🧪 Pruebas para Validar

### **Test 1: Código Válido**
```http
POST /api/telegram/link
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "TG-527-A3K9X2M",
  "areaId": "cmgpup4110001i283khlmam1t",
  "teamId": "cmghgdtiv0002gu6zbruvqg4t"
}
```

**Expected Response:**
```json
{
  "success": true,
  "group": {
    "id": "clx123...",
    "chatId": "-1003079952527",
    "chatTitle": "Mi Grupo Test",
    "chatType": "supergroup",
    "areaId": "cmgpup4110001i283khlmam1t",
    "teamId": "cmghgdtiv0002gu6zbruvqg4t",
    "inviteLink": "https://t.me/+ABC123",
    "linkedAt": "2025-10-13T10:30:00Z"
  },
  "message": "Group linked successfully"
}
```

---

### **Test 2: Código Inválido**
```http
POST /api/telegram/link

{
  "code": "TG-999-INVALID",
  "areaId": "cmgpup4110001i283khlmam1t",
  "teamId": "cmghgdtiv0002gu6zbruvqg4t"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid or expired code"
}
```

---

### **Test 3: Código Expirado**
```http
POST /api/telegram/link

{
  "code": "TG-527-EXPIRED1",
  "areaId": "cmgpup4110001i283khlmam1t",
  "teamId": "cmghgdtiv0002gu6zbruvqg4t"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Code expired"
}
```

---

### **Test 4: Código Ya Usado**
```http
POST /api/telegram/link

{
  "code": "TG-527-A3K9X2M",
  "areaId": "cmgpup4110001i283khlmam1t",
  "teamId": "cmghgdtiv0002gu6zbruvqg4t"
}
```

**Expected Response (segunda vez):**
```json
{
  "success": false,
  "error": "Code already used"
}
```

---

## 🔍 Otros Errores Detectados

### **1. Endpoint de Grupo por Área - 404**
```
GET /api/telegram/groups/area/cmgpup4110001i283khlmam1t
Status: 404 Not Found
```

**Esperado:**
- Si existe grupo: Retornar el grupo
- Si NO existe grupo: Retornar `{ group: null }` (no 404)

**Implementación sugerida:**
```javascript
app.get('/api/telegram/groups/area/:areaId', async (req, res) => {
  const { areaId } = req.params;
  
  const group = await prisma.telegramGroup.findFirst({
    where: {
      areaId: areaId,
      isActive: true
    }
  });
  
  // ✅ NO devolver 404 si no existe, devolver null
  return res.json({
    group: group || null
  });
});
```

---

### **2. Endpoint de Members - 404**
```
GET /api/teams/cmghgdtiv0002gu6zbruvqg4t/areas/cmgpup4110001i283khlmam1t/members
Status: 404 Not Found
```

**Este endpoint debería existir** para listar miembros del área.

**Implementación sugerida:**
```javascript
app.get('/api/teams/:teamId/areas/:areaId/members', async (req, res) => {
  const { teamId, areaId } = req.params;
  
  // Verificar que el área pertenece al equipo
  const area = await prisma.area.findFirst({
    where: {
      id: areaId,
      teamId: teamId
    }
  });
  
  if (!area) {
    return res.status(404).json({
      success: false,
      error: 'Area not found'
    });
  }
  
  // Obtener miembros del área
  const members = await prisma.areaMember.findMany({
    where: {
      areaId: areaId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    }
  });
  
  return res.json({
    members: members.map(m => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatarUrl,
      role: m.role
    }))
  });
});
```

---

## 📝 Checklist de Tareas Backend

- [ ] **Alta Prioridad:** Modificar `POST /api/telegram/link` para aceptar `areaId` + `teamId`
- [ ] **Alta Prioridad:** Implementar validación de códigos desde Redis
- [ ] **Alta Prioridad:** Eliminar código después de usarlo
- [ ] **Media Prioridad:** Implementar `GET /api/telegram/groups/area/:areaId`
- [ ] **Media Prioridad:** Implementar `GET /api/teams/:teamId/areas/:areaId/members`
- [ ] **Baja Prioridad:** Agregar notificación al bot cuando se vincula grupo
- [ ] **Testing:** Probar todos los casos de error (código inválido, expirado, usado)

---

## 📞 Contacto

**Reportado por:** Frontend Team  
**Fecha:** 13 de Octubre, 2025  
**Ambiente:** Development (localhost:4001)

**Archivos Frontend Relacionados:**
- `src/services/telegram.service.ts` - Servicio que llama al endpoint
- `src/hooks/useTelegramGroup.ts` - Hook que usa el servicio
- `src/components/telegram/TelegramSetupWizard.tsx` - Wizard de configuración
- `src/components/telegram/TelegramLinkModal.tsx` - Modal para ingresar código

---

## 🎯 Próximos Pasos

1. **Backend:** Implementar cambios en `/api/telegram/link`
2. **Backend:** Implementar endpoints faltantes
3. **Testing:** Probar flujo completo
4. **Frontend:** Verificar que todo funciona correctamente
5. **Documentación:** Actualizar docs con endpoints finales

---

**¿Necesitas más información o ejemplos de código?** 
Revisar: `FRONTEND_INTEGRATION_SPEC.md` para ver la especificación completa del equipo de Telegram.
