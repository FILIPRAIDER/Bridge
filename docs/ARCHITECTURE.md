# 🏗️ Arquitectura del Sistema - Bridge

## Información General

**Proyecto:** Bridge  
**Versión:** 0.1.0  
**Framework:** Next.js 15.5.4 (con Turbopack)  
**Lenguaje:** TypeScript 5.x  
**Última actualización:** Octubre 14, 2025

---

## 📊 Stack Tecnológico

### Frontend
- **Framework:** Next.js 15.5.4
- **UI:** React 19.1.0
- **Estilos:** Tailwind CSS 4.0
- **Animaciones:** Framer Motion 12.23.22
- **Iconos:** Lucide React 0.545.0
- **Formularios:** React Hook Form 7.64.0 + Zod 4.1.11
- **Estado:** Zustand 5.0.8
- **QR Codes:** qrcode.react 4.2.0

### Backend Integration
- **API Base:** Configurable vía `NEXT_PUBLIC_API_BASE_URL`
- **Autenticación:** NextAuth.js 4.24.11
- **WebSocket:** Socket.IO Client 4.8.1 (tiempo real)

### Infraestructura
- **Hosting:** Vercel
- **Base de datos:** Prisma ORM 6.17.0
- **Build Tool:** Turbopack (Next.js)

---

## 🏛️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIOS (Browsers/Mobile)                │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (CDN + Edge)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Next.js 15 Application (Frontend)          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │  Pages   │  │Components│  │   Hooks  │         │   │
│  │  └──────────┘  └──────────┘  └──────────┘         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │ Services │  │  Utils   │  │  Types   │         │   │
│  │  └──────────┘  └──────────┘  └──────────┘         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ REST API / WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + Express (Backend personalizado)         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │   Auth   │  │   API    │  │WebSocket │         │   │
│  │  │Endpoints │  │Endpoints │  │  Server  │         │   │
│  │  └──────────┘  └──────────┘  └──────────┘         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ Database
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Teams   │  │  Areas   │  │ Messages │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Telegram │  │  Files   │  │   AI     │  │  More... │   │
│  │  Groups  │  │          │  │ Sessions │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ External APIs
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Telegram   │  │   ImageKit   │  │   OpenAI     │     │
│  │   Bot API    │  │  (Storage)   │  │   GPT API    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Directorios

```
ia-app/
├── src/
│   ├── app/                      # Pages (App Router de Next.js 15)
│   │   ├── api/                  # API Routes (Backend endpoints)
│   │   ├── auth/                 # Páginas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   │       ├── empresario/
│   │   │       ├── estudiante/
│   │   │       └── lider/
│   │   ├── dashboard/            # Dashboards por rol
│   │   │   ├── empresario/
│   │   │   ├── lider/
│   │   │   └── miembro/
│   │   ├── join/                 # Página de unirse a equipo
│   │   ├── matching/             # Sistema de matching
│   │   └── layout.tsx            # Layout principal
│   │
│   ├── components/               # Componentes React
│   │   ├── areas/                # Componentes de áreas
│   │   │   ├── AreaChatView.tsx
│   │   │   ├── AreaFilePanel.tsx
│   │   │   └── ...
│   │   ├── chat/                 # Componentes de chat
│   │   │   ├── AIAssistantMessage.tsx
│   │   │   ├── ConversationSummaryModal.tsx
│   │   │   ├── MeetingRecorder.tsx
│   │   │   └── ...
│   │   ├── telegram/             # Integración Telegram
│   │   │   ├── TelegramBadge.tsx
│   │   │   ├── TelegramQRCode.tsx
│   │   │   ├── TelegramInviteModal.tsx
│   │   │   ├── TelegramSetupWizard.tsx
│   │   │   ├── TelegramLinkModal.tsx
│   │   │   ├── TelegramInfoModal.tsx
│   │   │   └── index.ts
│   │   ├── ui/                   # Componentes UI base
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useAreaChat.ts
│   │   ├── useTelegramGroup.ts
│   │   ├── useAIAssistant.ts
│   │   └── ...
│   │
│   ├── services/                 # Servicios (API calls)
│   │   ├── telegram.service.ts
│   │   ├── ai.service.ts
│   │   └── ...
│   │
│   ├── types/                    # Definiciones TypeScript
│   │   ├── telegram.ts
│   │   ├── areas.ts
│   │   ├── auth.ts
│   │   └── ...
│   │
│   ├── utils/                    # Utilidades
│   │   ├── telegram.utils.ts
│   │   ├── qrcode.utils.ts
│   │   └── ...
│   │
│   └── styles/                   # Estilos globales
│       └── globals.css
│
├── public/                       # Archivos estáticos
├── prisma/                       # Esquemas de base de datos
├── docs/                         # Documentación
├── .env.local                    # Variables de entorno (local)
├── .env                          # Variables de entorno (base)
├── next.config.ts                # Configuración Next.js
├── tailwind.config.ts            # Configuración Tailwind
├── tsconfig.json                 # Configuración TypeScript
└── package.json                  # Dependencias
```

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

