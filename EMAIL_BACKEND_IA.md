# 📧 Email para Backend IA Team

---

**Asunto:** 🚨 URGENTE: Error de CORS bloqueando IA en producción

---

**Para:** Backend IA Team  
**De:** Frontend Team  
**Fecha:** 11 de Octubre, 2025  
**Prioridad:** 🔴 **ALTA** - Bloqueador de producción

---

## 📋 Resumen

El chat de IA **NO funciona en producción** debido a un error de CORS. Los usuarios ven:

```
Access to fetch at 'https://bridge-ai-api.onrender.com/chat' 
from origin 'https://cresia-app.vercel.app' 
has been blocked by CORS policy
```

---

## 🎯 Solución Rápida (15 minutos)

### Paso 1: Agregar variable de entorno en Render

```
Dashboard → bridge-ai-api → Environment → Add Variable

Key:   ALLOWED_ORIGINS
Value: http://localhost:3000,https://cresia-app.vercel.app
```

### Paso 2: Actualizar código (src/index.js)

```javascript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://cresia-app.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
```

### Paso 3: Deploy

```bash
git add .
git commit -m "fix: Agregar CORS para producción"
git push origin main
```

Render redeployará automáticamente (~5 min).

---

## 📚 Documentación Completa

He preparado dos documentos detallados:

### 1. **AI_BACKEND_CORS_FIX.md** (Análisis completo)
- ✅ Error exacto con stack trace
- ✅ Explicación de qué es CORS y por qué falla
- ✅ 3 opciones de solución con código completo
- ✅ Paso a paso para Render.com
- ✅ Testing checklist
- ✅ Troubleshooting

**Ver:** https://github.com/FILIPRAIDER/Bridge/blob/main/AI_BACKEND_CORS_FIX.md

### 2. **AI_BACKEND_ENV_VARIABLES.md** (Configuración)
- ✅ Variables requeridas
- ✅ Instrucciones paso a paso con screenshots
- ✅ Código de ejemplo completo
- ✅ Tests de verificación
- ✅ Troubleshooting común

**Ver:** https://github.com/FILIPRAIDER/Bridge/blob/main/AI_BACKEND_ENV_VARIABLES.md

---

## ✅ Checklist

Por favor confirmar cuando completen:

- [ ] Variable `ALLOWED_ORIGINS` agregada en Render
- [ ] Código actualizado con configuración CORS
- [ ] Committed y pusheado a GitHub
- [ ] Render redeployado exitosamente
- [ ] Logs muestran "CORS habilitado para..."
- [ ] Test manual: enviar mensaje desde https://cresia-app.vercel.app

---

## 🧪 Verificación (Para después del fix)

```bash
# 1. Health check
curl https://bridge-ai-api.onrender.com/health

# 2. CORS preflight
curl -I -X OPTIONS \
  https://bridge-ai-api.onrender.com/chat \
  -H "Origin: https://cresia-app.vercel.app" \
  -H "Access-Control-Request-Method: POST"

# Debe incluir:
# Access-Control-Allow-Origin: https://cresia-app.vercel.app
```

---

## 🆘 ¿Necesitas ayuda?

Si tienes dudas:
1. Revisar los documentos completos (links arriba)
2. Ver logs en Render Dashboard
3. Contactarnos para pair programming

---

## ⏱️ Timeline

- **Implementación:** 15-30 minutos
- **Deploy:** ~5 minutos
- **Testing:** 5 minutos
- **Total:** ~40 minutos

---

## 🎯 Impacto

**Antes del fix:**
- ❌ IA no funciona en producción
- ❌ 100% de requests bloqueados por CORS
- ❌ Usuarios no pueden usar el chat

**Después del fix:**
- ✅ IA funciona en producción
- ✅ Chat funcional para todos los usuarios
- ✅ Sin errores de CORS

---

Gracias por la pronta atención! 🚀

**Frontend Team**

---

## 📎 Adjuntos

1. AI_BACKEND_CORS_FIX.md
2. AI_BACKEND_ENV_VARIABLES.md
3. Screenshots del error (si necesitan)

---

**P.D.** Si necesitan que les ayude con el código o configuración, estoy disponible para una call rápida.
