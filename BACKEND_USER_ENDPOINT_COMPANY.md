# 🔧 Backend: Endpoint `/users/:id` debe incluir `companyId`

## 📋 Problema Identificado

Cuando un **empresario** completa su onboarding:
1. Se crea la empresa en `/companies`
2. Se guarda el perfil en `/users/:id/profile`
3. **PERO** el backend **NO vincula** el `companyId` al usuario

Entonces cuando el frontend hace `GET /users/:id`, **NO puede saber qué empresa pertenece al usuario**.

---

## ✅ Solución Requerida

### **1. Al crear la empresa, vincularla al usuario**

Cuando el frontend hace:
```typescript
POST /companies
{
  "name": "Mi Empresa S.A.S",
  "sector": "technology",
  "website": "https://empresa.com",
  "about": "Descripción..."
}
```

El backend debe:
1. Crear la empresa
2. **Actualizar el usuario con `companyId`**

```javascript
// Backend en Express + Prisma
app.post('/companies', async (req, res) => {
  const { name, sector, website, about } = req.body;
  const userId = req.user.id; // Del token JWT/sesión

  // 1. Crear empresa
  const company = await prisma.company.create({
    data: { name, sector, website, about }
  });

  // 🔥 2. Vincular empresa al usuario
  await prisma.user.update({
    where: { id: userId },
    data: { companyId: company.id }
  });

  res.json({ id: company.id });
});
```

---

### **2. Endpoint GET /users/:id debe incluir companyId**

Cuando el frontend hace:
```typescript
GET /users/:id
```

El backend debe responder:
```json
{
  "id": "user123",
  "email": "empresario@example.com",
  "name": "Juan Pérez",
  "role": "EMPRESARIO",
  "companyId": "company456",  // 🔥 ESTO ES CLAVE
  "profile": {
    "phone": "+57 300 123 4567",
    "country": "CO",
    "city": "Bogotá",
    "location": "Bogotá, CO",
    "birthdate": "2020-03-15T00:00:00.000Z"
  }
}
```

**Código backend sugerido**:
```javascript
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,  // Incluir perfil
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,  // 🔥 Incluir companyId
      profile: true,
      teamMemberships: true,
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json(user);
});
```

---

### **3. Endpoint GET /companies/:id debe funcionar correctamente**

Cuando el frontend hace:
```typescript
GET /companies/:companyId
```

El backend debe responder:
```json
{
  "id": "company456",
  "name": "Mi Empresa S.A.S",
  "sector": "technology",
  "website": "https://empresa.com",
  "about": "Descripción de la empresa...",
  "createdAt": "2025-10-08T12:00:00.000Z"
}
```

**Código backend sugerido**:
```javascript
app.get('/companies/:id', async (req, res) => {
  const { id } = req.params;

  const company = await prisma.company.findUnique({
    where: { id }
  });

  if (!company) {
    return res.status(404).json({ error: 'Empresa no encontrada' });
  }

  res.json(company);
});
```

---

### **4. Endpoint PATCH /companies/:id para actualizar**

Cuando el empresario edita su perfil:
```typescript
PATCH /companies/:id
{
  "name": "Nuevo Nombre",
  "sector": "finance",
  "website": "https://nueva-web.com",
  "about": "Nueva descripción"
}
```

El backend debe actualizar solo los campos enviados:
```javascript
app.patch('/companies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sector, website, about } = req.body;

  // Construir payload solo con campos definidos
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (sector !== undefined) updateData.sector = sector;
  if (website !== undefined) updateData.website = website;
  if (about !== undefined) updateData.about = about;

  const company = await prisma.company.update({
    where: { id },
    data: updateData
  });

  res.json(company);
});
```

---

## 🎯 Resumen de Cambios Backend

| Endpoint | Método | Cambio Requerido |
|----------|--------|------------------|
| `/companies` | POST | Después de crear, actualizar `user.companyId` |
| `/users/:id` | GET | Incluir `companyId` en la respuesta |
| `/companies/:id` | GET | Debe funcionar correctamente |
| `/companies/:id` | PATCH | Permitir actualizar campos opcionales |

---

## ✅ Frontend Ya Actualizado

El frontend ahora:
1. ✅ Crea el perfil PRIMERO (evita empresas huérfanas)
2. ✅ Luego crea la empresa con el endpoint `/companies`
3. ✅ Espera que `/users/:id` devuelva `companyId`
4. ✅ Usa `companyId` para cargar la empresa con `/companies/:companyId`
5. ✅ Permite editar con `/companies/:id` (PATCH)

---

## 🧪 Para Probar

Después de implementar los cambios backend:

1. **Registrarse como empresario** → Completar onboarding
2. **Verificar en DB**: `User.companyId` debe tener un valor
3. **Ir a perfil empresario**: `/dashboard/empresario/profile`
4. **Verificar que cargue**: Nombre empresa, sector, website, ubicación
5. **Editar y guardar**: Debe actualizar correctamente

---

## 📁 Estructura de Base de Datos Esperada

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role
  companyId String?  // 🔥 Campo clave para empresarios
  company   Company? @relation(fields: [companyId], references: [id])
  profile   Profile?
}

model Company {
  id        String   @id @default(cuid())
  name      String
  sector    String?
  website   String?
  about     String?
  users     User[]   // Relación inversa
  createdAt DateTime @default(now())
}

model Profile {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  phone          String?
  country        String?
  city           String?
  location       String?
  birthdate      DateTime?
  documentNumber String?
  identityType   String?
}
```

---

## 🚨 Importante

Sin el campo `companyId` en el usuario, el frontend **NO puede cargar la información de la empresa** en el dashboard de empresario.

Por favor, implementar estos cambios en el backend para que el flujo completo funcione.
