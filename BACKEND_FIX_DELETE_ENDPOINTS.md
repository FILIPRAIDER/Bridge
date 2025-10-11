# 🔧 CORRECCIÓN URGENTE: Endpoints DELETE

**Fecha:** 11 de Octubre, 2025  
**Prioridad:** 🔴 ALTA - Bug en producción  
**Tipo:** Backend Fix

---

## 🐛 PROBLEMA DETECTADO

Los endpoints de **DELETE** están causando errores en el frontend:

### Error en Skills:
```
Relación user-skill no encontrada
```

### Error en Certificaciones:
```
Failed to execute 'json' on 'Response': 
Unexpected end of JSON input
```

---

## 🔍 CAUSA RAÍZ

### 1. **Respuesta vacía sin Content-Type**

Los endpoints DELETE están devolviendo respuestas vacías, pero el frontend intenta parsear JSON:

**Problema:**
```javascript
// Frontend intenta hacer:
await api.delete(`/users/${userId}/skills/${id}`);
// Espera JSON, pero recibe respuesta vacía
```

**Solución aplicada en frontend:**
```typescript
// Ahora detecta respuestas vacías
if (res.status === 204 || contentLength === "0" || !contentType?.includes("application/json")) {
  return {} as T;
}
```

### 2. **Relaciones no encontradas**

El backend está buscando relaciones incorrectamente o devolviendo errores genéricos.

---

## ✅ SOLUCIONES REQUERIDAS

### Solución 1: Devolver Status 204 No Content

**Recomendación:** Los endpoints DELETE deberían devolver `204 No Content` sin body:

```typescript
// ❌ ANTES (malo)
app.delete('/users/:userId/skills/:id', async (req, res) => {
  await deleteUserSkill(req.params.id);
  res.json({ message: 'Deleted' }); // ❌ No necesario
});

// ✅ DESPUÉS (bueno)
app.delete('/users/:userId/skills/:id', async (req, res) => {
  await deleteUserSkill(req.params.id);
  res.status(204).send(); // ✅ Status 204 sin body
});
```

---

### Solución 2: Mejorar Búsqueda de Relaciones

**Endpoints afectados:**
- `DELETE /users/:userId/skills/:id`
- `DELETE /users/:userId/certifications/:id`
- `DELETE /users/:userId/experiences/:id` (potencialmente)

**Problema actual:**
```typescript
// ❌ Busca solo por ID, ignora userId
const userSkill = await db.userSkill.findUnique({
  where: { id: req.params.id }
});
```

**Solución correcta:**
```typescript
// ✅ Verifica que pertenezca al usuario
const userSkill = await db.userSkill.findFirst({
  where: { 
    id: req.params.id,
    userId: req.params.userId // ✅ Verificar ownership
  }
});

if (!userSkill) {
  return res.status(404).json({ 
    error: { 
      message: 'Skill no encontrado o no pertenece al usuario' 
    } 
  });
}

await db.userSkill.delete({
  where: { id: userSkill.id }
});

res.status(204).send(); // ✅ Respuesta correcta
```

---

## 📋 CHECKLIST DE CORRECCIONES

### DELETE /users/:userId/skills/:id

- [ ] Verificar que el skill pertenece al usuario (findFirst con userId)
- [ ] Devolver 404 si no existe o no pertenece al usuario
- [ ] Devolver 204 No Content al eliminar exitosamente
- [ ] NO enviar body en la respuesta

**Código esperado:**
```typescript
router.delete('/users/:userId/skills/:id', async (req, res) => {
  try {
    const userSkill = await prisma.userSkill.findFirst({
      where: { 
        id: req.params.id,
        userId: req.params.userId
      }
    });

    if (!userSkill) {
      return res.status(404).json({
        error: { message: 'Skill no encontrado' }
      });
    }

    await prisma.userSkill.delete({
      where: { id: userSkill.id }
    });

    res.status(204).send(); // ✅ Sin body
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({
      error: { message: 'Error al eliminar skill' }
    });
  }
});
```

---

### DELETE /users/:userId/certifications/:id

- [ ] Verificar que la certificación pertenece al usuario
- [ ] Devolver 404 si no existe o no pertenece al usuario
- [ ] Devolver 204 No Content al eliminar exitosamente
- [ ] NO enviar body en la respuesta

**Código esperado:**
```typescript
router.delete('/users/:userId/certifications/:id', async (req, res) => {
  try {
    const certification = await prisma.certification.findFirst({
      where: { 
        id: req.params.id,
        userId: req.params.userId
      }
    });

    if (!certification) {
      return res.status(404).json({
        error: { message: 'Certificación no encontrada' }
      });
    }

    // Opcional: Eliminar archivo de ImageKit si existe
    if (certification.fileUrl) {
      // await deleteFromImageKit(certification.fileUrl);
    }

    await prisma.certification.delete({
      where: { id: certification.id }
    });

    res.status(204).send(); // ✅ Sin body
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({
      error: { message: 'Error al eliminar certificación' }
    });
  }
});
```

---

### DELETE /users/:userId/experiences/:id

- [ ] Verificar que la experiencia pertenece al usuario
- [ ] Devolver 404 si no existe o no pertenece al usuario
- [ ] Devolver 204 No Content al eliminar exitosamente
- [ ] NO enviar body en la respuesta

