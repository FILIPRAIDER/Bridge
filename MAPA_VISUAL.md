# 🗺️ MAPA VISUAL DEL WIZARD DE REGISTRO

```
                                INICIO
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  ¿Empresa o Estudiante?     │
                    │                             │
                    │  [🏢 Empresa]  [🎓 Estudiante] │
                    └─────────────────────────────┘
                                  │
                                  ▼
        ╔═════════════════════════════════════════════════╗
        ║  PASO 1: AccountStep (OBLIGATORIO)              ║
        ╠═════════════════════════════════════════════════╣
        ║  📝 Nombre empresa (si aplica)                  ║
        ║  👤 Nombre completo                             ║
        ║  📧 Email                                        ║
        ║  🔐 Contraseña (con validación visual)          ║
        ║  🔐 Confirmar contraseña                        ║
        ║                                                 ║
        ║  [Crear cuenta y continuar]                     ║
        ╚═════════════════════════════════════════════════╝
                    │
                    │ POST /users
                    │ POST /companies (si empresa)
                    │ Guardar en Zustand
                    │
                    ▼ ❌ NO SE PUEDE VOLVER ATRÁS
        ╔═════════════════════════════════════════════════╗
        ║  PASO 2: ProfileStep (OBLIGATORIO)              ║
        ╠═════════════════════════════════════════════════╣
        ║  💼 Título profesional                          ║
        ║  📝 Biografía (20-500 chars)                    ║
        ║  📊 Nivel de experiencia                        ║
        ║  📍 Ubicación (ciudad, país)                    ║
        ║  📱 Teléfono (🇨🇴 +57 | 🇺🇸 +1 | etc.)         ║
        ║  ⏰ Disponibilidad (opcional)                   ║
        ║  💻 Stack principal (opcional)                  ║
        ║  🏭 Sector de interés (opcional)                ║
        ║                                                 ║
        ║  [Continuar]                                    ║
        ╚═════════════════════════════════════════════════╝
                    │
                    │ GET/POST/PATCH /users/:id/profile
                    │
                    ▼
        ╔═════════════════════════════════════════════════╗
        ║  PASO 3: ExperienceStep (OPCIONAL)              ║
        ╠═════════════════════════════════════════════════╣
        ║  💼 Cargo / Rol                                 ║
        ║  🏢 Empresa                                      ║
        ║  📅 Fecha inicio → Fecha fin (o Presente)       ║
        ║  📝 Descripción (opcional, max 500 chars)       ║
        ║                                                 ║
        ║  [+ Agregar otra experiencia]                   ║
        ║  [✏️ Editar] [🗑️ Eliminar] (cada experiencia)   ║
        ║                                                 ║
        ║  [Continuar] [Completar más tarde]              ║
        ╚═════════════════════════════════════════════════╝
                    │
                    │ GET/POST/PATCH/DELETE /users/:id/experiences
                    │
                    ▼
        ╔═════════════════════════════════════════════════╗
        ║  PASO 4: CertificationsStep (OPCIONAL)          ║
        ╠═════════════════════════════════════════════════╣
        ║  🏆 Nombre de certificación                     ║
        ║  🏢 Emisor                                       ║
        ║  📅 Fecha de emisión                            ║
        ║  🔗 URL de credencial (opcional)                ║
        ║  📄 Subir archivo PDF/imagen (máx 5MB)         ║
        ║      ┌─────────────────────────────────┐       ║
        ║      │  [📤 Drag & Drop o Click]       │       ║
        ║      │  PDF, JPG, PNG permitidos       │       ║
        ║      └─────────────────────────────────┘       ║
        ║                                                 ║
        ║  [+ Agregar otra certificación]                 ║
        ║  [✏️ Editar] [🗑️ Eliminar] [👁️ Ver archivo]    ║
        ║                                                 ║
        ║  [Continuar] [Completar más tarde]              ║
        ╚═════════════════════════════════════════════════╝
                    │
                    │ GET/POST/PATCH/DELETE /users/:id/certifications
                    │ POST /uploads/certifications/:id/url (firma)
                    │ Upload directo a ImageKit
                    │
                    ▼
        ╔═════════════════════════════════════════════════╗
        ║  PASO 5: SkillsStep (OPCIONAL)                  ║
        ╠═════════════════════════════════════════════════╣
        ║  🔍 Buscar skill (autocompletado)               ║
        ║      ┌─────────────────────────────────┐       ║
        ║      │ 🔍 React, Python, Figma...      │       ║
        ║      └─────────────────────────────────┘       ║
        ║                                                 ║
        ║  ⭐ Nivel de dominio:                           ║
        ║      [⭐] [⭐] [⭐] [⭐] [⭐]                      ║
        ║       1    2    3    4    5                     ║
        ║                                                 ║
        ║  📋 Skills agregados:                           ║
        ║      ┌─────────────────────────────────┐       ║
        ║      │ React        [⭐⭐⭐⭐⭐] [🗑️]   │       ║
        ║      │ Node.js      [⭐⭐⭐⭐☆] [🗑️]   │       ║
        ║      │ PostgreSQL   [⭐⭐⭐☆☆] [🗑️]   │       ║
        ║      └─────────────────────────────────┘       ║
        ║                                                 ║
        ║  [Finalizar registro] [Completar más tarde]     ║
        ╚═════════════════════════════════════════════════╝
                    │
                    │ GET /skills
                    │ GET/POST/PATCH/DELETE /users/:id/skills
                    │
                    ▼
                ┌───────────────────────┐
                │  🎉 ¡REGISTRO COMPLETO! │
                │                       │
                │  Redirigir a /login   │
                └───────────────────────┘
                    │
                    ▼
                [Hacer login con credenciales]
                    │
                    ▼
                📍 /dashboard (ESTUDIANTE)
                📍 /empresa (EMPRESARIO)
```

