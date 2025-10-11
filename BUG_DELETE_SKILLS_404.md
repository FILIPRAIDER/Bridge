# 🐛 Bug Report: DELETE /users/:userId/skills/:userSkillId Retorna 404

**Fecha:** 11 de Octubre, 2025  
**Severidad:** 🔴 Alta - Funcionalidad crítica no funciona  
**Status:** 🔍 Investigación requerida

---

## 📋 Resumen

El endpoint DELETE `/users/:userId/skills/:userSkillId` está retornando **404 Not Found** cuando debería retornar **204 No Content** al eliminar exitosamente un skill.

---

## 🔬 Detalles del Error

### Request
```
DELETE http://localhost:4001/users/cmghgdt9q0001gu6ze0fyd7hs/skills/cmgk0zai600028lgo9srqq40l
```

### Response
```json
Status: 404 Not Found

{
  "error": {
    "message": "Skill no encontrado o no pertenece al usuario",
    "_dev": {
      "timestamp": "2025-10-11T14:04:50.486Z",
      "request": {
        "method": "DELETE",
        "url": "/users/cmghgdt9q0001gu6ze0fyd7hs/skills/cmgk0zai600028lgo9srqq40l",
        "ip": "::1",
        "userAgent": "Mozilla/5.0..."
      },
      "stack": [
        "HttpError: Skill no encontrado o no pertenece al usuario",
        "at file:///C:/Users/filip/OneDrive/Desktop/ProyectoIA/src/routes/users.route.js:267:19"
      ]
    }
  }
}
```

---

## 🤔 Análisis

### IDs Involucrados
- **userId:** `cmghgdt9q0001gu6ze0fyd7hs`
- **userSkillId:** `cmgk0zai600028lgo9srqq40l`

### Posibles Causas

1. **❌ Query de verificación incorrecta**
   - El backend puede estar buscando en la tabla/relación incorrecta
   - Posiblemente está usando `skillId` en vez de `userSkillId` (id de la relación)

2. **❌ Datos inconsistentes en DB**
   - El UserSkill existe pero tiene referencias rotas
   - El userId en el UserSkill no coincide con el usuario autenticado

3. **❌ Double-delete** (menos probable)
   - El skill ya fue eliminado en una request anterior
   - No hay idempotencia en el endpoint

---

## ✅ Comportamiento Esperado

Según `FRONTEND_DELETE_QUICK_REFERENCE.md`:

```typescript
// ✅ ÉXITO
Status: 204 No Content
Body: (vacío)

// ❌ NO ENCONTRADO O NO PERTENECE
Status: 404 Not Found
Body: { error: { message: "Recurso no encontrado o no pertenece al usuario" } }
```

**El 404 está correcto SI:**
- El UserSkill realmente no existe
- El UserSkill pertenece a otro usuario

**El 404 es un BUG SI:**
- El UserSkill existe y pertenece al usuario correcto
- La query está mal formulada

---

## 🔍 Verificaciones Necesarias (Backend)

### 1. Verificar que el UserSkill existe
```sql
-- Prisma Studio o SQL directo
SELECT * FROM UserSkill 
WHERE id = 'cmgk0zai600028lgo9srqq40l';
```

**Esperado:**
```json
{
  "id": "cmgk0zai600028lgo9srqq40l",
  "userId": "cmghgdt9q0001gu6ze0fyd7hs",
  "skillId": "...",
  "level": 3
}
```

### 2. Revisar la query del endpoint DELETE

**Código actual (línea 267 en users.route.js):**
```javascript
// ❌ POSIBLEMENTE INCORRECTO
const userSkill = await prisma.userSkill.findFirst({
  where: {
    id: req.params.skillId,  // ⚠️ ¿Debería ser userSkillId?
    userId: req.params.userId
  }
});

if (!userSkill) {
  throw new HttpError(404, "Skill no encontrado o no pertenece al usuario");
}
```