```
┌──────────┐      Login       ┌──────────┐
│  Cliente │ ───────────────> │ NextAuth │
└──────────┘                   └──────────┘
     ↑                              │
     │                              │ Validate
     │                              ↓
     │                         ┌──────────┐
     │    JWT Token           │ Backend  │
     │ <─────────────────────  │   API    │
     │                         └──────────┘
     │                              │
     │                              ↓
     │                         ┌──────────┐
     │    User Data           │ Database │
     └────────────────────────  └──────────┘
```

### Roles de Usuario

1. **LIDER** - Líder de equipo
   - Crea y gestiona áreas
   - Invita miembros
   - Configura Telegram
   - Acceso completo al equipo

2. **ESTUDIANTE** - Miembro del equipo
   - Participa en áreas
   - Ve contenido compartido
   - Interactúa en chats

3. **EMPRESARIO** - Cliente/Patrocinador
   - Ve proyectos
   - Acceso a estadísticas
   - Gestiona múltiples equipos

---

## 🔌 Arquitectura de API

### REST Endpoints

```
/api/auth/[...nextauth]          # Autenticación (NextAuth)
/api/invitations/*               # Sistema de invitaciones
/api/teams/*                     # Gestión de equipos
/api/areas/*                     # Gestión de áreas
/api/telegram/*                  # Integración Telegram
  ├── /link                      # Vincular grupo
  ├── /groups/:id                # Info de grupo
  ├── /invites/send              # Enviar invitaciones
  └── /bot/status                # Estado del bot
```

### WebSocket Events

```javascript
// Eventos del cliente
connect()
join_area(areaId)
send_message({ areaId, content, type })
typing_start(areaId)
typing_stop(areaId)

// Eventos del servidor
new_message(message)
user_typing({ userId, userName })
user_stopped_typing(userId)
area_updated(area)
```

---

## 💾 Modelo de Datos

### Entidades Principales

```typescript
User {
  id: string
  name: string
  email: string
  role: "LIDER" | "ESTUDIANTE" | "EMPRESARIO"
  avatar?: string
  teams: Team[]
}

Team {
  id: string
  name: string
  description: string
  leaderId: string
  members: User[]
  areas: Area[]
}

Area {
  id: string
  name: string
  description: string
  teamId: string
  telegram?: TelegramGroup
  messages: Message[]
  files: File[]
}

TelegramGroup {
  id: string
  chatId: string
  chatTitle: string
  chatType: "group" | "supergroup" | "channel"
  areaId: string
  inviteLink: string
  isActive: boolean
}

Message {
  id: string
  content: string
  type: "TEXT" | "FILE" | "IMAGE" | "SYSTEM"
  source: "web" | "telegram"
  userId?: string
  areaId: string
  telegram?: TelegramMessageInfo
}
```

---

## 🔄 Flujo de Datos en Tiempo Real

### Chat en Tiempo Real

```
User A                    WebSocket Server              User B
  │                              │                         │
  │───── send_message ──────────>│                         │
  │                              │                         │
  │                              │───── broadcast ───────> │
  │                              │    new_message          │
  │<──── acknowledge ────────────│                         │
  │                              │                         │
  │                              │<──── ack ───────────────│
```

