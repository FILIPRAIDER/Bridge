# 🔴 URGENTE: Agregar `requireAuth` a Endpoints de Áreas

**Fecha:** 12 de octubre de 2025  
**Problema:** Error 401 al crear/editar/eliminar áreas  
**Causa:** Endpoints **NO tienen** middleware `requireAuth`

---

## 🎯 SITUACIÓN ACTUAL

### ✅ Frontend está 100% correcto:

```
✅ Token JWT existe en sesión (252 caracteres)
✅ Token se envía en TODAS las peticiones
✅ Header correcto: Authorization: Bearer eyJhbGci...
```

**Evidencia de consola:**
```javascript
[useAreas] Token info: {
  hasToken: true, 
  tokenLength: 252, 
  tokenStart: 'eyJhbGciOiJIUzI1NiIs...'
}

[useAreas] Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### ❌ Backend está rechazando con 401

```
POST http://localhost:4001/teams/cmghgdtiv0002gu6zbruvqg4t/areas
Status: 401 Unauthorized
```

**Razón:** El endpoint `POST /teams/:teamId/areas` **NO tiene** el middleware `requireAuth`.

---

## 📋 LO QUE EL BACKEND DEBE HACER

Según `RESPUESTA_JWT_IMPLEMENTADO.md`, el backend **solo agregó `requireAuth` a 1 endpoint:**

- ✅ `GET /teams/:teamId/areas` (funciona)

Pero **NO agregó `requireAuth`** a:

- ❌ `POST /teams/:teamId/areas` (crear área) ← **ESTE ES EL PROBLEMA**
- ❌ `PUT /teams/:teamId/areas/:areaId` (editar área)
- ❌ `DELETE /teams/:teamId/areas/:areaId` (eliminar área)
- ❌ `POST /teams/:teamId/areas/:areaId/members` (asignar miembro)
- ❌ `DELETE /teams/:teamId/areas/:areaId/members/:userId` (remover miembro)
- ❌ Y otros 10+ endpoints de files, messages, etc.

---

## ✅ SOLUCIÓN (2 MINUTOS)

### Archivo: `src/routes/areas.route.js`

#### **ANTES (Actual - Da 401):**
```javascript
router.post('/teams/:teamId/areas', requireTeamLeader, validateRequest(CreateAreaSchema), async (req, res) => {
  // ... código
});
```

#### **DESPUÉS (Correcto - Funcionará):**
```javascript
router.post('/teams/:teamId/areas', requireAuth, requireTeamLeader, validateRequest(CreateAreaSchema), async (req, res) => {
//                                    ^^^^^^^^^^^
//                                    AGREGAR ESTO
  // ... código
});
```

### Patrón para TODOS los endpoints:

```javascript
// Estructura correcta:
router.MÉTODO('RUTA', requireAuth, ...otrosMiddlewares, async (req, res) => {
//                     ^^^^^^^^^^^
//                     Siempre PRIMERO
});
```

---

## 📝 ENDPOINTS QUE NECESITAN `requireAuth`

### En `src/routes/areas.route.js`:

```javascript
// Áreas
router.post('/teams/:teamId/areas', requireAuth, requireTeamLeader, validateRequest(CreateAreaSchema), async (req, res) => { ... });
router.put('/teams/:teamId/areas/:areaId', requireAuth, requireTeamLeader, validateRequest(UpdateAreaSchema), async (req, res) => { ... });
router.delete('/teams/:teamId/areas/:areaId', requireAuth, requireTeamLeader, async (req, res) => { ... });

// Miembros de área
router.get('/teams/:teamId/areas/:areaId/members', requireAuth, async (req, res) => { ... });
router.post('/teams/:teamId/areas/:areaId/members', requireAuth, requireTeamLeader, validateRequest(AddMemberSchema), async (req, res) => { ... });
router.delete('/teams/:teamId/areas/:areaId/members/:userId', requireAuth, requireTeamLeader, async (req, res) => { ... });

// Archivos de área
router.get('/teams/:teamId/areas/:areaId/files', requireAuth, async (req, res) => { ... });
router.post('/teams/:teamId/areas/:areaId/files', requireAuth, upload.single('file'), async (req, res) => { ... });
router.delete('/teams/:teamId/areas/:areaId/files/:fileId', requireAuth, requireTeamLeader, async (req, res) => { ... });