**Código correcto esperado:**
```javascript
// ✅ CORRECTO
const userSkill = await prisma.userSkill.findUnique({
  where: {
    id: req.params.userSkillId  // ← Este es el ID de la relación UserSkill
  }
});

// Verificar ownership
if (!userSkill || userSkill.userId !== req.params.userId) {
  throw new HttpError(404, "Skill no encontrado o no pertenece al usuario");
}

// Eliminar
await prisma.userSkill.delete({
  where: { id: req.params.userSkillId }
});

res.status(204).send();
```

### 3. Verificar el nombre del parámetro en la ruta

**Route definition:**
```javascript
// ⚠️ Verificar que sea:
router.delete('/users/:userId/skills/:userSkillId', ...)

// Y NO:
router.delete('/users/:userId/skills/:skillId', ...)  // ← Esto sería incorrecto
```

---

## 🛠️ Fix Sugerido (Backend)

### Archivo: `src/routes/users.route.js` (línea ~267)

```javascript
// DELETE /users/:userId/skills/:userSkillId
router.delete('/users/:userId/skills/:userSkillId', async (req, res) => {
  try {
    const { userId, userSkillId } = req.params;
    
    console.log('🗑️ DELETE UserSkill:', { userId, userSkillId });
    
    // 1. Buscar el UserSkill
    const userSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId }
    });
    
    // 2. Verificar existencia y ownership
    if (!userSkill) {
      console.warn('⚠️ UserSkill no encontrado:', userSkillId);
      return res.status(404).json({
        error: {
          message: "Skill no encontrado"
        }
      });
    }
    
    if (userSkill.userId !== userId) {
      console.warn('⚠️ UserSkill no pertenece al usuario:', { userSkillId, userSkill, userId });
      return res.status(404).json({
        error: {
          message: "Skill no pertenece al usuario"
        }
      });
    }
    
    // 3. Eliminar
    await prisma.userSkill.delete({
      where: { id: userSkillId }
    });
    
    console.log('✅ UserSkill eliminado:', userSkillId);
    
    // 4. Retornar 204 No Content (sin body)
    res.status(204).send();
    
  } catch (error) {
    console.error('❌ Error en DELETE UserSkill:', error);
    res.status(500).json({
      error: {
        message: "Error al eliminar skill"
      }
    });
  }
});
```

---

## 📝 Checklist para Backend

- [ ] Verificar que el UserSkill `cmgk0zai600028lgo9srqq40l` existe en la BD
- [ ] Confirmar que el userId del UserSkill coincide con `cmghgdt9q0001gu6ze0fyd7hs`
- [ ] Revisar el nombre del parámetro en la ruta (¿es `:userSkillId` o `:skillId`?)
- [ ] Verificar la query en línea 267 de `users.route.js`
- [ ] Asegurar que se use `findUnique({ where: { id: userSkillId } })`
- [ ] Confirmar que se retorna `204 No Content` en caso de éxito
- [ ] Aplicar mismo fix a `/certifications/:certId` y `/experiences/:expId`
- [ ] Agregar logs de debug para troubleshooting futuro
- [ ] Test manual: crear skill → eliminarlo → verificar 204
- [ ] Test manual: intentar eliminar skill inexistente → verificar 404

---

## 🎯 Endpoints Afectados (aplicar mismo fix)

1. ✅ `DELETE /users/:userId/skills/:userSkillId`
2. ✅ `DELETE /users/:userId/certifications/:certId`
3. ✅ `DELETE /users/:userId/experiences/:expId`

---

## 📊 Impact

- **Users Affected:** Todos los usuarios que intenten eliminar skills/certificaciones/experiencias
- **Severity:** Alta - Funcionalidad básica CRUD no funciona
- **Workaround:** Ninguno (el frontend ya maneja el error correctamente)

---

## 🔗 Referencias

- Ver: `FRONTEND_DELETE_QUICK_REFERENCE.md`
- Ver: `BACKEND_FIX_DELETE_ENDPOINTS.md`
- Stack trace: `users.route.js:267:19`

---

**Próximo paso:** Backend team debe investigar y corregir el endpoint.
**Status del Frontend:** ✅ Listo - Maneja el error correctamente, espera 204 en éxito.