**Código esperado:**
```typescript
router.delete('/users/:userId/experiences/:id', async (req, res) => {
  try {
    const experience = await prisma.experience.findFirst({
      where: { 
        id: req.params.id,
        userId: req.params.userId
      }
    });

    if (!experience) {
      return res.status(404).json({
        error: { message: 'Experiencia no encontrada' }
      });
    }

    await prisma.experience.delete({
      where: { id: experience.id }
    });

    res.status(204).send(); // ✅ Sin body
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({
      error: { message: 'Error al eliminar experiencia' }
    });
  }
});
```

---

## 🎯 PATRÓN RECOMENDADO PARA TODOS LOS DELETES

```typescript
// ✅ Patrón estándar para DELETE endpoints
async function deleteResource(req, res) {
  try {
    // 1. Verificar que el recurso existe y pertenece al usuario
    const resource = await db.model.findFirst({
      where: { 
        id: req.params.id,
        userId: req.params.userId // O la relación correspondiente
      }
    });

    // 2. Si no existe, devolver 404
    if (!resource) {
      return res.status(404).json({
        error: { message: 'Recurso no encontrado' }
      });
    }

    // 3. Eliminar el recurso
    await db.model.delete({
      where: { id: resource.id }
    });

    // 4. Devolver 204 sin body
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      error: { message: 'Error al eliminar' }
    });
  }
}
```

---

## 🧪 TESTING

### Casos de prueba:

#### 1. **DELETE exitoso**
```bash
DELETE /users/123/skills/456
Authorization: Bearer <token>

# Respuesta esperada:
Status: 204 No Content
Body: (vacío)
```

#### 2. **Recurso no existe**
```bash
DELETE /users/123/skills/999
Authorization: Bearer <token>

# Respuesta esperada:
Status: 404 Not Found
Body: {
  "error": {
    "message": "Skill no encontrado"
  }
}
```

#### 3. **Recurso no pertenece al usuario**
```bash
DELETE /users/123/skills/789
Authorization: Bearer <token>

# Respuesta esperada:
Status: 404 Not Found
Body: {
  "error": {
    "message": "Skill no encontrado"
  }
}
```

#### 4. **Usuario no autenticado**
```bash
DELETE /users/123/skills/456
# Sin Authorization header

# Respuesta esperada:
Status: 401 Unauthorized
Body: {
  "error": {
    "message": "No autenticado"
  }
}
```

---

## 🔒 SEGURIDAD

### Verificaciones obligatorias:

1. **Autenticación:** Usuario debe estar logueado
2. **Autorización:** Usuario solo puede eliminar sus propios recursos
3. **Ownership:** Verificar que el recurso pertenece al usuario
4. **Validación:** IDs deben ser UUIDs válidos

**Ejemplo de middleware:**
```typescript
// Middleware de autenticación
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: { message: 'No autenticado' }
    });
  }
  next();
}

// Middleware de autorización
function requireOwnership(req, res, next) {
  if (req.params.userId !== req.user.id) {
    return res.status(403).json({
      error: { message: 'No autorizado' }
    });
  }
  next();
}

// Uso:
router.delete('/users/:userId/skills/:id', 
  requireAuth, 
  requireOwnership, 
  deleteUserSkill
);
```

---

## 📊 IMPACTO

### Usuarios afectados:
- ✅ Todos los usuarios que intenten eliminar skills
- ✅ Todos los usuarios que intenten eliminar certificaciones
- ✅ Potencialmente experiencias (mismo patrón)

### Criticidad:
- 🔴 **Alta**: Funcionalidad básica no funciona
- ⚠️ **UX**: Usuarios ven errores técnicos confusos
- 🔐 **Seguridad**: Posible bypass de ownership check

---

## 🚀 DEPLOYMENT

### Prioridad de corrección:

1. **Inmediato:**
   - [ ] DELETE /users/:userId/skills/:id
   - [ ] DELETE /users/:userId/certifications/:id

2. **Verificar también:**
   - [ ] DELETE /users/:userId/experiences/:id
   - [ ] DELETE /teams/:teamId/members/:memberId
   - [ ] Cualquier otro endpoint DELETE

3. **Testing:**
   - [ ] Test unitarios para cada endpoint
   - [ ] Test de ownership
   - [ ] Test de status codes

---

## 📝 RESUMEN

### Cambios requeridos:

1. ✅ **Devolver 204 No Content** en todos los DELETE exitosos
2. ✅ **Verificar ownership** antes de eliminar
3. ✅ **NO enviar body** en respuestas 204
4. ✅ **Devolver 404** cuando no existe o no pertenece al usuario
5. ✅ **Logs** para debugging

### Patrón esperado:
```typescript
// findFirst + verificar userId → 404 si no existe → delete → 204
```

---

## 📞 CONTACTO

Si tienes dudas sobre la implementación:
- Revisar este documento
- Seguir el patrón recomendado
- Probar con Postman/Thunder Client

---

**Estado:** 🔴 PENDIENTE IMPLEMENTACIÓN  
**Prioridad:** ALTA  
**Tiempo estimado:** 1-2 horas  
**Complejidad:** Baja (cambios simples pero críticos)
