# 🔐 Variables de Entorno para Vercel

## 📋 Configuración Completa para Producción

Estas son **TODAS** las variables de entorno que debes configurar en Vercel para que la aplicación funcione correctamente.

---

## ✅ Variables Obligatorias (Core)

### 1. **Backend Core API**
```env
NEXT_PUBLIC_API_BASE_URL=https://proyectoia-backend.onrender.com
```
**Descripción:** URL del backend principal (Node.js + Express)
**Usado en:** 
- Autenticación
- Equipos
- Áreas
- Mensajes
- Archivos
- Miembros

### 2. **Backend IA API**
```env
NEXT_PUBLIC_AI_API_URL=https://bridge-ai-api.onrender.com
```
**Descripción:** URL del backend de IA (Python + FastAPI)
**Usado en:**
- Asistente IA (@IA en chat)
- Resúmenes de conversación
- Minutas de reuniones
- Predicciones de áreas
- Insights de equipo

### 3. **WebSocket Base URL**
```env
NEXT_PUBLIC_WS_BASE_URL=https://proyectoia-backend.onrender.com
```
**Descripción:** URL para WebSocket (Socket.io)
**Usado en:**
- Chat en tiempo real
- Notificaciones live
- Typing indicators
- Mensajes de Telegram sincronizados

**💡 Nota:** Si no se configura, usa automáticamente `NEXT_PUBLIC_API_BASE_URL` como fallback.

### 4. **NextAuth URL**
```env
NEXTAUTH_URL=https://tu-dominio.vercel.app
```
**Descripción:** URL de tu aplicación en Vercel
**Usado en:**
- Autenticación con NextAuth
- Callbacks de OAuth
- Redirects

**⚠️ IMPORTANTE:** Cambia `tu-dominio.vercel.app` por tu dominio real de Vercel.

### 5. **NextAuth Secret**
```env
NEXTAUTH_SECRET=tu-secret-super-seguro-aqui
```
**Descripción:** Secret key para encriptar tokens JWT
**Generar con:** `openssl rand -base64 32`
**Usado en:**
- Encriptación de tokens
- Seguridad de sesiones

**🔒 CRÍTICO:** Usa un secret único y seguro. NUNCA subas este valor a Git.

---

## 🆕 Variables Nuevas (Telegram)

### 6. **Telegram Bot Username** (Opcional)
```env
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=BridgeAppBot
```
**Descripción:** Username del bot de Telegram (sin @)
**Usado en:**
- Wizard de configuración
- Links al bot
- Instrucciones de setup

**Valor por defecto:** `BridgeAppBot` si no se configura

**📝 Nota:** Esta variable es opcional. Si no la configuras, se usará "BridgeAppBot" como placeholder.

---

## 🎨 Variables Opcionales (UI/Branding)

### 7. **App Base URL**
```env
NEXT_PUBLIC_APP_BASE_URL=https://tu-dominio.vercel.app
```
**Descripción:** URL base de la aplicación
**Usado en:**
- Links compartidos
- Invitaciones por email
- Redirects

**💡 Puede ser igual a `NEXTAUTH_URL`**

### 8. **ImageKit URL**
```env
NEXT_PUBLIC_IMAGEKIT_URL=https://ik.imagekit.io/tu-id
```
**Descripción:** URL de ImageKit para almacenamiento de imágenes
**Usado en:**
- Avatares de usuarios
- Imágenes de perfil
- Archivos compartidos

**📝 Nota:** Si usas ImageKit para CDN de imágenes.

---

## 📋 Resumen de Variables por Prioridad

### 🔴 Críticas (Sin estas la app no funciona)
1. ✅ `NEXT_PUBLIC_API_BASE_URL`
2. ✅ `NEXT_PUBLIC_AI_API_URL`
3. ✅ `NEXTAUTH_URL`
4. ✅ `NEXTAUTH_SECRET`

### 🟡 Importantes (Funcionalidades pueden fallar)
5. ✅ `NEXT_PUBLIC_WS_BASE_URL` (usa fallback si no está)
6. ⚪ `NEXT_PUBLIC_APP_BASE_URL`

### 🟢 Opcionales (Tienen valores por defecto)
7. ⚪ `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
8. ⚪ `NEXT_PUBLIC_IMAGEKIT_URL`

---

## 🚀 Pasos para Configurar en Vercel

### Opción A: Desde el Dashboard de Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Click en **Settings** (⚙️)
3. Click en **Environment Variables** (en el menú lateral)
4. Para cada variable:
   - Agrega el **Name** (nombre de la variable)
   - Agrega el **Value** (valor)
   - Selecciona **Production**, **Preview** y **Development**
   - Click en **Save**
5. Después de agregar todas, haz **Redeploy** del proyecto

### Opción B: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Agregar variables
vercel env add NEXT_PUBLIC_API_BASE_URL production
# (Te pedirá el valor)

# Repetir para cada variable...

# Redeploy
vercel --prod
```