---

## 🔄 FLUJO DE "COMPLETAR MÁS TARDE"

```
Cualquier paso opcional (3, 4, 5)
        │
        ▼
[Completar más tarde]
        │
        ├─→ Guardar datos actuales
        │
        ├─→ Limpiar Zustand
        │
        └─→ Redirigir a /login
                │
                ▼
        Usuario hace login
                │
                ▼
        Puede completar después desde su perfil
        (funcionalidad futura)
```

---

## 📊 BARRA DE PROGRESO VISUAL

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  [✓]━━━━[●]━━━━[○]━━━━[○]━━━━[○]                        │
│  Cuenta  Perfil  Exp    Certs  Skills                    │
│                                                           │
│  ✓ = Completado                                          │
│  ● = Paso actual                                         │
│  ○ = Pendiente                                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPONENTES ESPECIALES

### 1. PhoneInput (Selector de País)
```
┌────────────────────────────────────────────────┐
│                                                │
│  [🇨🇴 +57 ▼]  [📱 300 123 4567 ]             │
│                                                │
│  Al hacer click en ▼:                         │
│  ┌──────────────────────────────┐             │
│  │ 🔍 Buscar país...            │             │
│  ├──────────────────────────────┤             │
│  │ 🇨🇴 Colombia      +57        │             │
│  │ 🇺🇸 Estados Unidos +1        │             │
│  │ 🇲🇽 México         +52       │             │
│  │ 🇪🇸 España         +34       │             │
│  │ ... (20+ países)             │             │
│  └──────────────────────────────┘             │
│                                                │
└────────────────────────────────────────────────┘
```

### 2. PasswordInput (Validación Visual)
```
┌────────────────────────────────────────────────┐
│                                                │
│  [••••••••] [👁️]                              │
│                                                │
│  Fuerza: [█][█][█][░]                         │
│           Fuerte                               │
│                                                │
│  ✓ Entre 8 y 72 caracteres                    │
│  ✓ Al menos una mayúscula                     │
│  ✓ Al menos un número                         │
│  • Al menos un carácter especial              │
│                                                │
└────────────────────────────────────────────────┘
```

