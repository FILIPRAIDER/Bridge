# 🚨 URGENTE: Implementar Endpoint de Búsqueda de Usuarios

## ❌ Problema Actual

El frontend está intentando usar un endpoint que **NO EXISTE** en el backend:

```
GET https://proyectoia-backend.onrender.com/users/search
```

**Error actual:**
```
404 (Not Found)
{"error": {"message": "Usuario no encontrado"}}
```

---

## ✅ Solución Requerida

Necesitamos que implementes este endpoint en el backend:

### **Endpoint:** `GET /users/search`

### **URL Completa:**
```
https://proyectoia-backend.onrender.com/users/search
```

---

## 📥 Request Parameters

| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
|-----------|------|-------------|-------------|---------|
| `email` | string | ✅ Sí | Email o parte del email a buscar | `filip`, `juan@`, etc. |
| `role` | string | ❌ No | Filtrar por rol específico | `ESTUDIANTE`, `MIEMBRO`, `LIDER` |
| `limit` | number | ❌ No | Máximo de resultados (default: 10) | `5`, `10`, `20` |

### **Ejemplos de Requests Reales:**

```bash
# 1. Buscar usuarios con "filip" en el email
GET /users/search?email=filip&role=ESTUDIANTE&limit=10

# 2. Buscar cualquier usuario con "maria" en el email
GET /users/search?email=maria

# 3. Buscar líderes con "carlos" en el email
GET /users/search?email=carlos&role=LIDER&limit=5
```

---

## 📤 Response Esperado

### **Success (200 OK)**

```json
[
  {
    "id": "clx123abc...",
    "email": "filip.perez@ejemplo.com",
    "name": "Filip Pérez",
    "role": "ESTUDIANTE"
  },
  {
    "id": "clx456def...",
    "email": "filipraider@ejemplo.com",
    "name": "Filip Raider",
    "role": "ESTUDIANTE"
  }
]
```

### **Sin resultados (200 OK)**

```json
[]
```

### **Error (400 Bad Request)**

```json
{
  "error": {
    "message": "El parámetro 'email' es obligatorio"
  }
}
```

---

## 💻 Código de Implementación

### **Opción 1: Express + Prisma (Recomendado)**

```typescript
// routes/users.ts o routes/user.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /users/search
 * Busca usuarios por email (autocomplete)
 */
router.get('/search', async (req, res) => {
  try {
    const { email, role, limit = '10' } = req.query;
    
    // Validación
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        error: { 
          message: "El parámetro 'email' es obligatorio" 
        }
      });
    }
    
    // Buscar usuarios
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive' // Case-insensitive
        },
        ...(role && { role: role as string })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      take: parseInt(limit as string, 10),
      orderBy: {
        email: 'asc'
      }
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ 
      error: { 
        message: 'Error interno del servidor' 
      }
    });
  }
});

export default router;
```

### **Registrar la Ruta en tu App Principal**

```typescript
// app.ts o index.ts

import express from 'express';
import userRoutes from './routes/users'; // ← Tu nuevo archivo

const app = express();

// ... otros middlewares ...

// Registrar rutas
app.use('/users', userRoutes); // ← Esto crea /users/search

// ... resto del código ...
```

---

## 🧪 Testing

### **1. Test con cURL**

```bash
# Buscar usuario con "filip"
curl "https://proyectoia-backend.onrender.com/users/search?email=filip&role=ESTUDIANTE&limit=10"

# Respuesta esperada:
# [{"id":"clx...","email":"filip@...","name":"Filip","role":"ESTUDIANTE"}]
```

### **2. Test con Postman/Thunder Client**

```
Method: GET
URL: https://proyectoia-backend.onrender.com/users/search
Query Params:
  - email: filip
  - role: ESTUDIANTE
  - limit: 10

Expected Status: 200 OK
Expected Body: Array de usuarios
```

---

## 📊 Base de Datos

### **Asegúrate de tener un índice en `email`:**

```prisma
// schema.prisma

model User {
  id    String @id @default(uuid())
  email String @unique
  name  String
  role  String
  
  @@index([email])  // ← Este índice mejora el rendimiento
}
```

Si no tienes el índice, créalo:

```sql
-- PostgreSQL
CREATE INDEX idx_users_email ON users(email);
```

---

## ⚠️ Consideraciones Importantes

### **1. CORS**

Asegúrate de que tu backend acepta requests desde:
```
https://tu-frontend.vercel.app
```

```typescript
// En tu app.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'https://tu-frontend.vercel.app',
    'http://localhost:3000' // Para desarrollo local
  ]
}));
```

### **2. Autenticación (Opcional)**

Si quieres que solo usuarios autenticados puedan buscar:

```typescript
import { authenticate } from './middleware/auth';

router.get('/search', authenticate, async (req, res) => {
  // ... mismo código ...
});
```

### **3. Rate Limiting (Recomendado)**

Previene abuso:

```typescript
import rateLimit from 'express-rate-limit';

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30 // 30 requests por minuto
});

router.get('/search', searchLimiter, async (req, res) => {
  // ... mismo código ...
});
```

---

## ✅ Checklist de Implementación

- [ ] Crear archivo `routes/users.ts`
- [ ] Copiar el código del endpoint `/search`
- [ ] Registrar ruta en `app.ts` con `app.use('/users', userRoutes)`
- [ ] Verificar que el modelo `User` tiene los campos: `id`, `email`, `name`, `role`
- [ ] (Opcional) Agregar índice a la columna `email`
- [ ] (Opcional) Agregar middleware de autenticación
- [ ] Hacer commit y push al repositorio
- [ ] Desplegar a producción (Render/Railway/Vercel)
- [ ] Probar con cURL: `curl "https://proyectoia-backend.onrender.com/users/search?email=test"`
- [ ] Verificar que funciona desde el frontend

---

## 🚀 Después de Implementar

1. **Commit y push:**
   ```bash
   git add .
   git commit -m "feat: agregar endpoint GET /users/search para autocomplete"
   git push origin main
   ```

2. **Render desplegará automáticamente** (5-10 minutos)

3. **Probar desde el frontend:**
   - Ve a la página de invitaciones
   - Escribe en el campo de email
   - Deberías ver sugerencias de usuarios

---

## 📞 Contacto

Si tienes dudas o problemas implementando:
- El endpoint DEBE responder en: `https://proyectoia-backend.onrender.com/users/search`
- Debe aceptar query parameters: `email`, `role`, `limit`
- Debe devolver un array de objetos con: `id`, `email`, `name`, `role`

---

## 🎯 Ejemplo Real del Frontend

El frontend hace esta llamada:

```typescript
const response = await fetch(
  `${API_BASE_URL}/users/search?email=${emailInput}&role=ESTUDIANTE&limit=10`
);
const users = await response.json();
// users = [{ id, email, name, role }, ...]
```

**Actualmente responde:** `404 Not Found`  
**Necesitamos que responda:** `200 OK` con array de usuarios

---

## ⏰ Prioridad

**🔴 ALTA** - Esta funcionalidad está implementada en el frontend pero bloqueada esperando este endpoint.