### Opción C: Archivo .env.production.local

```bash
# En tu proyecto local, crea:
.env.production.local

# Agrega todas las variables
# Luego en Vercel Dashboard > Settings > Environment Variables
# Click en "Import .env File" y sube el archivo
```

---

## 📝 Template Completo para Copiar/Pegar

```env
# ============================================
# BACKEND CORE (OBLIGATORIO)
# ============================================
NEXT_PUBLIC_API_BASE_URL=https://proyectoia-backend.onrender.com

# ============================================
# BACKEND IA (OBLIGATORIO)
# ============================================
NEXT_PUBLIC_AI_API_URL=https://bridge-ai-api.onrender.com

# ============================================
# WEBSOCKET (IMPORTANTE)
# ============================================
NEXT_PUBLIC_WS_BASE_URL=https://proyectoia-backend.onrender.com

# ============================================
# NEXTAUTH (OBLIGATORIO)
# ============================================
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=genera-un-secret-con-openssl-rand-base64-32

# ============================================
# APP CONFIG (OPCIONAL)
# ============================================
NEXT_PUBLIC_APP_BASE_URL=https://tu-dominio.vercel.app

# ============================================
# TELEGRAM (OPCIONAL)
# ============================================
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=BridgeAppBot

# ============================================
# IMAGEKIT (OPCIONAL)
# ============================================
NEXT_PUBLIC_IMAGEKIT_URL=https://ik.imagekit.io/tu-id
```

---

## ✅ Checklist de Verificación

Después de configurar, verifica:

- [ ] ✅ La app carga correctamente en Vercel
- [ ] ✅ Login funciona (NextAuth)
- [ ] ✅ Dashboard muestra datos
- [ ] ✅ Chat en tiempo real funciona (WebSocket)
- [ ] ✅ Asistente IA responde (@IA)
- [ ] ✅ Resúmenes se generan
- [ ] ✅ Botón de Telegram aparece
- [ ] ✅ No hay errores en Console del navegador
- [ ] ✅ No hay errores 500 en Network tab

---

## 🐛 Troubleshooting

### Error: "API_BASE_URL is undefined"
**Solución:** Configura `NEXT_PUBLIC_API_BASE_URL` en Vercel y redeploy.

### Error: "WebSocket connection failed"
**Solución:** 
1. Verifica que `NEXT_PUBLIC_WS_BASE_URL` apunte a la misma URL que tu backend
2. Verifica que tu backend soporte WebSocket (Socket.io)
3. Verifica que no haya CORS issues

### Error: "AI API timeout"
**Solución:**
1. Verifica que `NEXT_PUBLIC_AI_API_URL` apunte al backend de IA correcto
2. Verifica que el backend de IA esté activo (no en sleep de Render)
3. Aumenta timeout si es necesario

### Error: "NextAuth error"
**Solución:**
1. Verifica `NEXTAUTH_URL` coincida con tu dominio de Vercel
2. Genera un nuevo `NEXTAUTH_SECRET` si es necesario
3. Verifica que el backend devuelva el `accessToken` correcto

### Telegram no aparece
**Solución:**
- El botón de Telegram debería aparecer aunque no esté configurado el backend
- Si no aparece, verifica que no haya errores de compilación
- Verifica que `AreaChatView` esté actualizado

---

## 🔄 Después de Cambios

Si modificas alguna variable de entorno:

1. **En Vercel Dashboard:**
   - Settings → Environment Variables → Edit
   - Save

2. **Redeploy:**
   - Deployments → Latest → ⋮ → Redeploy
   - O push un nuevo commit a main

3. **Verificar:**
   - Espera a que termine el deploy
   - Abre tu app en incógnito (para evitar cache)
   - Verifica que los cambios funcionen

---

## 📚 Recursos Útiles

- [Documentación de Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)
- [Documentación de NextAuth](https://next-auth.js.org/configuration/options)
- [Generar NEXTAUTH_SECRET](https://generate-secret.vercel.app/32)

---

## 🎯 Variables Específicas por Feature

### Para Chat Básico (Sin IA, Sin Telegram)
```env
NEXT_PUBLIC_API_BASE_URL=...
NEXT_PUBLIC_WS_BASE_URL=...
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
```

### Para Chat + IA
```env
# Todo lo anterior +
NEXT_PUBLIC_AI_API_URL=...
```

### Para Chat + IA + Telegram
```env
# Todo lo anterior +
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...
```

---

**Última actualización:** 2024  
**Integración de Telegram:** ✅ Completada  
**Commit:** 739fe78

---

## 🚨 IMPORTANTE: Seguridad

1. **NUNCA** subas `.env` files a Git
2. **NUNCA** compartas `NEXTAUTH_SECRET` públicamente
3. Usa variables diferentes para desarrollo y producción
4. Rota `NEXTAUTH_SECRET` cada 3-6 meses
5. Usa HTTPS en producción siempre

---

¿Necesitas ayuda? Contacta al equipo de desarrollo. 🚀