### 3. Selector de Skills con Nivel
```
┌────────────────────────────────────────────────┐
│                                                │
│  [⭐] [⭐] [⭐] [⭐] [⭐]                        │
│   1    2    3    4    5                        │
│                                                │
│  1 = Básico                                   │
│  3 = Intermedio                               │
│  5 = Experto                                  │
│                                                │
└────────────────────────────────────────────────┘
```

### 4. Upload Drag & Drop
```
┌────────────────────────────────────────────────┐
│                                                │
│              📤                                │
│                                                │
│   Haz clic para subir o arrastra un archivo   │
│                                                │
│   PDF o imagen (máx. 5MB)                     │
│                                                │
└────────────────────────────────────────────────┘

Después de seleccionar:
┌────────────────────────────────────────────────┐
│                                                │
│  📄 certificado.pdf       [✕]                 │
│  2.3 MB                                       │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 🗄️ ESTRUCTURA DE DATOS EN ZUSTAND

```typescript
// localStorage key: "bridge-session"
{
  "user": {
    "id": "clx123...",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "ESTUDIANTE"  // o "EMPRESARIO"
  },
  "companyId": "clx456..." // solo si es EMPRESARIO
}
```

---

## 📡 ENDPOINTS LLAMADOS POR PASO

### Paso 1 (AccountStep)
```
POST /users
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "ESTUDIANTE",
  "password": "********"
}

POST /companies (solo si es empresa)
{
  "name": "Mi Empresa S.A.S."
}
```

### Paso 2 (ProfileStep)
```
GET /users/clx123.../profile
POST /users/clx123.../profile
{
  "headline": "Desarrollador Full Stack",
  "bio": "...",
  "seniority": "Mid-level",
  "location": "Bogotá, Colombia",
  "phone": "+573001234567",
  "availability": "Tiempo completo",
  "stack": "React, Node.js",
  "sector": "Fintech"
}
```

### Paso 3 (ExperienceStep)
```
GET /users/clx123.../experiences
POST /users/clx123.../experiences
{
  "role": "Frontend Developer",
  "company": "Tech Corp",
  "startDate": "2022-01-01",
  "endDate": "2023-12-31",
  "description": "..."
}
```

### Paso 4 (CertificationsStep)
```
GET /users/clx123.../certifications
POST /users/clx123.../certifications
{
  "name": "AWS Certified Developer",
  "issuer": "Amazon Web Services",
  "issueDate": "2023-06-15",
  "url": "https://..."
}

POST /uploads/certifications/clx789.../url
→ Retorna firma de ImageKit

UPLOAD a ImageKit (directo desde frontend)
→ Retorna fileUrl

PATCH /users/clx123.../certifications/clx789...
{
  "fileUrl": "https://ik.imagekit.io/...",
  "fileName": "certificado.pdf",
  "fileSize": 2458000
}
```

### Paso 5 (SkillsStep)
```
GET /skills  (catálogo completo)
GET /users/clx123.../skills
POST /users/clx123.../skills
{
  "skillId": "clxabc...",
  "level": 4
}
```

---

## ✅ CHECKLIST DE FUNCIONALIDADES

- [x] Wizard de 5 pasos
- [x] Barra de progreso visual
- [x] Validaciones Zod en todos los formularios
- [x] Paso 1 bloqueado después de crear usuario
- [x] Selector de teléfono con prefijos (20+ países)
- [x] Input de contraseña con validación visual
- [x] CRUD completo de experiencias
- [x] CRUD completo de certificaciones
- [x] Upload de archivos a ImageKit
- [x] CRUD completo de skills
- [x] Selector de skills con autocompletado
- [x] Selector de nivel con estrellas interactivas
- [x] Botón "Completar más tarde" en pasos opcionales
- [x] Toasts de éxito/error
- [x] Estados de carga (spinners)
- [x] Responsive design
- [x] Tema claro consistente
- [x] TypeScript estricto
- [x] Zustand con persistencia

---

**🎉 TODO IMPLEMENTADO Y FUNCIONANDO**
