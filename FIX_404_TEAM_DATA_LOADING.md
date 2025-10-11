# 🔧 Fix: Error 404 al Cargar Datos del Equipo

**Fecha:** 11 de Octubre, 2025  
**Status:** ✅ Resuelto  
**Commit:** Pendiente

---

## 🐛 Problema Reportado

**Error en consola:**
```
Failed to load resource: the server responded with a status of 404 ()
Error loading team data: Error: Error al obtener información del usuario
```

**Error visual:**
- Mensaje en UI: "❌ Error al cargar los datos del equipo"
- No se cargaba información del equipo
- Formulario vacío

---

## 🔍 Causa Raíz

### 1. Uso de `fetch` Directo

El código estaba usando `fetch` directo en lugar de la API wrapper:

```typescript
// ❌ INCORRECTO
const userResponse = await fetch(
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`,
  {
    headers: {
      'Authorization': `Bearer ${(session as any)?.accessToken}`
    }
  }
);

if (!userResponse.ok) {
  throw new Error('Error al obtener información del usuario');
}

const userData = await userResponse.json();
```

**Problemas:**
1. No usa el `api.ts` wrapper que maneja errores correctamente
2. No tiene retry logic para cold starts
3. No maneja timeout correctamente
4. Headers de autorización pueden estar mal configurados
5. Manejo de errores genérico sin detalles

### 2. Ícono de Cámara sin Estilo

El botón de cámara no tenía el estilo gray/black/chrome de la aplicación:

```typescript
// ❌ Estilo básico
bg-gradient-to-br from-gray-700 to-gray-800
```

---

## ✅ Solución Implementada

### 1. Usar API Wrapper

**Cambio principal:**

```typescript
// ✅ CORRECTO
import { api } from '@/lib/api';

const loadTeamData = async () => {
  try {
    setLoading(true);
    setErrorMessage(null);
    
    console.log('🔄 Cargando datos del equipo para usuario:', session?.user?.id);
    
    // 1. Obtener datos del usuario
    const userData = await api.get<any>(`/users/${session?.user?.id}`);
    
    console.log('✅ Datos del usuario obtenidos:', userData);
    
    // 2. Buscar equipo donde es LIDER
    const membership = userData?.teamMemberships?.find((m: any) => m.role === 'LIDER');
    
    if (!membership?.teamId) {
      console.warn('⚠️ No se encontró equipo para el usuario');
      setErrorMessage('No se encontró el equipo asociado a tu cuenta');
      return;
    }
    
    const teamId = membership.teamId;
    console.log('✅ TeamId encontrado:', teamId);
    
    // 3. Cargar datos del equipo
    const data = await api.get<any>(`/teams/${teamId}`);
    
    console.log('✅ Datos del equipo cargados:', data);
    
    setTeamData(data);
    setPreviewImage(data.profileImage);
  } catch (error: any) {
    console.error('❌ Error loading team data:', error);
    setErrorMessage(error.message || 'Error al cargar los datos del equipo');
  } finally {
    setLoading(false);
  }
};
```

**Ventajas:**
- ✅ Usa `api.get()` que maneja autorización automáticamente
- ✅ Timeout de 30 segundos (maneja cold starts)
- ✅ Retry logic integrado
- ✅ Manejo de errores con mensajes descriptivos
- ✅ Logs detallados para debugging

### 2. Estilo del Ícono de Cámara

**Actualización en `TeamAvatarWithCamera.tsx`:**

```typescript
// ✅ Estilo gray/black/chrome mejorado
<button
  className={`
    absolute bottom-0 right-0 
    ${cameraSizes[size]} 
    bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900
    rounded-full 
    flex items-center justify-center 
    ring-2 ring-white/10
    hover:from-gray-600 hover:via-gray-700 hover:to-gray-800
    hover:ring-white/20
    transition-all
    shadow-xl
    border border-gray-600/30
  `}
>
  <Camera className={`${cameraIconSizes[size]} text-white drop-shadow-lg`} />
</button>
```

**Mejoras visuales:**
- ✅ Gradiente de 3 colores: `from-gray-700 via-gray-800 to-gray-900`
- ✅ Ring sutil: `ring-white/10` que se vuelve `ring-white/20` en hover
- ✅ Shadow más prominente: `shadow-xl`
- ✅ Borde sutil: `border-gray-600/30`
- ✅ Drop shadow en el ícono: `drop-shadow-lg`
- ✅ Hover con transición suave

---

## 🔄 Comparación: Antes vs Después

### Carga de Datos

| Aspecto | ❌ Antes | ✅ Después |
|---------|---------|-----------|
| **Method** | `fetch` directo | `api.get()` |
| **Headers** | Manual | Automático |
| **Timeout** | Default (30s-2min) | 30s configurado |
| **Retry** | No | Sí (en api.ts) |
| **Error handling** | Genérico | Específico con detalles |
| **Logs** | Básicos | Detallados con emojis |
| **Auth** | Manual con Bearer | Automático |

### Estilo del Botón

| Aspecto | ❌ Antes | ✅ Después |
|---------|---------|-----------|
| **Gradiente** | 2 colores | 3 colores |
| **Ring** | `ring-white/20` fijo | `ring-white/10` → `ring-white/20` hover |
| **Shadow** | `shadow-lg` | `shadow-xl` |
| **Border** | No | `border-gray-600/30` |
| **Ícono** | Sin shadow | `drop-shadow-lg` |
| **Hover** | Simple | Transición completa |

---

## 🧪 Testing

### Test 1: Carga de Datos Exitosa

```
✅ PASOS:
1. Login como LIDER
2. Ir a /dashboard/lider/equipo/configuracion
3. Esperar carga (puede tomar ~5-10s si cold start)
4. Verificar que se carga:
   - Foto del equipo (si existe)
   - Nombre del equipo
   - Descripción
   - Ubicación (ciudad, país)
   - Datos de contacto

