# 🚨 URGENTE: Error de CORS en AI-API (Producción Bloqueada)

**Fecha:** 11 de Octubre, 2025  
**Severidad:** 🔴 **CRÍTICA** - La IA no funciona en producción  
**Tiempo estimado de fix:** ~15 minutos  
**Status:** ⏳ Esperando fix del Backend IA

---

## 📋 Resumen Ejecutivo

El **frontend en producción** (`https://cresia-app.vercel.app`) **NO puede comunicarse con el AI-API** (`https://bridge-ai-api.onrender.com`) debido a un error de CORS.

**Resultado:** Los usuarios no pueden usar el chat de IA en producción. ❌

---

## 🔬 Error Completo

### Console Error (Chrome DevTools)
```
Access to fetch at 'https://bridge-ai-api.onrender.com/chat' 
from origin 'https://cresia-app.vercel.app' 
has been blocked by CORS policy: 

Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Failed Request
```
URL: https://bridge-ai-api.onrender.com/chat
Method: POST (con preflight OPTIONS)
Origin: https://cresia-app.vercel.app

❌ Status: ERR_FAILED
❌ CORS: BLOCKED
```

### Error en el Frontend
```javascript
Error enviando mensaje: TypeError: Failed to fetch
    at A (4808d7cd7e10089b.js:1:43376)
    at O (4808d7cd7e10089b.js:1:46072)
    at onClick (4808d7cd7e10089b.js:1:50582)
```

---

## 🤔 ¿Qué es CORS?

**CORS (Cross-Origin Resource Sharing)** es un mecanismo de seguridad del navegador que **bloquea** requests HTTP entre diferentes dominios por defecto.

### Nuestro Caso:
```
Frontend (Cliente):  https://cresia-app.vercel.app
Backend AI (Server): https://bridge-ai-api.onrender.com

❌ Diferentes dominios = Bloqueado por CORS
```

### ¿Por qué no falla en desarrollo?
```
Frontend (Dev):  http://localhost:3000
Backend AI:      http://localhost:xxxx

✅ Mismo dominio (localhost) = No hay CORS
```

---

## 🔍 Diagnóstico

### ¿Qué está pasando?

1. **Usuario hace click en "Enviar"** en el chat IA
2. **Frontend intenta POST** a `https://bridge-ai-api.onrender.com/chat`
3. **Navegador envía preflight OPTIONS** (automático)
4. **Backend AI responde sin headers CORS** ❌
5. **Navegador bloquea el request** ❌
6. **Frontend recibe error "Failed to fetch"** ❌

### ¿Dónde está el problema?

**El backend AI no está configurado para aceptar requests desde el dominio de producción.**

---

## ✅ Solución (Backend AI)

### Opción 1: Variable de Entorno (RECOMENDADO) ⭐

#### Paso 1: Agregar variable de entorno en Render

```bash
# En Render.com → AI-API Service → Environment
ALLOWED_ORIGINS=http://localhost:3000,https://cresia-app.vercel.app
```

#### Paso 2: Actualizar código del backend AI

**Archivo:** `src/index.js` o `src/server.js` (donde esté Express)

```javascript
import express from 'express';
import cors from 'cors';

const app = express();

// ✅ SOLUCIÓN: Configurar CORS con variable de entorno
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://cresia-app.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS bloqueado para origen:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 horas de cache para preflight
}));

// El resto de tu código...
app.post('/chat', async (req, res) => {
  // Tu lógica de IA
});

app.listen(PORT, () => {
  console.log(`✅ AI-API escuchando en puerto ${PORT}`);
  console.log(`✅ CORS habilitado para:`, allowedOrigins);
});
```

---

### Opción 2: Configuración Directa (Más simple pero menos flexible)

**Archivo:** `src/index.js` o `src/server.js`

```javascript
import express from 'express';
import cors from 'cors';

const app = express();

// ✅ SOLUCIÓN SIMPLE: Array directo de orígenes permitidos
app.use(cors({
  origin: [
    'http://localhost:3000',            // Desarrollo
    'https://cresia-app.vercel.app'     // Producción ← AGREGAR ESTO
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// El resto de tu código...
```

---

### Opción 3: Wildcard (NO RECOMENDADO para producción)

```javascript
// ⚠️ SOLO PARA TESTING - NO USAR EN PRODUCCIÓN
app.use(cors({
  origin: '*', // Permite TODOS los dominios (INSEGURO)
  credentials: false // Debe ser false con origin: '*'
}));
```

---

## 🛠️ Pasos para Implementar (Render.com)

### 1. **Actualizar el código**

```bash
# En tu repositorio del backend AI
git pull
# Editar src/index.js o src/server.js
# Agregar la configuración CORS de arriba
git add .
git commit -m "fix: Agregar CORS para producción (cresia-app.vercel.app)"
git push origin main
```

### 2. **Configurar variable de entorno en Render**

