# 🔐 Variables de Entorno - Bridge (Tu Proyecto Específico)

## ✅ EXACTAMENTE lo que necesitas configurar en Vercel

---

## 🔴 Variables OBLIGATORIAS (5)

### 1. Backend Core API
```env
NEXT_PUBLIC_API_BASE_URL=https://proyectoia-backend.onrender.com
```
**¿Para qué?**
- Login y autenticación
- Equipos y áreas
- Chat y mensajes
- Archivos
- Miembros
- Países, ciudades, sectores

**✅ YA TIENES:** `https://proyectoia-backend.onrender.com`

---

### 2. Backend IA API
```env
NEXT_PUBLIC_AI_API_URL=https://bridge-ai-api.onrender.com
```
**¿Para qué?**
- Comando `@IA` en chat
- Resúmenes de conversación
- Minutas de reuniones
- Predicciones de áreas
- Insights de equipo

**✅ YA TIENES:** `https://bridge-ai-api.onrender.com`

---

### 3. WebSocket URL
```env
NEXT_PUBLIC_WS_BASE_URL=https://proyectoia-backend.onrender.com
```
**¿Para qué?**
- Chat en tiempo real
- Notificaciones live
- "Fulanito está escribiendo..."
- Mensajes de Telegram sincronizados

**✅ YA TIENES:** `https://proyectoia-backend.onrender.com` (mismo que API Core)

**💡 Nota:** Si no la configuras, usa `NEXT_PUBLIC_API_BASE_URL` automáticamente

---

### 4. NextAuth URL
```env
NEXTAUTH_URL=https://bridge-ia.vercel.app
```
**¿Para qué?**
- Login con NextAuth
- Callbacks de autenticación
- Redirects después de login

**⚠️ CAMBIA ESTO:** Reemplaza `bridge-ia.vercel.app` por tu dominio real de Vercel

---

### 5. NextAuth Secret
```env
NEXTAUTH_SECRET=tu-secret-super-seguro-aqui
```
**¿Para qué?**
- Encriptar tokens JWT
- Seguridad de sesiones

**🔒 GENERA UNO NUEVO:**
```bash
openssl rand -base64 32
```

O visita: https://generate-secret.vercel.app/32

**❌ NUNCA** uses el mismo secret en desarrollo y producción

---

## 🟢 Variables OPCIONALES (2)

### 6. Telegram Bot Username
```env
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=BridgeAppBot
```
**¿Para qué?**
- Wizard de configuración de Telegram
- Links al bot
- Instrucciones de setup

**💡 Default:** Si no la configuras, usa `BridgeAppBot` automáticamente

**📝 ¿Cuándo configurarla?**
- Si tu bot de Telegram tiene otro nombre
- Cuando el backend de Telegram esté listo

---

### 7. ImageKit URL (Solo si usas ImageKit)
```env
NEXT_PUBLIC_IMAGEKIT_URL=https://ik.imagekit.io/tu-id
```
**¿Para qué?**
- CDN de imágenes (avatares, logos)

**💡 Solo si:** Estás usando ImageKit para almacenar imágenes

---

## 📋 Template para Copiar/Pegar en Vercel

```env
# ============================================
# OBLIGATORIAS - Configura estas 5 SÍ O SÍ
# ============================================

NEXT_PUBLIC_API_BASE_URL=https://proyectoia-backend.onrender.com
NEXT_PUBLIC_AI_API_URL=https://bridge-ai-api.onrender.com
NEXT_PUBLIC_WS_BASE_URL=https://proyectoia-backend.onrender.com
NEXTAUTH_URL=https://TU-DOMINIO.vercel.app
NEXTAUTH_SECRET=GENERA-UNO-CON-openssl-rand-base64-32

# ============================================
# OPCIONALES - Solo si las necesitas
# ============================================

# NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=BridgeAppBot
# NEXT_PUBLIC_IMAGEKIT_URL=https://ik.imagekit.io/tu-id
```

---

## 🚀 Pasos para Configurar en Vercel (3 minutos)

