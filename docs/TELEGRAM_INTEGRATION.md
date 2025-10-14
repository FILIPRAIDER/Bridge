# 📱 Integración con Telegram - Documentación Técnica

## Información General

**Plataforma:** Bridge  
**Servicio:** Telegram Bot API  
**Última actualización:** Octubre 14, 2025

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Arquitectura](#2-arquitectura)
3. [Componentes Frontend](#3-componentes-frontend)
4. [Servicios y APIs](#4-servicios-y-apis)
5. [Flujos de Integración](#5-flujos-de-integración)
6. [Gestión de Códigos QR](#6-gestión-de-códigos-qr)
7. [Sincronización de Mensajes](#7-sincronización-de-mensajes)
8. [Seguridad](#8-seguridad)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Visión General

### 1.1 ¿Qué es la Integración con Telegram?

Bridge permite vincular áreas de trabajo con grupos de Telegram para:

- ✅ **Sincronización bidireccional** de mensajes
- ✅ **Notificaciones en tiempo real** vía Telegram
- ✅ **Acceso desde móvil** sin app nativa
- ✅ **Invitaciones fáciles** mediante QR codes
- ✅ **Chat unificado** entre web y Telegram

### 1.2 Beneficios

**Para Líderes:**
- Gestión centralizada desde Bridge
- Invitación masiva de miembros via QR
- Control de vinculación y desvinculación
- Estadísticas unificadas

**Para Miembros:**
- Acceso desde cualquier dispositivo
- Notificaciones nativas de Telegram
- Sin necesidad de app adicional
- Historial sincronizado

---

## 2. Arquitectura

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA TELEGRAM                     │
└─────────────────────────────────────────────────────────────┘

Frontend (Bridge Web App)
    │
    ├─── TelegramSetupWizard
    │    ├─> 6 pasos de configuración
    │    └─> Manejo de estados
    │
    ├─── TelegramInviteModal
    │    ├─> Tab QR (generación dinámica)
    │    └─> Tab Link (copiar/compartir)
    │
    ├─── TelegramQRCode
    │    ├─> Generación con qrcode.react
    │    ├─> Descarga como PNG
    │    └─> Compartir via Web Share API
    │
    └─── TelegramService
         ├─> API calls al backend
         └─> Manejo de errores

                    ↓ REST API

Backend (Node.js + Express)
    │
    ├─── Telegram Controller
    │    ├─> POST /api/telegram/link
    │    ├─> GET /api/telegram/groups/:id
    │    ├─> DELETE /api/telegram/groups/:id
    │    └─> POST /api/telegram/invites/send
    │
    ├─── Telegram Bot
    │    ├─> Comandos (/vincular, /desvincular)
    │    ├─> Webhooks para mensajes
    │    └─> Generación de códigos
    │
    └─── Database
         ├─> TelegramGroups table
         ├─> TelegramMessages table
         └─> LinkCodes table

                    ↓ Bot API

Telegram Platform
    │
    └─── Telegram Bot API
         ├─> Recepción de comandos
         ├─> Envío de mensajes
         └─> Gestión de grupos
```

### 2.2 Flujo de Datos

```
Usuario en Bridge → Frontend React
                        ↓
                 TelegramService
                        ↓
                  Backend API
                        ↓
                 Telegram Bot API
                        ↓
                  Grupo de Telegram
                        ↑
                        │ (webhook)
                        ↓
                  Backend API
                        ↓
                 WebSocket Server
                        ↓
             Usuarios en Bridge (en tiempo real)
```

---

## 3. Componentes Frontend

### 3.1 TelegramSetupWizard

**Ubicación:** `src/components/telegram/TelegramSetupWizard.tsx`

**Propósito:** Guiar al líder a través del proceso de vinculación

**Props:**
```typescript
interface TelegramSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  areaId: string;
  areaName: string;
  teamId: string;
  members: TelegramMember[];
  onLinkGroup: (chatId, chatTitle, chatType, teamId, inviteLink?) => Promise<TelegramGroup>;
  validateAndLinkCode: (code: string) => Promise<{ group: TelegramGroup, alreadyLinked?: boolean }>;
  onSendInvites: (memberIds: string[], message?: string) => Promise<void>;
  onComplete: (group: TelegramGroup) => void;
}
```

**Estados del Wizard:**
```typescript
type TelegramSetupStep = 
  | 'intro'          // Introducción
  | 'create-group'   // Crear grupo en Telegram
  | 'add-bot'        // Agregar bot al grupo
  | 'link-code'      // Ingresar código de vinculación
  | 'invite-members' // Invitar miembros
  | 'success';       // Confirmación final
```

**Características:**
- ✅ Progress bar visual
- ✅ Navegación adelante/atrás
- ✅ Validación en cada paso
- ✅ Manejo de error 409 (grupo ya vinculado)
- ✅ Salto inteligente a invitación si existe grupo

**Ejemplo de Uso:**
```tsx
<TelegramSetupWizard
  isOpen={showWizard}
  onClose={() => setShowWizard(false)}
  areaId={area.id}
  areaName={area.name}
  teamId={teamId}
  members={telegramMembers}
  onLinkGroup={handleLinkTelegramGroup}
  validateAndLinkCode={validateAndLinkCode}
  onSendInvites={handleSendTelegramInvites}
  onComplete={handleTelegramSetupComplete}
/>
```

---

### 3.2 TelegramInviteModal

**Ubicación:** `src/components/telegram/TelegramInviteModal.tsx`

**Propósito:** Permitir a líderes invitar miembros mediante QR o link

**Props:**
```typescript
interface TelegramInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: string;
  members: TelegramMember[];
  onSendInvites: (memberIds: string[], message?: string) => Promise<void>;
  defaultTab?: "qr" | "link"; // Por defecto: "qr"
}
```

**Tabs Disponibles:**
1. **Código QR** (Recomendado)
   - Generación dinámica del QR
   - Botón descargar
   - Botón compartir (Web Share API)
   - Instrucciones de uso

2. **Link Directo**
   - Input con inviteLink
   - Botón copiar al portapapeles
   - Advertencia de seguridad
   - Sugerencias de compartir

**⚠️ Nota:** El tab "Por Email" está temporalmente deshabilitado

**Características:**
- ✅ Validación de inviteLink
- ✅ Mensajes de error si link vacío
- ✅ Animaciones suaves
- ✅ Responsive design
- ✅ Modo oscuro

**Ejemplo de Uso:**
```tsx
<TelegramInviteModal
  isOpen={showInviteModal}
  onClose={() => setShowInviteModal(false)}
  inviteLink={telegramGroup.inviteLink || ""}
  members={telegramMembers}
  onSendInvites={handleSendTelegramInvites}
  defaultTab="qr"
/>
```

---

### 3.3 TelegramQRCode

**Ubicación:** `src/components/telegram/TelegramQRCode.tsx`

**Propósito:** Generar y mostrar códigos QR para invitación

**Props:**
```typescript
interface TelegramQRCodeProps {
  url: string;         // inviteLink del grupo
  size?: number;       // Tamaño en píxeles (default: 256)
  showActions?: boolean; // Mostrar botones (default: true)
  canvasId?: string;   // ID del canvas (default: "telegram-qr-canvas")
}
```

**Funcionalidades:**
- ✅ Generación con `qrcode.react`
- ✅ Nivel de corrección de errores: M
- ✅ Descarga como PNG
- ✅ Compartir via Web Share API
- ✅ Fallback: copiar URL si Share no disponible

**Dependencias:**
```json
{
  "qrcode.react": "^4.2.0"
}
```

**Ejemplo de Uso:**
```tsx
<TelegramQRCode
  url="https://t.me/+ABC123XYZ"
  size={280}
  showActions={true}
/>
```

---

### 3.4 TelegramLinkModal

**Ubicación:** `src/components/telegram/TelegramLinkModal.tsx`

**Propósito:** Modal para ingresar código de vinculación

**Props:**
```typescript
interface TelegramLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeSubmitted: (code: string) => Promise<void>;
}
```

**Características:**
- ✅ Auto-formateo de código: `TG-XXX-XXXXXXX`
- ✅ Validación en tiempo real
- ✅ Indicador visual de código válido
- ✅ Instrucciones claras
- ✅ Manejo de errores

**Formato del Código:**
```
TG-XXX-XXXXXXX
│  │   └─── 7 caracteres alfanuméricos
│  └─────── 3 caracteres alfanuméricos
└────────── Prefijo fijo "TG"

Total: 12 caracteres (sin contar guiones)
```

**Ejemplo de Uso:**
```tsx
<TelegramLinkModal
  isOpen={showLinkModal}
  onClose={() => setShowLinkModal(false)}
  onCodeSubmitted={handleCodeValidated}
/>
```

---

## 4. Servicios y APIs

### 4.1 TelegramService

**Ubicación:** `src/services/telegram.service.ts`

**Métodos Disponibles:**

#### 4.1.1 linkGroup()

Vincula un grupo de Telegram con un área.

```typescript
static async linkGroup(data: LinkTelegramGroupRequest): Promise<LinkTelegramGroupResponse>
```

**Request:**
```typescript
interface LinkTelegramGroupRequest {
  // Opción 1: Con código
  code?: string;
  
  // Opción 2: Con información completa
  chatId?: string;
  chatTitle?: string;
  chatType?: 'group' | 'supergroup' | 'channel';
  inviteLink?: string;
  
  // Siempre requeridos
  areaId: string;
  teamId: string;
}
```

**Response:**
```typescript
interface LinkTelegramGroupResponse {
  success: boolean;
  group: TelegramGroup;
  message: string;
  alreadyLinked?: boolean; // ✨ Nuevo: indica si el grupo ya existía
}
```

**Características Especiales:**
- ✅ **Manejo de Error 409**: Si el área ya tiene grupo vinculado, obtiene el grupo existente automáticamente en lugar de lanzar error
- ✅ **Flag `alreadyLinked`**: Permite al frontend detectar este caso y saltar directamente a la invitación

**Ejemplo:**
```typescript
try {
  const response = await TelegramService.linkGroup({
    code: "TG-ABC-1234567",
    areaId: "area-123",
    teamId: "team-456"
  });
  
  if (response.alreadyLinked) {
    // Grupo ya estaba vinculado, ir a invitación
    showInviteModal(response.group);
  } else {
    // Nueva vinculación exitosa
    showSuccessMessage(response.group);
  }
} catch (error) {
  // Error real (no 409)
  showError(error.message);
}
```

---

#### 4.1.2 getGroupByAreaId()

Obtiene el grupo de Telegram vinculado a un área.

```typescript
static async getGroupByAreaId(areaId: string): Promise<TelegramGroup | null>
```

**Response:**
```typescript
interface TelegramGroup {
  id: string;
  chatId: string;
  chatTitle: string;
  chatType: 'group' | 'supergroup' | 'channel';
  areaId: string;
  teamId: string;
  inviteLink?: string;
  memberCount?: number;
  isActive: boolean;
  linkedBy: string;
  linkedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

**Nota:** Retorna `null` si no hay grupo vinculado (no es un error).

---

#### 4.1.3 validateAndLinkWithCode()

Valida un código de vinculación y vincula el grupo en un solo paso.

```typescript
static async validateAndLinkWithCode(
  code: string, 
  areaId: string, 
  teamId: string
): Promise<{
  success: boolean;
  group?: TelegramGroup;
  message?: string;
  alreadyLinked?: boolean;
}>
```

**Ventajas:**
- ✅ Validación y vinculación en una sola llamada
- ✅ Manejo automático de error 409
- ✅ Contexto completo en la respuesta

---

#### 4.1.4 unlinkGroup()

Desvincula un grupo de Telegram.

```typescript
static async unlinkGroup(groupId: string): Promise<{ success: boolean; message: string }>
```

**⚠️ Advertencia:** Esta acción es irreversible.

---

#### 4.1.5 sendInvites()

Envía invitaciones por email a miembros del equipo.

```typescript
static async sendInvites(data: SendTelegramInvitesRequest): Promise<SendTelegramInvitesResponse>
```

**Request:**
```typescript
interface SendTelegramInvitesRequest {
  groupId: string;
  memberIds: string[];
  message?: string; // Mensaje personalizado
}
```

**⚠️ Nota:** Esta funcionalidad está en desarrollo. Usar métodos de QR/Link mientras tanto.

---

### 4.2 Utilidades de QR

**Ubicación:** `src/utils/qrcode.utils.ts`

#### 4.2.1 downloadQRCode()

Descarga un código QR como imagen PNG.

```typescript
function downloadQRCode(canvasId: string, filename: string = 'telegram-qr.png'): void
```

**Ejemplo:**
```typescript
downloadQRCode('telegram-qr-canvas', 'invitacion-telegram.png');
```

---

#### 4.2.2 shareQRCode()

Comparte un código QR usando Web Share API.

```typescript
async function shareQRCode(
  canvasId: string,
  title: string = 'Invitación a Telegram',
  text: string = 'Únete a nuestro grupo'
): Promise<boolean>
```

**Retorna:** `true` si se compartió exitosamente, `false` si no está disponible.

**Compatibilidad:** Solo funciona en navegadores que soportan Web Share API (principalmente móviles).

---

### 4.3 Utilidades de Telegram

**Ubicación:** `src/utils/telegram.utils.ts`

#### 4.3.1 getTelegramBotUsername()

Obtiene el username del bot de Telegram.

```typescript
function getTelegramBotUsername(): string
```

#### 4.3.2 formatLinkCode()

Formatea un código de vinculación automáticamente.

```typescript
function formatLinkCode(code: string): string
```

**Ejemplo:**
```typescript
formatLinkCode('TGABC1234567')  // → "TG-ABC-1234567"
```

#### 4.3.3 isValidLinkCode()

Valida el formato de un código de vinculación.

```typescript
function isValidLinkCode(code: string): boolean
```

**Formato válido:** `TG-XXX-XXXXXXX` (12 caracteres sin guiones)

---

## 5. Flujos de Integración

### 5.1 Flujo de Vinculación Inicial

```
1. Líder abre wizard
   ↓
2. Instrucciones de crear grupo en Telegram
   ↓
3. Instrucciones de agregar bot
   ↓
4. Usuario ejecuta /vincular en Telegram
   ↓
5. Bot genera código: TG-ABC-1234567
   ↓
6. Usuario ingresa código en Bridge
   ↓
7. Frontend valida formato
   ↓
8. Backend valida código
   │
   ├─── ✅ Código válido
   │    ├─> Obtener info del grupo
   │    ├─> Crear registro en DB
   │    ├─> Generar inviteLink
   │    └─> Retornar grupo al frontend
   │
   └─── ❌ Código inválido
        └─> Error: "Código no encontrado"
   ↓
9. Wizard avanza a paso de invitación
   ↓
10. Modal muestra QR/Link
```

### 5.2 Flujo con Grupo Ya Vinculado (Error 409)

```
1. Usuario intenta vincular código
   ↓
2. Backend detecta que área ya tiene grupo
   ↓
3. Backend retorna 409 Conflict
   ↓
4. Frontend intercepta 409
   ↓
5. TelegramService obtiene grupo existente
   ↓
6. Retorna respuesta con alreadyLinked: true
   ↓
7. Wizard detecta flag
   ↓
8. Salta directamente a paso de invitación
   ↓
9. Toast: "Este grupo ya está vinculado"
   ↓
10. Modal de invitación se abre con QR activo
```

### 5.3 Flujo de Invitación via QR

```
1. Líder genera QR
   ↓
2. Líder descarga o comparte QR
   ↓
3. Miembro recibe QR (WhatsApp, email, etc.)
   ↓
4. Miembro abre cámara de móvil
   ↓
5. Miembro escanea QR
   ↓
6. Notificación muestra: "Abrir en Telegram"
   ↓
7. Miembro click en notificación
   ↓
8. Telegram abre grupo
   ↓
9. Miembro click "Unirse al Grupo"
   ↓
10. ✅ Miembro dentro del grupo
```

---

## 6. Gestión de Códigos QR

### 6.1 Generación de QR

**Biblioteca usada:** `qrcode.react` v4.2.0

**Componente:** `QRCodeCanvas`

**Configuración:**
```typescript
<QRCodeCanvas
  id="telegram-qr-canvas"
  value={inviteLink}       // URL del grupo
  size={256}               // Tamaño en píxeles
  level="M"                // Nivel de corrección: L, M, Q, H
  includeMargin={true}     // Agregar margen blanco
  bgColor="#FFFFFF"        // Color de fondo
  fgColor="#000000"        // Color de código
  renderAs="canvas"        // canvas o svg
/>
```

### 6.2 Niveles de Corrección de Errores

| Nivel | Corrección | Uso Recomendado |
|-------|------------|-----------------|
| L     | ~7%        | Ideal para URL cortas |
| **M** | **~15%**   | **✅ Usado en Bridge** |
| Q     | ~25%       | QR con logo central |
| H     | ~30%       | Máxima redundancia |

### 6.3 Descarga de QR

**Proceso:**
```javascript
1. Obtener elemento canvas por ID
2. Convertir canvas a Data URL (PNG)
3. Crear elemento <a> temporal
4. Asignar Data URL como href
5. Trigger click programático
6. Remover elemento temporal
```

**Código:**
```typescript
const canvas = document.getElementById('telegram-qr-canvas') as HTMLCanvasElement;
const dataUrl = canvas.toDataURL('image/png');

const link = document.createElement('a');
link.download = 'invitacion-telegram.png';
link.href = dataUrl;

document.body.appendChild(link);
link.click();
document.body.removeChild(link);
```

### 6.4 Compartir QR

**Web Share API:**
```typescript
const canvas = document.getElementById('telegram-qr-canvas');
const blob = await new Promise(resolve => 
  canvas.toBlob(resolve, 'image/png')
);

const file = new File([blob], 'telegram-qr.png', { type: 'image/png' });

await navigator.share({
  title: 'Invitación a Telegram',
  text: 'Únete a nuestro grupo',
  files: [file]
});
```

**Compatibilidad:**
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS/iPad (Safari, Chrome)
- ❌ Desktop (mayoría de navegadores)

**Fallback:** Si `navigator.share` no está disponible, copiar URL al portapapeles.

---

## 7. Sincronización de Mensajes

### 7.1 Mensaje de Bridge a Telegram

```
Usuario envía mensaje en Bridge
    ↓
Frontend: WebSocket emit "send_message"
    ↓
Backend: Recibe mensaje via WebSocket
    ↓
Backend: Guarda en database
    ↓
Backend: Broadcast a usuarios web
    ↓
Backend: Envía a Telegram Bot API
    │
    ├─── bot.sendMessage(chatId, text)
    │
    └─── Si tiene adjuntos:
         ├─> bot.sendDocument()
         └─> bot.sendPhoto()
    ↓
Telegram: Mensaje aparece en grupo
```

### 7.2 Mensaje de Telegram a Bridge

```
Usuario envía mensaje en Telegram
    ↓
Telegram Bot API: Webhook al backend
    ↓
Backend: Recibe webhook
    ↓
Backend: Extrae información
    ├─> chatId
    ├─> text
    ├─> from (usuario de Telegram)
    └─> timestamp
    ↓
Backend: Crea mensaje en database
    ├─> source: "telegram"
    ├─> telegram: { messageId, fromId, username }
    └─> content
    ↓
Backend: Broadcast via WebSocket
    ↓
Frontend: Recibe "new_message"
    ↓
UI: Muestra mensaje con badge "Telegram"
```

### 7.3 Estructura de Mensaje Sincronizado

```typescript
interface AreaMessage {
  id: string;
  areaId: string;
  userId?: string;      // null si viene de Telegram
  content: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  source: 'web' | 'telegram'; // ✨ Origen del mensaje
  
  // Info del usuario web
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  // Info de Telegram
  telegram?: {
    messageId: number;
    fromId: number;
    fromUsername?: string;
    fromFirstName?: string;
    fromLastName?: string;
  };
  
  createdAt: string;
}
```

---

## 8. Seguridad

### 8.1 Autenticación

**Frontend a Backend:**
```typescript
headers: {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
}
```

**Validación en Backend:**
1. Verificar JWT token
2. Extraer userId del token
3. Verificar permisos del usuario
4. Validar que usuario pertenece al team/área

### 8.2 Validación de Códigos

**Códigos de Vinculación:**
- ✅ Formato estricto: `TG-XXX-XXXXXXX`
- ✅ Expiración: 10 minutos
- ✅ Uso único (se invalida al vincular)
- ✅ Almacenados con hash en DB

**Validación en Backend:**
```typescript
1. Verificar formato
2. Buscar código en DB
3. Verificar no expirado
4. Verificar no usado
5. Verificar que grupo existe en Telegram
6. Marcar como usado
7. Crear vinculación
```

### 8.3 Links de Invitación

**Características:**
- ✅ Generados por Telegram
- ✅ Formato: `https://t.me/+XXXXXXXXXXX`
- ✅ Permanentes (hasta ser revocados)
- ✅ Solo compartir con miembros de confianza

**⚠️ Advertencia:** Cualquiera con el link puede unirse al grupo.

**Recomendaciones:**
1. No publicar en sitios públicos
2. Compartir solo con miembros del equipo
3. Revocar y regenerar si se compromete
4. Monitorear nuevos miembros

---

## 9. Troubleshooting

### 9.1 Problemas Comunes

#### Problema: "Error 409 - Área ya vinculada"

**Causa:** El área ya tiene un grupo de Telegram vinculado

**Solución automática:** El sistema detecta esto y muestra directamente el modal de invitación

**Solución manual:**
1. Verificar grupo vinculado en dashboard
2. Si es correcto, usar ese grupo
3. Si es incorrecto, desvincular primero

---

#### Problema: "Código no encontrado"

**Causas posibles:**
1. Código mal escrito (typo)
2. Código expirado (>10 min)
3. Código ya usado
4. Bot no está en el grupo

**Soluciones:**
1. Verificar formato: `TG-XXX-XXXXXXX`
2. Generar nuevo código con `/vincular`
3. Verificar que bot está en el grupo
4. Verificar permisos del bot

---

#### Problema: "QR no se genera"

**Causas posibles:**
1. `inviteLink` está vacío o null
2. Error en biblioteca qrcode.react
3. Canvas no se renderiza

**Soluciones:**
1. Verificar que `telegramGroup.inviteLink` existe
2. Check console para errores
3. Verificar que componente está montado

---

#### Problema: "No se puede descargar QR"

**Causas posibles:**
1. Canvas no tiene ID correcto
2. Permisos del navegador bloqueados
3. Error al convertir a blob

**Soluciones:**
1. Verificar `canvasId` prop
2. Permitir descargas en navegador
3. Probar en navegador diferente

---

### 9.2 Debugging

**Logs importantes en Frontend:**
```typescript
console.log('[TelegramService] linkGroup - Response status:', response.status);
console.log('[TelegramService] linkGroup - Error 409 detected');
console.log('[useTelegramGroup] Grupo existente encontrado:', existingGroup);
console.log('[TelegramSetupWizard] Grupo ya vinculado, saltando a invitación');
```

**Logs importantes en Backend:**
```
[Telegram] Received link request for area: area-123
[Telegram] Code validation: TG-ABC-1234567
[Telegram] Group already linked, returning existing group
[Bot] Webhook received: /vincular command
[Bot] Generated link code: TG-ABC-1234567
```

---

## 10. Mejores Prácticas

### 10.1 Para Líderes

✅ **DO:**
- Vincular grupos al inicio del proyecto
- Compartir QR de forma segura
- Explicar a miembros cómo unirse
- Monitorear actividad del grupo
- Usar nombres descriptivos para grupos

❌ **DON'T:**
- Compartir links públicamente
- Vincular grupos sin planificación
- Ignorar solicitudes de soporte
- Dejar grupos sin moderación

### 10.2 Para Desarrolladores

✅ **DO:**
- Validar `inviteLink` antes de mostrar QR
- Manejar error 409 gracefully
- Usar flag `alreadyLinked` para UX inteligente
- Implementar loading states
- Agregar logs de debugging

❌ **DON'T:**
- Asumir que `inviteLink` siempre existe
- Ignorar errores de red
- Hacer múltiples llamadas innecesarias
- Hardcodear valores de configuración

---

## 11. Roadmap

### 11.1 Funcionalidades Futuras

🔜 **En Desarrollo:**
- Sistema de invitación por email (actualmente deshabilitado)
- Estadísticas de sincronización
- Notificaciones personalizadas

🎯 **Planificado:**
- Soporte para múltiples grupos por área
- Integración con otros servicios de mensajería
- Sistema de templates para mensajes
- Analytics de participación

💡 **Ideas:**
- Bot commands avanzados
- Roles sincronizados entre Bridge y Telegram
- Calendario de eventos compartido
- Encuestas y votaciones

---

## 12. Referencias

### 12.1 Documentación Externa

- **Telegram Bot API:** https://core.telegram.org/bots/api
- **qrcode.react:** https://www.npmjs.com/package/qrcode.react
- **Web Share API:** https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

### 12.2 Documentación Interna

- `ARCHITECTURE.md` - Arquitectura general del sistema
- `USER_FLOWS.md` - Flujos de usuario completos
- `API_DOCUMENTATION.md` - Documentación de endpoints

---

**Documento generado:** Octubre 14, 2025  
**Versión:** 1.0.0  
**Autor:** Equipo Bridge  
**Última revisión:** Incluye fix de error 409 y mejoras de UX