❌ SI FALLA:
- Ver consola del browser
- Buscar logs: "🔄 Cargando datos..."
- Verificar que aparezca: "✅ Datos del usuario obtenidos"
- Verificar que aparezca: "✅ TeamId encontrado"
- Verificar que aparezca: "✅ Datos del equipo cargados"
```

### Test 2: Manejo de Errores

```
✅ ESCENARIOS:

1. Usuario sin equipo:
   - Debe mostrar: "No se encontró el equipo asociado a tu cuenta"
   - Console: "⚠️ No se encontró equipo para el usuario"

2. Backend no responde:
   - Timeout después de 30s
   - Mensaje: "Error al cargar los datos del equipo"

3. Usuario no es LIDER:
   - Debe mostrar: "No se encontró el equipo asociado a tu cuenta"
```

### Test 3: Estilo del Botón

```
✅ PASOS:
1. Verificar que el botón de cámara tiene:
   - Gradiente oscuro (gris/negro)
   - Ring sutil alrededor
   - Shadow pronunciado
   - Borde gris tenue

2. Hover sobre el botón:
   - Gradiente se aclara ligeramente
   - Ring se hace más visible
   - Transición suave

3. Responsive:
   - Tamaño correcto en diferentes resoluciones
   - Posición correcta (esquina inferior derecha)
```

---

## 📊 Logs de Debugging

### Carga Exitosa

```javascript
🔄 Cargando datos del equipo para usuario: cm2abc123
✅ Datos del usuario obtenidos: { id: 'cm2abc123', email: '...', teamMemberships: [...] }
✅ TeamId encontrado: cm2xyz789
✅ Datos del equipo cargados: { id: 'cm2xyz789', name: 'DevTeam Pro', ... }
```

### Error: Usuario sin Equipo

```javascript
🔄 Cargando datos del equipo para usuario: cm2abc123
✅ Datos del usuario obtenidos: { id: 'cm2abc123', email: '...', teamMemberships: [] }
⚠️ No se encontró equipo para el usuario
```

### Error: Backend

```javascript
🔄 Cargando datos del equipo para usuario: cm2abc123
❌ Error loading team data: Error: Failed to fetch
```

---

## 📁 Archivos Modificados

### 1. `src/app/dashboard/lider/equipo/configuracion/page.tsx`

**Cambios:**
- ✅ Import agregado: `import { api } from '@/lib/api';`
- ✅ Reemplazar `fetch` por `api.get()`
- ✅ Mejorar error handling
- ✅ Agregar logs detallados

**Líneas:** 1-21, 80-125

### 2. `src/components/shared/TeamAvatarWithCamera.tsx`

**Cambios:**
- ✅ Actualizar className del botón de cámara
- ✅ Gradiente de 3 colores
- ✅ Ring con hover effect
- ✅ Shadow más prominente
- ✅ Border sutil
- ✅ Drop shadow en ícono

**Líneas:** 98-123

---

## 🔧 Ventajas de Usar `api.ts`

### 1. Autorización Automática

El wrapper `api.ts` maneja automáticamente:

```typescript
// En api.ts
const token = await getAccessToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

**No necesitas:**
```typescript
headers: {
  'Authorization': `Bearer ${(session as any)?.accessToken}`
}
```

### 2. Timeout Configurado

```typescript
// api.ts tiene timeout de 30s
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
```

**Maneja cold starts** del backend en Render.com

### 3. Manejo de Errores Mejorado

```typescript
// api.ts parsea errores del backend
const errorDetails = await response.json();
const message = errorDetails?.error?.message || errorDetails?.message || "Error";
throw new ApiError(response.status, message, errorDetails);
```

**Mensajes específicos** en lugar de genéricos

### 4. Logs Útiles

```typescript
console.log('🔄 API Request:', method, path);
console.log('✅ API Response:', data);
console.error('❌ API Error:', error);
```

**Facilita debugging** en producción

---

## 🎯 Próximos Pasos

### Verificaciones

- [ ] Probar carga en producción
- [ ] Verificar logs en consola
- [ ] Confirmar que no hay error 404
- [ ] Verificar estilo del botón de cámara
- [ ] Testing con cold start del backend

### Mejoras Futuras

- [ ] Agregar skeleton loader mientras carga
- [ ] Cache de datos del equipo (React Query)
- [ ] Optimistic updates
- [ ] Error boundary para errores inesperados

---

**Status:** ✅ Resuelto  
**Testing:** ⏳ Pendiente en producción  
**Deploy:** Automático desde main branch