1. Ir a https://dashboard.render.com
2. Seleccionar el servicio **bridge-ai-api**
3. Ir a **Environment**
4. Agregar nueva variable:
   ```
   Key: ALLOWED_ORIGINS
   Value: http://localhost:3000,https://cresia-app.vercel.app
   ```
5. Click en **Save Changes**

### 3. **Redeploy (automático)**

Render detectará el push y hará redeploy automáticamente (~5 minutos).

### 4. **Verificar logs**

```bash
# En Render → Logs, deberías ver:
✅ AI-API escuchando en puerto 10000
✅ CORS habilitado para: [ 'http://localhost:3000', 'https://cresia-app.vercel.app' ]
```

---

## 🧪 Testing

### 1. **Test desde DevTools**

Abrir https://cresia-app.vercel.app en Chrome y ejecutar en Console:

```javascript
// Test de CORS
fetch('https://bridge-ai-api.onrender.com/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Test CORS',
    projectId: 'test'
  })
})
.then(res => res.json())
.then(data => console.log('✅ CORS funciona:', data))
.catch(err => console.error('❌ CORS bloqueado:', err));
```

**Resultado esperado:**
- ✅ Sin error de CORS
- ✅ Respuesta del backend (aunque sea error 400/500 por falta de auth)

### 2. **Test desde la UI**

1. Ir a https://cresia-app.vercel.app/chat-ia (o donde esté el chat)
2. Escribir un mensaje de prueba
3. Click en "Enviar"
4. **Esperado:**
   - ✅ Sin error de CORS en console
   - ✅ Respuesta de la IA (o error de autenticación/validación)

### 3. **Verificar Headers con curl**

```bash
# Test de preflight OPTIONS
curl -I -X OPTIONS \
  https://bridge-ai-api.onrender.com/chat \
  -H "Origin: https://cresia-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Deberías ver:
# ✅ Access-Control-Allow-Origin: https://cresia-app.vercel.app
# ✅ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# ✅ Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key
```

---

## 📝 Checklist

### Backend AI Team

- [ ] Pull latest code
- [ ] Instalar `cors` si no está: `npm install cors`
- [ ] Agregar configuración CORS (Opción 1 o 2)
- [ ] Agregar variable de entorno `ALLOWED_ORIGINS` en Render
- [ ] Commit y push
- [ ] Verificar logs en Render (debe decir "CORS habilitado para...")
- [ ] Esperar redeploy (~5 min)
- [ ] Verificar que preflight OPTIONS funciona
- [ ] Notificar al frontend team

### Frontend Team (Para verificar después del fix)

- [ ] Abrir https://cresia-app.vercel.app
- [ ] Abrir DevTools → Network
- [ ] Ir al chat IA
- [ ] Enviar mensaje de prueba
- [ ] Verificar que NO hay error de CORS
- [ ] Verificar que el mensaje se envía
- [ ] Verificar que la IA responde

---

## 🚨 Preguntas Frecuentes

### ¿Por qué funciona en localhost pero no en producción?

En desarrollo, tanto frontend como backend corren en `localhost`, entonces no hay CORS. En producción, son dominios diferentes.

### ¿No puedo simplemente usar `origin: '*'`?

❌ **NO.** Eso permitiría a CUALQUIER sitio web usar tu API de IA, lo cual es inseguro y puede resultar en:
- Uso no autorizado
- Costos inesperados (si pagas por tokens de IA)
- Abuso del servicio

### ¿Qué pasa si agrego más dominios en el futuro?

Si usas la **Opción 1** (variable de entorno), solo necesitas:
```
ALLOWED_ORIGINS=http://localhost:3000,https://cresia-app.vercel.app,https://nuevo-dominio.com
```

No necesitas cambiar código, solo actualizar la variable.

### ¿Debo reiniciar el servidor manualmente?

No. Render redeploya automáticamente al detectar cambios en git o variables de entorno.

---

## 🔗 Referencias

- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [Render - Environment Variables](https://render.com/docs/environment-variables)

---

## 📞 Contacto

**Si tienes dudas o necesitas ayuda:**
- Revisar logs de Render
- Verificar que el middleware CORS esté ANTES de las rutas
- Asegurar que `cors` esté instalado: `npm list cors`
- Verificar variable de entorno en Render Dashboard

---

## 🎯 Resumen de 30 Segundos

```javascript
// AGREGAR ESTO AL BACKEND AI (src/index.js):

import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://cresia-app.vercel.app'  // ← AGREGAR ESTA LÍNEA
  ],
  credentials: true
}));
```

**Tiempo:** ~15 minutos  
**Impacto:** ✅ IA funciona en producción  
**Urgencia:** 🔴 ALTA - Bloqueador de funcionalidad

---

**Status:** ⏳ Esperando implementación  
**ETA:** ~30 minutos después de fix  
**Testing:** Frontend team verificará después del deploy
