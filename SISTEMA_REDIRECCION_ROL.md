# Sistema de Redirección por Rol - Dashboard

## 🎯 Problema Resuelto

El sistema redirigía a todos los usuarios a `/dashboard` genérico después del login/registro, sin considerar su rol (LIDER, MIEMBRO, EMPRESARIO).

## ✅ Solución Implementada

### 1. **Dashboard Inteligente (`/dashboard/page.tsx`)**

Ahora el dashboard principal actúa como un **router inteligente** que:

```tsx
- Detecta el rol del usuario desde la sesión de NextAuth
- Redirige automáticamente según el rol:
  - LIDER → /dashboard/lider
  - ADMIN → /dashboard/lider
  - ESTUDIANTE → /dashboard/miembro
  - EMPRESARIO → /empresa
- Muestra loading mientras detecta y redirige
- Si no hay sesión, redirige a /auth/login
```

### 2. **Flujo de Login Actualizado**

**Antes:**
```
Login → /dashboard (página genérica vacía)
```

**Después:**
```
Login → /dashboard → Detecta rol → Redirige automáticamente
  ├─ LIDER → /dashboard/lider
  ├─ ESTUDIANTE → /dashboard/miembro
  └─ EMPRESARIO → /empresa
```

### 3. **Flujo de Registro Mejorado**

**Antes:**
```
Registro completo → /dashboard (sin sesión, página vacía)
```

**Después:**
```
Registro completo → /auth/login?registered=true
  ↓
Usuario inicia sesión
  ↓
/dashboard → Detecta rol → Redirige según rol
```

**Mejoras:**
- Toast de bienvenida: "¡Registro exitoso! Ahora inicia sesión"
- Query param `?registered=true` para mostrar mensaje personalizado
- Clear de Zustand para limpiar datos temporales del registro

---

## 🔄 Flujos Completos

### Flujo 1: Usuario Nuevo (Estudiante/Miembro)

1. Ir a `/auth/register`
2. Seleccionar "Estudiante / Miembro"
3. Llenar datos → Crear cuenta
4. Completar perfil (opcional)
5. **Redirige a `/auth/login?registered=true`**
6. Toast: "¡Registro exitoso! Inicia sesión"
7. Iniciar sesión con email/password
8. **Redirige a `/dashboard` → Detecta rol → `/dashboard/miembro`**

### Flujo 2: Usuario Nuevo (Líder de Equipo)

1. Ir a `/auth/register`
2. Seleccionar "Líder de Equipo"
3. Llenar datos + nombre del equipo → Crear cuenta
4. Completar perfil (opcional)
5. **Redirige a `/auth/login?registered=true`**
6. Iniciar sesión
7. **Redirige a `/dashboard` → Detecta rol LIDER → `/dashboard/lider`**

### Flujo 3: Usuario Existente

1. Ir a `/auth/login`
2. Ingresar credenciales
3. **Redirige a `/dashboard`**
4. Sistema detecta rol automáticamente:
   - Si es LIDER → `/dashboard/lider`
   - Si es ESTUDIANTE → `/dashboard/miembro`
   - Si es EMPRESARIO → `/empresa`

### Flujo 4: Click en "Dashboard" desde Header

1. Usuario logueado click en botón "Dashboard"
2. Va a `/dashboard`
3. **Redirige automáticamente según su rol**

---

## 📂 Estructura de Rutas

```
/dashboard
  ├─ page.tsx (Router inteligente - detecta y redirige)
  ├─ lider/
  │  └─ page.tsx (Dashboard para líderes y admins)
  └─ miembro/
     └─ page.tsx (Dashboard para estudiantes/miembros)

/empresa
  └─ ... (Dashboard para empresarios)
```

---

## 🔧 Archivos Modificados

### 1. `/app/dashboard/page.tsx`
**Cambio:** Convertido en router inteligente con detección de rol

```tsx
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

- Usa useSession() de NextAuth para obtener el rol
- useEffect detecta cambios en la sesión
- Redirige automáticamente según el rol
- Muestra spinner mientras detecta
```

