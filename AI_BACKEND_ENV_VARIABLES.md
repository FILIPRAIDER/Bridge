# 🔧 Configuración de Variables de Entorno - Backend IA

**Para:** Backend IA Team  
**Fecha:** 11 de Octubre, 2025  
**Urgencia:** 🔴 ALTA

---

## 📋 Variables de Entorno Requeridas

### En Render.com

```bash
# Variable existente (probablemente ya está)
PORT=10000

# Variables que DEBES AGREGAR:
ALLOWED_ORIGINS=http://localhost:3000,https://cresia-app.vercel.app

# Variables de IA (verificar que existan):
OPENAI_API_KEY=sk-...
# O si usas otra IA:
# ANTHROPIC_API_KEY=sk-...
# COHERE_API_KEY=...

# Variables del Backend Principal (para comunicación):
BACKEND_API_URL=https://bridge-backend.onrender.com
# O la URL correcta de tu backend principal
```

---

## 🎯 Paso a Paso en Render

### 1. Ir a Dashboard
```
https://dashboard.render.com
```

### 2. Seleccionar el Servicio
- Click en **bridge-ai-api** (o como se llame tu servicio de IA)

### 3. Ir a Environment
- En el menú lateral, click en **Environment**

### 4. Agregar Variable ALLOWED_ORIGINS

**Click en "Add Environment Variable"**

```
Key:   ALLOWED_ORIGINS
Value: http://localhost:3000,https://cresia-app.vercel.app
```

⚠️ **IMPORTANTE:** 
- NO agregar espacios después de las comas
- NO agregar trailing slash (/)
- Usar comas para separar múltiples orígenes

**Correcto:** ✅
```
http://localhost:3000,https://cresia-app.vercel.app
```

**Incorrecto:** ❌
```
http://localhost:3000, https://cresia-app.vercel.app  ← Espacio después de coma
http://localhost:3000/,https://cresia-app.vercel.app/ ← Trailing slashes
```

### 5. Guardar
- Click en **"Save Changes"**
- Render automáticamente reiniciará el servicio

---

## 🔍 Verificar Variables Actuales

### Desde Render Dashboard

1. Ir a tu servicio **bridge-ai-api**
2. Click en **Environment**
3. Verificar que tengas:

```bash
✅ PORT = 10000 (o el puerto que uses)
✅ ALLOWED_ORIGINS = http://localhost:3000,https://cresia-app.vercel.app
✅ OPENAI_API_KEY = sk-... (o tu clave de IA)
✅ BACKEND_API_URL = https://... (opcional)
```

### Desde Logs

Después de guardar y redeploy, en los logs deberías ver:

```bash
✅ AI-API escuchando en puerto 10000
✅ CORS habilitado para: [
  'http://localhost:3000',
  'https://cresia-app.vercel.app'
]
```

---

## 💻 Código para Leer la Variable

### En tu archivo principal (src/index.js o src/server.js)

```javascript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Leer y parsear ALLOWED_ORIGINS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000']; // Fallback si no está definida

console.log('✅ Orígenes permitidos:', allowedOrigins);

// ✅ Configurar CORS
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS bloqueado para:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  maxAge: 86400 // Cache preflight por 24h
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

// Tus rutas
app.post('/chat', async (req, res) => {
  try {
    // Tu lógica de IA aquí
    const { message, projectId } = req.body;
    
    // Llamar a OpenAI/Anthropic/etc
    const response = await generateAIResponse(message);
    
    res.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en /chat:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    allowedOrigins 
  });
});

app.listen(PORT, () => {
  console.log(`✅ AI-API escuchando en puerto ${PORT}`);
  console.log(`✅ CORS habilitado para:`, allowedOrigins);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

---

## 🧪 Testing de Variables

### Test 1: Verificar que la variable se lee correctamente

```javascript
// Agregar temporalmente al inicio de tu server.js
console.log('📝 Variables de entorno:');
console.log('PORT:', process.env.PORT);
console.log('ALLOWED_ORIGINS (raw):', process.env.ALLOWED_ORIGINS);
console.log('ALLOWED_ORIGINS (parsed):', process.env.ALLOWED_ORIGINS?.split(','));
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Falta');
```

**Esperado en logs:**
```
📝 Variables de entorno:
PORT: 10000
ALLOWED_ORIGINS (raw): http://localhost:3000,https://cresia-app.vercel.app
ALLOWED_ORIGINS (parsed): [ 'http://localhost:3000', 'https://cresia-app.vercel.app' ]
OPENAI_API_KEY: ✅ Configurada
```

### Test 2: Health check endpoint

```bash
# Hacer request al health endpoint
curl https://bridge-ai-api.onrender.com/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2025-10-11T14:30:00.000Z",
  "allowedOrigins": [
    "http://localhost:3000",
    "https://cresia-app.vercel.app"
  ]
}
```

### Test 3: CORS preflight

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS \
  https://bridge-ai-api.onrender.com/chat \
  -H "Origin: https://cresia-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Buscar en output:
# ✅ Access-Control-Allow-Origin: https://cresia-app.vercel.app
# ✅ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

## 🚨 Troubleshooting

### Problema: Variable no se lee

**Síntoma:**
```javascript
console.log(process.env.ALLOWED_ORIGINS); // undefined
```

**Soluciones:**
1. Verificar que guardaste los cambios en Render
2. Esperar ~1 minuto después de guardar
3. Verificar que el nombre esté EXACTAMENTE igual: `ALLOWED_ORIGINS`
4. No hay comillas en el valor de Render

### Problema: CORS sigue bloqueando

**Síntoma:**
```
No 'Access-Control-Allow-Origin' header is present
```

**Soluciones:**
1. Verificar que `cors` esté instalado: `npm list cors`
2. Verificar que el middleware CORS esté ANTES de las rutas
3. Verificar logs para ver qué origen está intentando
4. Usar el código de logging para debug

### Problema: 502 Bad Gateway después de agregar variable

**Causa:** El servicio no pudo iniciar

**Soluciones:**
1. Ver logs en Render → debería mostrar el error
2. Verificar que no haya errores de sintaxis
3. Verificar que todas las dependencias estén instaladas
4. Rollback a versión anterior si es necesario

---

## 📝 Checklist Final

Antes de decir que está listo:

- [ ] Variable `ALLOWED_ORIGINS` agregada en Render
- [ ] Código actualizado para leer la variable
- [ ] `cors` instalado (`npm install cors`)
- [ ] Middleware CORS configurado
- [ ] Código committed y pusheado
- [ ] Render redeployado exitosamente
- [ ] Logs muestran "CORS habilitado para..."
- [ ] Health check responde correctamente
- [ ] Preflight OPTIONS funciona
- [ ] Frontend team notificado

---

## 📞 Ayuda

Si tienes problemas:

1. **Revisar logs en Render**
   ```
   Render Dashboard → bridge-ai-api → Logs
   ```

2. **Verificar que el servicio esté corriendo**
   ```bash
   curl https://bridge-ai-api.onrender.com/health
   ```

3. **Contactar al equipo**
   - Compartir logs de Render
   - Compartir screenshot de Environment variables
   - Compartir el error específico

---

**Tiempo estimado total:** 15-30 minutos  
**Complejidad:** 🟢 Baja (cambio simple)  
**Impacto:** 🔴 Alto (desbloquea producción)
