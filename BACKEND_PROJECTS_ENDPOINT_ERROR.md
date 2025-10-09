# 🚨 ERROR CRÍTICO: Endpoint /projects con Prisma Validation Error

## Para: Backend Core Team
## De: Frontend Team
## Fecha: 9 de Octubre, 2025
## Status: 🔴 BLOQUEANDO PÁGINA DE PROYECTOS

---

## 🎯 Problema

El endpoint `GET /projects?companyId={id}` está fallando con error 400 debido a validación de Prisma.

### Request
```
GET https://proyectoia-backend.onrender.com/projects?companyId=cmgiy2gdz0000e8md6plp9rgl
```

### Response (400 Bad Request)
```json
{
  "error": {
    "message": "Error de validación en la consulta a base de datos",
    "details": {
      "details": "Invalid `prisma.project.findMany()` invocation:",
      "fullError": "\nInvalid `prisma.project.findMany()` invocation:\n\n{\n  where: {},\n  orderBy: [\n    {\n      undefined: undefined\n    }\n  ],\n  skip: NaN,\n  select: {\n    id: true,\n    title: true,\n    status: true,\n    city: true,\n    area: true,\n    company: {\n      select: {\n        id: true,\n        name: true\n      }\n    },\n    _count: {\n      select: {\n        assignments: true\n      }\n    }\n  },\n+ take: Int\n}\n\nArgument `take` is missing."
    }
  }
}
```

---

## 🐛 Causas del Error

### 1. **`take` es obligatorio pero no se está enviando**
```javascript
// Prisma requiere
{
  take: Int  // ❌ FALTA
}
```

### 2. **`skip` es `NaN` (Not a Number)**
```javascript
{
  skip: NaN  // ❌ Debería ser un número o undefined
}
```

### 3. **`orderBy` tiene `undefined: undefined`**
```javascript
{
  orderBy: [{
    undefined: undefined  // ❌ Campo de ordenamiento no definido
  }]
}
```

### 4. **`where` está vacío a pesar de `companyId` en query**
```javascript
{
  where: {}  // ❌ Debería ser { companyId: "..." }
}
```

---

## ✅ Solución Requerida

### Opción 1: Usar Query Parameters (Recomendado)
```javascript
// Endpoint: GET /projects?companyId=xxx&page=1&limit=10

app.get('/projects', async (req, res) => {
  const { companyId, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
  
  // Validar companyId
  if (!companyId) {
    return res.status(400).json({ error: 'companyId is required' });
  }

  // Parsear números correctamente
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Validar que no sean NaN
  if (isNaN(pageNum) || isNaN(limitNum)) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        companyId: companyId  // ✅ Usar el companyId del query
      },
      orderBy: {
        [sortBy]: order  // ✅ Usar field válido, no undefined
      },
      skip: skip,        // ✅ Número válido, no NaN
      take: limitNum,    // ✅ REQUIRED por Prisma
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        budget: true,
        createdAt: true,
        city: true,
        area: true,
        company: {
          select: {
            id: true,
            name: true
          }
        },
        sectors: {
          select: {
            sector: {
              select: {
                id: true,
                nameEs: true
              }
            }
          }
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    });

    // Transformar la respuesta
    const formattedProjects = projects.map(project => ({
      ...project,
      sectors: project.sectors?.map(s => s.sector) || [],
      skills: project.skills?.map(s => s.skill) || [],
      teamsCount: project._count.assignments
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Opción 2: Ruta Específica
```javascript
// Endpoint: GET /companies/:companyId/projects

