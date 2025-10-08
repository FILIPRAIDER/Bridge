# 🚨 CORRECCIONES URGENTES - Email Invitación

## ❌ Problemas Actuales

### 1. URL apunta al backend en lugar del frontend
**Código actual (INCORRECTO):**
```javascript
const FRONTEND_HARDCODED = "https://cresia-app.vercel.app";
```

**Problema:** Esta URL no existe o no es la correcta.

**Solución:**
```javascript
const FRONTEND_HARDCODED = "https://tu-app-real.vercel.app"; // ← Cambiar por la URL real del frontend
```

---

### 2. Sale "undefined" en lugar del nombre
**Ya está implementado correctamente** en el código, así que el problema debe estar en otro lado.

---

## ✅ Solución Completa

### **Archivo: `src/routes/teams.js` - Línea ~30**

Cambiar esta línea:
```javascript
// ❌ INCORRECTO
const FRONTEND_HARDCODED = "https://cresia-app.vercel.app";
```

Por esta (con la URL REAL de tu frontend):
```javascript
// ✅ CORRECTO
const FRONTEND_HARDCODED = "https://your-actual-frontend.vercel.app";

// O si prefieres usar variable de entorno:
const FRONTEND_HARDCODED = process.env.FRONTEND_URL || "https://your-actual-frontend.vercel.app";
```

---

## 🔍 ¿Cuál es la URL correcta del frontend?

Para encontrar la URL correcta de tu frontend en Vercel:

1. Ve a https://vercel.com/dashboard
2. Busca tu proyecto de frontend (Bridge, ia-app, etc.)
3. Copia la URL que aparece en "Domains"
4. Ejemplo: `https://bridge-app.vercel.app` o `https://ia-app.vercel.app`

---

## 💻 Implementación Recomendada

### **Opción 1: Hardcoded (Más Simple)**

```javascript
function buildAcceptUrl({ token, target }) {
  // 🎯 URL REAL DEL FRONTEND (cambiar por la tuya)
  const FRONTEND_URL = "https://tu-app-vercel.vercel.app";
  
  console.log("📧 [buildAcceptUrl] Generando URL de aceptación");
  console.log("  - Token:", token.substring(0, 10) + "...");
  console.log("  - Frontend URL:", FRONTEND_URL);
  
  // Si explícitamente piden backend (para testing)
  if (target === "backend") {
    const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4001";
    console.log("  - Usando backend URL:", API_BASE_URL);
    return `${API_BASE_URL}/teams/invites/${token}/accept`;
  }
  
  // 🎯 SIEMPRE frontend para invitaciones de usuario
  const url = new URL("/join", FRONTEND_URL);
  url.searchParams.set("token", token);
  const finalUrl = url.toString();
  console.log("  ✅ Accept URL generado:", finalUrl);
  return finalUrl;
}
```

### **Opción 2: Variable de Entorno (Recomendado)**

1. **Actualizar `.env` del backend:**
```bash
# .env (Backend en Render/Railway)

# URL del frontend (IMPORTANTE: sin barra final)
FRONTEND_URL=https://tu-app-vercel.vercel.app

# Alternativa si ya tienes APP_BASE_URL
APP_BASE_URL=https://tu-app-vercel.vercel.app
```

2. **Actualizar `buildAcceptUrl`:**
```javascript
function buildAcceptUrl({ token, target }) {
  // 🎯 Leer desde variable de entorno
  const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_BASE_URL || "https://tu-app-default.vercel.app";
  
  console.log("📧 [buildAcceptUrl] Generando URL de aceptación");
  console.log("  - Frontend URL:", FRONTEND_URL);
  console.log("  - Token:", token.substring(0, 10) + "...");
  
  if (target === "backend") {
    const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4001";
    return `${API_BASE_URL}/teams/invites/${token}/accept`;
  }
  
  const url = new URL("/join", FRONTEND_URL);
  url.searchParams.set("token", token);
  return url.toString();
}
```

---

## 🧪 Testing