### 2. `/app/auth/login/page.tsx`
**Cambios:**
- Import de `useSearchParams` para detectar query params
- useEffect para mostrar toast de bienvenida si `?registered=true`
- Redirige a `/dashboard` (que luego redirige según rol)
- Mensaje de toast: "Redirigiendo..." en vez de "al dashboard"

### 3. `/app/auth/register/page.tsx`
**Cambios en `handleSkipToEnd` y `handleFinish`:**
- Ahora redirigen a `/auth/login?registered=true`
- Limpian Zustand con `clear()`
- Toast dice "Redirigiendo..." en vez de "al dashboard"

---

## 🎨 Experiencia de Usuario

### Antes ❌
1. Registro → Dashboard vacío que dice "Aquí irá la gestión..."
2. Usuario confundido, no ve su dashboard real
3. Tiene que navegar manualmente a su dashboard

### Después ✅
1. Registro → Login con mensaje de éxito
2. Login → Dashboard se carga automáticamente según rol
3. Usuario ve inmediatamente su dashboard personalizado
4. Experiencia fluida y sin confusión

---

## 🔒 Seguridad

- **Sin sesión**: Redirige a `/auth/login`
- **Roles validados**: Solo roles válidos acceden a sus dashboards
- **Fallback**: Si rol no reconocido → `/dashboard/miembro`
- **Loading state**: Evita FOUC (Flash of Unstyled Content)

---

## 📝 Roles Soportados

| Rol | Redirige a | Descripción |
|-----|------------|-------------|
| `ESTUDIANTE` | `/dashboard/miembro` | Estudiantes y miembros de equipos |
| `LIDER` | `/dashboard/lider` | Líderes de equipo |
| `ADMIN` | `/dashboard/lider` | Administradores (mismo dashboard que líderes) |
| `EMPRESARIO` | `/empresa` | Empresas que publican proyectos |

---

## 🧪 Testing

### Test 1: Registro como Estudiante
```bash
1. Ir a /auth/register
2. Seleccionar "Estudiante / Miembro"
3. Completar registro
4. Verificar redirección a /auth/login con toast
5. Iniciar sesión
6. Verificar llegada a /dashboard/miembro
```

### Test 2: Registro como Líder
```bash
1. Ir a /auth/register
2. Seleccionar "Líder de Equipo"
3. Completar registro
4. Verificar redirección a /auth/login
5. Iniciar sesión
6. Verificar llegada a /dashboard/lider
```

### Test 3: Login Usuario Existente
```bash
1. Ir a /auth/login
2. Ingresar credenciales
3. Verificar redirección según rol del usuario
```

### Test 4: Click Dashboard en Header
```bash
1. Usuario logueado
2. Click en botón "Dashboard" del header
3. Verificar redirección correcta según su rol
```

### Test 5: Acceso Directo a /dashboard
```bash
1. Usuario logueado accede a /dashboard
2. Verificar que redirige automáticamente según rol
3. No debe quedarse en la página genérica
```

---

## 🚀 Próximas Mejoras

### Sugeridas
- [ ] Agregar opción de subir foto de perfil en `/dashboard/miembro` y `/dashboard/lider`
- [ ] Mostrar progreso de completitud del perfil
- [ ] Onboarding tutorial la primera vez que acceden al dashboard
- [ ] Breadcrumbs para navegación más clara
- [ ] Dashboard personalizado según progreso del usuario

---

## 📚 Notas Técnicas

### Por qué no login automático después del registro

Decidimos NO hacer login automático después del registro porque:

1. **Seguridad**: El usuario debe confirmar que recuerda su contraseña
2. **UX Estándar**: La mayoría de apps requieren login después de registro
3. **Simplicidad**: Evita manejar tokens de sesión durante el registro
4. **Feedback claro**: El toast de "registro exitoso" da confirmación clara

### Por qué el router en /dashboard

En lugar de redirigir directamente desde login/registro:

1. **DRY Principle**: Un solo lugar para la lógica de detección de rol
2. **Consistencia**: Todos los accesos a `/dashboard` funcionan igual
3. **Mantenibilidad**: Cambiar lógica de rol en un solo archivo
4. **Fallback seguro**: Si alguien accede directo a `/dashboard`, funciona

---

**Fecha:** 6 de octubre de 2025  
**Versión:** 2.0.0  
**Estado:** ✅ Completado y testeado