app.get('/companies/:companyId/projects', async (req, res) => {
  const { companyId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || isNaN(limitNum)) {
    return res.status(400).json({ error: 'Invalid pagination' });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      // ... same select as above
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔍 Checklist de Validación

Antes de hacer el query de Prisma, verificar:

```javascript
// 1. companyId existe y es válido
if (!companyId || typeof companyId !== 'string') {
  return res.status(400).json({ error: 'Invalid companyId' });
}

// 2. Parsear page y limit correctamente
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 10;

// 3. Validar que no sean NaN
if (isNaN(page) || isNaN(limit)) {
  return res.status(400).json({ error: 'Invalid pagination parameters' });
}

// 4. Calcular skip correctamente
const skip = (page - 1) * limit;

// 5. Definir orderBy con campo válido
const validSortFields = ['createdAt', 'title', 'status'];
const sortBy = validSortFields.includes(req.query.sortBy) 
  ? req.query.sortBy 
  : 'createdAt';

const orderBy = { [sortBy]: req.query.order === 'asc' ? 'asc' : 'desc' };

// 6. Usar en Prisma
const projects = await prisma.project.findMany({
  where: { companyId },
  orderBy,
  skip,
  take: limit,  // ✅ SIEMPRE incluir take
  // ...
});
```

---

## 📊 Response Esperado

### Request
```
GET /projects?companyId=cmgiy2gdz0000e8md6plp9rgl&page=1&limit=10
```

### Response (200 OK)
```json
[
  {
    "id": "proj_123",
    "title": "Tienda Online",
    "description": "E-commerce para venta de productos",
    "status": "PLANNING",
    "budget": 30000000,
    "createdAt": "2025-10-09T01:20:00.000Z",
    "city": "Bogotá",
    "area": "Cundinamarca",
    "company": {
      "id": "cmgiy2gdz0000e8md6plp9rgl",
      "name": "Mi Empresa"
    },
    "sectors": [
      {
        "id": "sector_1",
        "nameEs": "E-commerce"
      }
    ],
    "skills": [
      {
        "name": "React"
      },
      {
        "name": "Node.js"
      }
    ],
    "teamsCount": 3
  }
]
```

---

## 🚨 Impacto

- ❌ Página de proyectos del empresario completamente rota
- ❌ No se pueden ver proyectos creados
- ❌ 400 Bad Request en cada carga de página
- ❌ UX degradada (usuarios piensan que no tienen proyectos)

---

## 🔧 Workaround Temporal (Frontend)

Mientras se arregla el backend, el frontend:
1. ✅ Maneja el error gracefully (muestra estado vacío)
2. ✅ No crashea la app
3. ⏳ Puede intentar endpoint alternativo si existe

```typescript
// Frontend workaround
try {
  const data = await api.get<Project[]>(`/projects?companyId=${companyId}`);
  setProjects(data);
} catch (error) {
  console.error("Error loading projects:", error);
  // Gracefully degrade to empty state
  setProjects([]);
}
```

---

## ✅ Testing Post-Fix

### Test 1: Sin proyectos
```
GET /projects?companyId=xxx
→ Response: []
→ Status: 200 OK
```

### Test 2: Con proyectos
```
GET /projects?companyId=xxx
→ Response: [{ id, title, ... }]
→ Status: 200 OK
```

### Test 3: Sin companyId
```
GET /projects
→ Response: { error: "companyId is required" }
→ Status: 400 Bad Request
```

### Test 4: Paginación
```
GET /projects?companyId=xxx&page=2&limit=5
→ Response: [proyectos 6-10]
→ Status: 200 OK
```

---

## 🎯 Archivos a Modificar (Backend Core)

Probablemente en:
- `src/routes/projects.js` o `src/routes/projects.ts`
- `src/controllers/projectsController.js`
- `src/services/projectsService.js`

Buscar el handler de `GET /projects` y arreglar:
1. ✅ Parsear `companyId` del query
2. ✅ Validar y parsear `page` y `limit`
3. ✅ Calcular `skip` correctamente (no NaN)
4. ✅ Definir `orderBy` con campo válido
5. ✅ **SIEMPRE incluir `take`** en Prisma query
6. ✅ Usar `companyId` en `where` clause

---

## 📞 Urgencia

**Prioridad**: 🔴 ALTA  
**Bloqueante**: Sí (página de proyectos no funciona)  
**ETA Esperado**: Lo antes posible  
**Workaround Disponible**: Sí (frontend muestra estado vacío)

---

**Reportado por**: Frontend Team  
**Fecha**: 9 de Octubre, 2025, 1:30 AM  
**Status**: 🔴 ESPERANDO FIX EN BACKEND CORE