// Mensajes de área
router.get('/teams/:teamId/areas/:areaId/messages', requireAuth, async (req, res) => { ... });
router.post('/teams/:teamId/areas/:areaId/messages', requireAuth, validateRequest(CreateMessageSchema), async (req, res) => { ... });
router.put('/teams/:teamId/areas/:areaId/messages/:messageId', requireAuth, async (req, res) => { ... });
router.delete('/teams/:teamId/areas/:areaId/messages/:messageId', requireAuth, async (req, res) => { ... });
```

---

## 🧪 CÓMO PROBAR QUE FUNCIONA

### Test 1: Sin Token (debe dar 401)
```bash
POST http://localhost:4001/teams/xxx/areas
# SIN Authorization header

# Respuesta esperada:
{
  "error": "Token no proporcionado",
  "message": "Debes incluir el header: Authorization: Bearer <token>"
}
Status: 401 Unauthorized
```

### Test 2: Con Token (debe dar 200 o 201)
```bash
POST http://localhost:4001/teams/xxx/areas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Test Área",
  "description": "Descripción de prueba",
  "color": "#3B82F6",
  "icon": "💻"
}

# Respuesta esperada:
{
  "id": "area-id",
  "name": "Test Área",
  "description": "Descripción de prueba",
  ...
}
Status: 201 Created
```

### Test 3: Con Token Inválido (debe dar 401)
```bash
POST http://localhost:4001/teams/xxx/areas
Authorization: Bearer token-invalido
Content-Type: application/json

{
  "name": "Test Área"
}

# Respuesta esperada:
{
  "error": "Token inválido",
  "message": "El token proporcionado no es válido"
}
Status: 401 Unauthorized
```

---

## 📊 ESTADO ACTUAL

| Endpoint | requireAuth | Estado |
|----------|-------------|--------|
| GET /teams/:teamId/areas | ✅ Agregado | Funciona |
| POST /teams/:teamId/areas | ❌ Falta | **401 ERROR** |
| PUT /teams/:teamId/areas/:areaId | ❌ Falta | **401 ERROR** |
| DELETE /teams/:teamId/areas/:areaId | ❌ Falta | **401 ERROR** |
| GET /areas/:areaId/members | ❌ Falta | No probado |
| POST /areas/:areaId/members | ❌ Falta | No probado |
| DELETE /areas/:areaId/members/:userId | ❌ Falta | No probado |
| Archivos (3 endpoints) | ❌ Falta | No probado |
| Mensajes (4 endpoints) | ❌ Falta | No probado |

---

## 🔍 VERIFICACIÓN

### Comprobar que `requireAuth` está importado:

```javascript
// Al inicio de src/routes/areas.route.js
const { requireAuth, optionalAuth } = require('../middleware/auth');
```

Si no está importado:
```javascript
// Agregarlo
const { requireAuth } = require('../middleware/auth');
```

### Verificar que el middleware existe:

Archivo: `src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        message: 'Debes incluir el header: Authorization: Bearer <token>'
      });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente'
      });
    }
    
    return res.status(401).json({
      error: 'Error de autenticación',
      message: error.message
    });
  }
};

module.exports = { requireAuth };
```

---

## ⏱️ TIEMPO ESTIMADO

**Total:** ~10-15 minutos

1. Abrir `src/routes/areas.route.js` (1 min)
2. Importar `requireAuth` si falta (1 min)
3. Agregar `, requireAuth` a cada endpoint (5-8 min)
4. Guardar y reiniciar servidor (1 min)
5. Testing con Postman/Thunder Client (5 min)

---

## 🚀 DESPUÉS DE IMPLEMENTAR

El frontend automáticamente funcionará porque:

1. ✅ Ya está enviando el token en todas las peticiones
2. ✅ Ya tiene manejo de errores 401
3. ✅ Ya tiene el formato correcto de headers

**No se necesita cambiar NADA en el frontend.**

---

## 📞 CONTACTO

**Si hay dudas:**
- Ver `RESPUESTA_JWT_IMPLEMENTADO.md` (paso 3: "Agregar requireAuth a endpoints")
- Ver `src/middleware/auth.js` (debe existir)
- Verificar que `JWT_SECRET` esté en `.env`

---

## 🎯 RESUMEN EJECUTIVO

**Problema:**  
Frontend envía token JWT correctamente, pero backend rechaza con 401.

**Causa:**  
Endpoint `POST /teams/:teamId/areas` no tiene middleware `requireAuth`.

**Solución:**  
Agregar `, requireAuth` después de la ruta en todos los endpoints de áreas.

**Tiempo:**  
10-15 minutos

**Prioridad:**  
🔴 ALTA - Bloquea funcionalidad completa de áreas

---

**Estado:** ⚠️ BACKEND DEBE ACTUAR  
**Bloqueador:** POST /teams/:teamId/areas sin requireAuth  
**Frontend:** ✅ Listo y esperando