### Sincronización con Telegram

```
Web App                   Backend                    Telegram Bot
  │                          │                            │
  │─── send_message ───────> │                            │
  │                          │─── forward ──────────────> │
  │                          │                            │
  │                          │<─── confirmation ──────────│
  │<─── success ─────────────│                            │
  │                          │                            │
  │                          │<─── new_message ───────────│
  │<─── broadcast ───────────│     (from Telegram)        │
```

---

## 🎨 Arquitectura de Componentes

### Jerarquía de Componentes (Áreas)

```
AreaChatView (Container)
├── AreaHeader
│   ├── AreaInfo
│   ├── ConnectionStatus
│   └── ActionButtons
│       ├── TelegramButton
│       ├── SummaryButton
│       └── RecordButton
│
├── MessageList
│   ├── MessageItem[]
│   │   ├── UserMessage
│   │   ├── TelegramMessage
│   │   └── SystemMessage
│   └── AIAssistantMessage
│
├── TypingIndicator
│
├── MessageInput
│   ├── TextArea
│   ├── EmojiPicker
│   ├── FileUpload
│   └── SendButton
│
├── AreaFilePanel (Sidebar)
│   └── FileList
│
└── Modals
    ├── TelegramSetupWizard
    ├── TelegramInviteModal
    ├── ConversationSummaryModal
    └── MeetingRecorder
```

---

## 🔐 Seguridad

### Medidas de Seguridad Implementadas

1. **Autenticación**
   - JWT tokens con NextAuth
   - Refresh tokens
   - Session management

2. **Autorización**
   - Role-based access control (RBAC)
   - Per-area permissions
   - Team membership verification

3. **API Security**
   - Bearer token authentication
   - CORS configuration
   - Rate limiting (backend)

4. **Data Protection**
   - Input validation (Zod)
   - XSS prevention
   - CSRF protection

---

## 📊 Performance

### Optimizaciones Implementadas

1. **Frontend**
   - Server-side rendering (SSR)
   - Static generation donde es posible
   - Code splitting automático (Next.js)
   - Image optimization (Next/Image)
   - Turbopack para builds rápidos

2. **WebSocket**
   - Conexiones persistentes
   - Reconnection automática
   - Event batching

3. **API**
   - Response caching
   - Pagination en listas grandes
   - Lazy loading de componentes

---

## 🔄 CI/CD

### Pipeline de Despliegue

```
Developer Push
      │
      ↓
GitHub (main branch)
      │
      ↓
Vercel Webhook
      │
      ├─── Build (Turbopack)
      │    ├─── Type check
      │    ├─── Lint
      │    └─── Bundle
      │
      ├─── Deploy to Preview
      │    └─── Test environment
      │
      └─── Deploy to Production
           └─── cresia-app.vercel.app
```

---

## 🌐 Variables de Entorno

### Variables Requeridas

```env
# Next.js
NEXTAUTH_URL=https://cresia-app.vercel.app
NEXTAUTH_SECRET=<secret>

# API Backend
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com

# Database (si se usa Prisma)
DATABASE_URL=postgresql://...

# Servicios externos (opcional)
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
```

---

## 📈 Escalabilidad

### Consideraciones de Escalamiento

1. **Horizontal Scaling**
   - Vercel maneja auto-scaling del frontend
   - Backend API puede escalarse horizontalmente
   - WebSocket server puede usar Redis para pub/sub

2. **Database**
   - Connection pooling
   - Read replicas para queries pesados
   - Índices en columnas frecuentes

3. **Storage**
   - CDN para assets estáticos
   - ImageKit para imágenes
   - S3-compatible storage para archivos

---

## 🔧 Mantenimiento

### Logs y Monitoreo

- **Frontend**: Vercel Analytics
- **Backend**: Application logs
- **Errors**: Error tracking (recomendado: Sentry)
- **Performance**: Web Vitals

### Backups

- Base de datos: Daily automated backups
- File storage: Versioning enabled
- Code: Git repository (GitHub)

---

## 📚 Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Documento generado:** Octubre 14, 2025  
**Versión:** 1.0.0
