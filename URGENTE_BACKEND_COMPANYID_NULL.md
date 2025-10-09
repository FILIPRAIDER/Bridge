# 🔴 URGENTE: Backend NO está devolviendo companyId en GET /users/:id

## 📋 Problema Reportado

**Dashboard de Empresario**: `/dashboard/empresario/profile`

**Síntoma**:
- El perfil NO muestra datos de la empresa
- Campos aparecen como "No especificado"
- Usuario SÍ completó el onboarding y creó su empresa

**Evidencia**:
```
Usuario: crunchyroll01022022@gmail.com (Empresario)
Empresa registrada: "Mi Empresa" (sector: Salud)
```

---

## 🔍 Diagnóstico Frontend

El frontend hace:

```typescript
// 1. Cargar usuario
const userData = await api.get(`/users/${userId}`);

console.log('companyId:', userData.companyId); // ❌ undefined o null

// 2. Si tiene companyId, cargar empresa
if (userData.companyId) {
  const company = await api.get(`/companies/${userData.companyId}`);
  // ✅ Muestra datos
} else {
  // ❌ No carga nada - muestra "No especificado"
}
```

**Resultado**: `userData.companyId` es `undefined` o `null`

---

## ✅ Solución Requerida: Backend

### **Verificar GET /users/:id**

**Debe devolver**:
```json
{
  "id": "cmgiw6p640004mazji8kolds4",
  "email": "crunchyroll01022022@gmail.com",
  "name": "Empresario",
  "role": "EMPRESARIO",
  "companyId": "company123", // ← 🔥 ESTE CAMPO ES CRÍTICO
  "profile": {
    "phone": "+57 324 569 3899",
    "country": "CO",
    "city": "Bogotá",
    "location": "Bogotá, CO"
  }
}
```

**Actualmente devuelve** (sospecha):
```json
{
  "id": "cmgiw6p640004mazji8kolds4",
  "email": "crunchyroll01022022@gmail.com",
  "name": "Empresario",
  "role": "EMPRESARIO",
  "companyId": null, // ❌ NULL o no incluido
  "profile": { ... }
}
```

---

### **Verificar Base de Datos**

```sql
-- ¿El usuario tiene companyId?
SELECT id, email, name, role, "companyId" 
FROM "User" 
WHERE email = 'crunchyroll01022022@gmail.com';

-- Resultado esperado:
-- companyId: "cm..." (un ID válido)

-- Si companyId es NULL, verificar:
-- ¿Se creó la empresa?
SELECT id, name, sector, "createdAt" 
FROM "Company" 
WHERE name = 'Mi Empresa';

-- Si la empresa existe pero el usuario no tiene companyId:
-- ❌ PROBLEMA: La vinculación no se hizo
```

---

### **Fix: Endpoint POST /companies**

**Código actual** (backend):
```javascript
app.post('/companies', async (req, res) => {
  const { name, sector, website, about, userId } = req.body;

  // Crear empresa
  const company = await prisma.company.create({
    data: { name, sector, website, about }
  });

  // ❌ FALTA: Vincular empresa al usuario
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { companyId: company.id }
  // });

  res.json(company);
});
```

**Código correcto**:
```javascript
app.post('/companies', async (req, res) => {
  const { name, sector, website, about, userId } = req.body;

  // Crear empresa
  const company = await prisma.company.create({
    data: { name, sector, website, about }
  });

  // ✅ Vincular empresa al usuario
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { companyId: company.id }
    });
    console.log(`✅ Empresa "${name}" vinculada al usuario ${userId}`);
  }

  res.json(company);
});
```

---

### **Fix: Endpoint GET /users/:id**

**Código actual** (sospecha):
```javascript
app.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      profile: true,
      // ❌ No incluye companyId en el select
    }
  });
  res.json(user);
});
```

**Código correcto**:
```javascript
app.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      profile: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true, // ✅ Incluir explícitamente
      profile: true,
      teamMemberships: true,
    }
  });
  res.json(user);
});
```

---

## 🧪 Testing

### **Test 1: Verificar GET /users/:id**

```bash
GET https://proyectoia-backend.onrender.com/users/cmgiw6p640004mazji8kolds4

# ✅ Debe incluir:
{
  "companyId": "cm..." // No null, no undefined
}
```

### **Test 2: Verificar Vinculación**

```sql
-- Verificar que el usuario tenga companyId
SELECT 
  u.id,
  u.email,
  u."companyId",
  c.name as company_name
FROM "User" u
LEFT JOIN "Company" c ON u."companyId" = c.id
WHERE u.email = 'crunchyroll01022022@gmail.com';

-- ✅ Debe mostrar:
-- companyId: cm...
-- company_name: Mi Empresa
```

### **Test 3: Probar en Frontend**

Después del fix backend:
1. Ir a: https://cresia-app.vercel.app/dashboard/empresario/profile
2. Abrir DevTools → Console
3. Buscar log:
   ```
   [EmpresarioProfile] 📊 Datos recibidos: {
     hasCompanyId: true,  // ✅ Debe ser true
     companyId: "cm...",
   }
   [EmpresarioProfile] ✅ Empresa cargada: {
     name: "Mi Empresa",
     sector: "Salud",
     ...
   }
   ```
4. Verificar que los campos se llenan automáticamente

---

## 🎯 Resumen

**Problema**: Backend NO devuelve `companyId` en GET /users/:id

**Causa posible**:
1. Campo `companyId` no incluido en el `select`
2. O la vinculación no se hizo al crear la empresa

**Solución**:
1. ✅ Verificar que POST /companies actualice `User.companyId`
2. ✅ Verificar que GET /users/:id incluya `companyId` en la respuesta
3. ✅ Verificar en DB que el usuario tenga `companyId` no null

**Frontend**: Ya implementado correctamente
- ✅ Envía `userId` al crear empresa
- ✅ Verifica `companyId` antes de cargar empresa
- ✅ Logs de debugging agregados

---

## 📞 Logs de Debugging (Frontend)

Para ver qué está devolviendo el backend, revisar en Console:

```
[EmpresarioProfile] 🔍 Cargando datos del usuario: cmgiw6p640004mazji8kolds4
[EmpresarioProfile] 📊 Datos recibidos: {
  hasProfile: true,
  hasCompanyId: false,  // ❌ FALSE = Problema
  companyId: null,      // ❌ NULL = Backend no lo devuelve
  profile: {...}
}
[EmpresarioProfile] ⚠️ Usuario no tiene companyId vinculado
```

---

**Fecha**: 9 de Octubre, 2025  
**Prioridad**: 🔴 CRÍTICA  
**Bloqueador**: Dashboard empresario no funcional  
**Responsable**: Backend Team