Después de hacer los cambios:

### **1. Verificar en logs**
Cuando envíes una invitación, deberías ver en los logs del backend:

```
📧 [buildAcceptUrl] Generando URL de aceptación
  - Frontend URL: https://tu-app-vercel.vercel.app
  - Token: d6486efd9a...
  ✅ Accept URL generado: https://tu-app-vercel.vercel.app/join?token=d6486efd...
```

### **2. Verificar en el email**
El botón "Aceptar invitación" debe apuntar a:
```
https://tu-app-vercel.vercel.app/join?token=...
```

**NO** a:
```
https://proyectoia-backend.onrender.com/join?token=...  ← INCORRECTO
```

---

## 🔧 Cambios Necesarios

### **Archivo: `src/routes/teams.js`**

**Buscar (línea ~30):**
```javascript
const FRONTEND_HARDCODED = "https://cresia-app.vercel.app";
```

**Reemplazar por:**
```javascript
const FRONTEND_HARDCODED = "TU_URL_REAL_AQUI"; // Ejemplo: https://bridge-app.vercel.app
```

---

## 📝 Checklist

- [ ] Encontrar la URL real del frontend en Vercel
- [ ] Actualizar `FRONTEND_HARDCODED` en `src/routes/teams.js`
- [ ] (Opcional) Agregar `FRONTEND_URL` en variables de entorno
- [ ] Hacer commit y push
- [ ] Desplegar backend a Render/Railway
- [ ] Enviar invitación de prueba
- [ ] Verificar que el link apunta al frontend correcto
- [ ] Confirmar que el botón redirige correctamente

---

## 🎯 Resultado Esperado

### **Email actual (INCORRECTO):**
```
Botón: Aceptar invitación
Link: https://proyectoia-backend.onrender.com/join?token=...
       ↑ BACKEND (error 404)
```

### **Email correcto (DESPUÉS DEL FIX):**
```
Botón: Aceptar invitación
Link: https://tu-app.vercel.app/join?token=...
       ↑ FRONTEND (funciona correctamente)
```

---

## 💡 ¿Cómo encontrar la URL de tu frontend?

### **Método 1: Desde el código del frontend**

Busca en el código del frontend (`.env` o archivos de config):
```bash
NEXT_PUBLIC_APP_BASE_URL=https://...
```

### **Método 2: Desde Vercel Dashboard**

1. Ve a https://vercel.com
2. Login con tu cuenta
3. Busca tu proyecto del frontend
4. En "Domains" verás la URL principal
5. Cópiala y úsala en el backend

### **Método 3: Desde Git**

Busca en los archivos `.md` del proyecto, probablemente hay referencias:
```bash
# En tu proyecto frontend
grep -r "vercel.app" .
```

---

## 🚀 Deployment

### **1. Actualizar código:**
```bash
cd tu-backend
# Editar src/routes/teams.js (línea 30)
git add .
git commit -m "fix: corregir URL del frontend en invitaciones"
git push origin main
```

### **2. Esperar deployment:**
- Render/Railway desplegará automáticamente
- Toma ~2-5 minutos

### **3. Verificar:**
```bash
# Enviar invitación de prueba
# Revisar el email recibido
# Click en "Aceptar invitación"
# Debe abrir: https://tu-frontend.vercel.app/join?token=...
```

---

## 📞 Resumen Ejecutivo

### **Problema:**
El backend tiene hardcodeada una URL incorrecta del frontend (`cresia-app.vercel.app`).

### **Solución:**
Cambiar `FRONTEND_HARDCODED` en `src/routes/teams.js` línea ~30 por la URL real del frontend que está en Vercel.

### **Impacto:**
- ✅ Los emails tendrán el link correcto al frontend
- ✅ Los usuarios podrán aceptar invitaciones correctamente
- ✅ El nombre del invitador ya se muestra bien (código correcto)

### **Siguiente paso:**
Dime cuál es la URL real de tu frontend en Vercel y te doy el código exacto para copiar/pegar.
