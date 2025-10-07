# 🔧 ERROR: Missing publicKey during ImageKit initialization

## ❌ Problema

```
Error: Missing publicKey during ImageKit initialization
```

**Causa:** El archivo `.env` no existe, está vacío, o no se está cargando correctamente.

El log muestra: `injecting env (0) from .env` → **0 variables cargadas** ❌

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar que `.env` existe

```powershell
# En la raíz del backend
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
dir .env
```

**Si dice "No se encuentra el archivo":**
```powershell
# Crear el archivo
New-Item -Path .env -ItemType File
```

---

### Paso 2: Agregar las Variables de Entorno

Abre `C:\Users\filip\OneDrive\Desktop\ProyectoIA\.env` y agrega:

```env
# ImageKit Configuration
IK_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxxxxxxxx
IK_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxxxxxx
IK_URL_ENDPOINT=https://ik.imagekit.io/tu_id_aqui

# Database URL
DATABASE_URL=postgresql://user:pass@host:port/db?connection_limit=3&pool_timeout=20

# API Base URL
API_BASE_URL=http://localhost:4001

# App Base URL
APP_BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

---

### Paso 3: Obtener Credenciales de ImageKit

1. Ve a https://imagekit.io/dashboard
2. Inicia sesión
3. Click en **"Developer Options"** (menú izquierdo)
4. Click en **"API Keys"**
5. Copia:
   - **Public Key** → Pega en `IK_PUBLIC_KEY`
   - **Private Key** → Pega en `IK_PRIVATE_KEY`
   - **URL Endpoint** → Pega en `IK_URL_ENDPOINT`

**Ejemplo:**
```env
IK_PUBLIC_KEY=public_abc123def456ghi789
IK_PRIVATE_KEY=private_xyz987wvu654tsr321
IK_URL_ENDPOINT=https://ik.imagekit.io/demo123
```

---

### Paso 4: Verificar que las Variables se Cargan

#### Opción A: Verificar en el código

Agrega esto **temporalmente** en tu `server.js`:

```javascript
// TEMPORAL: Verificar variables de entorno
console.log("🔍 Verificando variables de entorno:");
console.log("   IK_PUBLIC_KEY:", process.env.IK_PUBLIC_KEY ? "✅ Cargada" : "❌ FALTA");
console.log("   IK_PRIVATE_KEY:", process.env.IK_PRIVATE_KEY ? "✅ Cargada" : "❌ FALTA");
console.log("   IK_URL_ENDPOINT:", process.env.IK_URL_ENDPOINT ? "✅ Cargada" : "❌ FALTA");
console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "✅ Cargada" : "❌ FALTA");
```

#### Opción B: Comando en terminal

```powershell
# En PowerShell (Windows)
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
Get-Content .env
```

Deberías ver las variables.

---

### Paso 5: Restart con Variables Frescas

```powershell
# Detener el servidor
# Ctrl+C si está corriendo

# Limpiar caché de Node (opcional)
rm -Recurse -Force node_modules/.cache

# Reiniciar
bun run dev
```

---

### Paso 6: Usar el Código Corregido

Reemplaza tu `src/routes/uploads.route.js` con el archivo **`FIXED_uploads_route.js`** que creé.

**Cambios clave:**
- ✅ Inicialización lazy de ImageKit (solo cuando se necesita)
- ✅ Validación de variables antes de inicializar
- ✅ Logs detallados para debugging
- ✅ Mensajes de error claros

---

## 🔍 Verificación Final

Después de restart, deberías ver en la consola:

```
✅ Inicializando ImageKit...
   Public Key: public_abc123def456...
   URL Endpoint: https://ik.imagekit.io/demo123
✅ ImageKit inicializado correctamente
```

**Si ves esto, ¡funciona!** ✅

---

## 🐛 Problemas Comunes

### 1. "injecting env (0) from .env"

**Causa:** El archivo `.env` no existe o está en la ubicación incorrecta.

**Solución:**
```powershell
# Verifica la ubicación del .env
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
dir .env

# Debe estar en la RAÍZ del proyecto backend, NO en src/
```

### 2. Variables no se cargan con `dotenv`

**Causa:** `dotenv` no está configurado correctamente.

**Solución:** Verifica tu `server.js`:

```javascript
// Debe estar AL INICIO del archivo
import 'dotenv/config'; // ES Modules
// O
require('dotenv').config(); // CommonJS

// LUEGO importar todo lo demás
import express from 'express';
// ...
```

### 3. Espacios extra en las credenciales

**Causa:** Copiaste las credenciales con espacios.

**Solución:**
```env
# ❌ MAL (con espacios)
IK_PUBLIC_KEY = public_abc123

# ✅ BIEN (sin espacios)
IK_PUBLIC_KEY=public_abc123
```

### 4. Archivo .env.example en lugar de .env

**Causa:** Estás editando el archivo de ejemplo.

**Solución:**
```powershell
# Copiar .env.example a .env
Copy-Item .env.example .env

# Luego editar .env con las credenciales reales
notepad .env
```

---

## 📋 Checklist Final

Antes de continuar, verifica:

- [ ] Archivo `.env` existe en la raíz del backend
- [ ] Variables `IK_PUBLIC_KEY`, `IK_PRIVATE_KEY`, `IK_URL_ENDPOINT` están configuradas
- [ ] Sin espacios extra antes/después del `=`
- [ ] Credenciales copiadas correctamente desde ImageKit dashboard
- [ ] Backend reiniciado después de agregar variables
- [ ] Logs muestran "✅ ImageKit inicializado correctamente"

---

## 🚀 Próximo Paso

Una vez que el backend inicie sin errores, prueba el upload:

```powershell
# Probar endpoint con cURL
curl -X POST http://localhost:4001/uploads/users/cmgg5vijw0000cknsguj8gx2y/avatar `
  -F "file=@C:\ruta\a\imagen.jpg"
```

O desde el frontend:
```bash
cd C:\Users\filip\OneDrive\Desktop\ia-app
npm run dev
```

Luego ve a "Mi Perfil" y sube un avatar.

---

**🎯 Objetivo:** Ver este log en el backend:

```
📤 Upload avatar request for user: cmgg5vijw0000cknsguj8gx2y
📁 File received: avatar.jpg, 45231 bytes
🚀 Uploading to ImageKit: avatar_xxx_1696680000.jpg
✅ Upload successful: https://ik.imagekit.io/...
💾 Database updated for user cmgg5vijw0000cknsguj8gx2y
```

¡Eso significa que funcionó! 🎉