### 1. Abre tu proyecto en Vercel
- Ve a [vercel.com](https://vercel.com/dashboard)
- Selecciona tu proyecto Bridge

### 2. Ve a Settings → Environment Variables
- Click en "Settings" en el menú superior
- Click en "Environment Variables" en el menú lateral

### 3. Agrega las 5 variables obligatorias
Para cada una:
- **Name:** `NEXT_PUBLIC_API_BASE_URL`
- **Value:** `https://proyectoia-backend.onrender.com`
- **Environments:** Selecciona `Production`, `Preview`, `Development`
- Click en **"Save"**

Repite para las otras 4 variables.

### 4. Redeploy
- Ve a "Deployments"
- Click en los 3 puntos ⋮ del último deploy
- Click en "Redeploy"
- Espera 1-2 minutos

### 5. Verifica
- Abre tu app: `https://tu-dominio.vercel.app`
- Haz login
- Abre un chat de área
- Verifica "Conectado" en el header
- F12 → Console (no debe haber errores rojos)

---

## ✅ Checklist Rápido

Marca cuando completes cada paso:

- [ ] 1. `NEXT_PUBLIC_API_BASE_URL` configurada
- [ ] 2. `NEXT_PUBLIC_AI_API_URL` configurada
- [ ] 3. `NEXT_PUBLIC_WS_BASE_URL` configurada
- [ ] 4. `NEXTAUTH_URL` configurada (con TU dominio)
- [ ] 5. `NEXTAUTH_SECRET` generado y configurado
- [ ] 6. Redeploy realizado
- [ ] 7. App carga correctamente
- [ ] 8. Login funciona
- [ ] 9. Chat muestra "Conectado"
- [ ] 10. No hay errores en Console

---

## 🔍 ¿Cómo saber cuál es mi dominio de Vercel?

1. Ve a tu proyecto en Vercel
2. En el Dashboard verás algo como:
   - `bridge-ia-xyz123.vercel.app` (dominio automático)
   - O tu dominio personalizado si configuraste uno

3. Usa ese dominio para `NEXTAUTH_URL`

**Ejemplo:**
```env
NEXTAUTH_URL=https://bridge-ia-xyz123.vercel.app
```

---

## 🐛 Troubleshooting Común

### ❌ Error: "API_BASE_URL is undefined"
**Problema:** No configuraste `NEXT_PUBLIC_API_BASE_URL`  
**Solución:** Agrégala en Vercel y redeploy

### ❌ Error: "WebSocket connection failed"
**Problema:** WebSocket no puede conectar  
**Solución:** 
1. Verifica `NEXT_PUBLIC_WS_BASE_URL` apunte a tu backend
2. Asegúrate que tu backend soporte WebSocket (Socket.io)

### ❌ Error: "Unauthorized" o 401
**Problema:** NextAuth no está configurado correctamente  
**Solución:**
1. Verifica `NEXTAUTH_URL` coincida con tu dominio de Vercel
2. Verifica `NEXTAUTH_SECRET` esté configurado
3. Redeploy después de cambiar variables

### ❌ Error: "AI API timeout"
**Problema:** Backend de IA no responde  
**Solución:**
1. Verifica que `https://bridge-ai-api.onrender.com` esté activo
2. Puede estar en "sleep" (Render free tier) - espera 1 minuto

### ❌ "Botón de Telegram no aparece"
**No es problema:** El botón debe aparecer aunque no configures la variable  
**Si realmente no aparece:**
1. Verifica en F12 → Console que no haya errores
2. Limpia cache del navegador (Ctrl+Shift+R)

---

## 💡 Diferencias: Desarrollo vs Producción

### Desarrollo Local (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
NEXT_PUBLIC_AI_API_URL=http://localhost:4101
NEXT_PUBLIC_WS_BASE_URL=http://localhost:4001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cualquier-cosa-para-desarrollo
```

### Producción (Vercel)
```env
NEXT_PUBLIC_API_BASE_URL=https://proyectoia-backend.onrender.com
NEXT_PUBLIC_AI_API_URL=https://bridge-ai-api.onrender.com
NEXT_PUBLIC_WS_BASE_URL=https://proyectoia-backend.onrender.com
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=secret-generado-con-openssl-NUNCA-compartas
```

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                  │
│  ├─ NEXT_PUBLIC_API_BASE_URL ─────────┐            │
│  ├─ NEXT_PUBLIC_AI_API_URL ───────────┼────┐       │
│  ├─ NEXT_PUBLIC_WS_BASE_URL ──────────┤    │       │
│  ├─ NEXTAUTH_URL (tu dominio)         │    │       │
│  └─ NEXTAUTH_SECRET (seguridad)       │    │       │
└────────────────────────────────────────┼────┼───────┘
                                         │    │
                                         ▼    ▼
                    ┌────────────────────────────────┐
                    │  Backend Core                  │
                    │  proyectoia-backend            │
                    │  (Auth, Chat, Files, etc)      │
                    └────────────────────────────────┘
                                         │
                                         ▼
                    ┌────────────────────────────────┐
                    │  Backend IA                    │
                    │  bridge-ai-api                 │
                    │  (@IA, Resúmenes, Minutas)     │
                    └────────────────────────────────┘
```

---

## 🎯 Solo necesitas ESTAS 5:

1. ✅ `NEXT_PUBLIC_API_BASE_URL` → `https://proyectoia-backend.onrender.com`
2. ✅ `NEXT_PUBLIC_AI_API_URL` → `https://bridge-ai-api.onrender.com`
3. ✅ `NEXT_PUBLIC_WS_BASE_URL` → `https://proyectoia-backend.onrender.com`
4. ✅ `NEXTAUTH_URL` → `https://TU-DOMINIO.vercel.app`
5. ✅ `NEXTAUTH_SECRET` → **Genera uno nuevo**

Las demás son opcionales. **Con estas 5, tu app funciona al 100%.**

---

## 📞 ¿Aún tienes dudas?

**P: ¿Debo configurar NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ahora?**  
R: No, es opcional. El botón de Telegram aparecerá con el valor por defecto.

**P: ¿Cómo genero NEXTAUTH_SECRET?**  
R: En tu terminal: `openssl rand -base64 32` o visita https://generate-secret.vercel.app/32

**P: ¿Puedo usar las mismas variables en desarrollo y producción?**  
R: NO. En desarrollo usa localhost, en producción usa las URLs reales.

**P: ¿Cuánto tarda en aplicarse un cambio de variable?**  
R: Inmediatamente después del redeploy (1-2 minutos).

**P: ¿Dónde veo si las variables están bien configuradas?**  
R: F12 → Network → Ve las peticiones, deben ir a las URLs correctas.

---

**Última actualización:** Ahora mismo  
**Proyecto:** Bridge  
**Ambiente:** Vercel Production

---

## 🚨 IMPORTANTE

1. **NUNCA** subas archivos `.env` a Git
2. **NUNCA** compartas `NEXTAUTH_SECRET` públicamente
3. Usa un secret **diferente** en desarrollo y producción
4. Después de cambiar variables, siempre haz **Redeploy**
5. Usa navegador en modo incógnito para probar (evita cache)

---

**¡Listo! Solo configura esas 5 variables y estarás funcionando.** 🚀
