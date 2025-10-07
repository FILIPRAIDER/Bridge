# 🔥 FIX CRÍTICO: Strings vacíos en campos opcionales

## ❌ Problema raíz identificado

**Error:** `PATCH /users/:userId/profile 400 Bad Request`

**Causa:** Los campos opcionales del formulario se enviaban como **strings vacíos `""`** en vez de omitirse o enviarse como `undefined`.

### Ejemplo del problema:

#### ❌ Lo que enviaba el frontend ANTES:
```json
{
  "headline": "Desarrollador Fullstack",
  "bio": "Apasionado por agro-tech...",
  "seniority": "Semi Senior",
  "location": "Montería, CO",
  "availability": "",          // ❌ STRING VACÍO (debería ser number o undefined)
  "stack": "",                 // ❌ STRING VACÍO (min 2 chars fallaba)
  "sector": "",                // ❌ STRING VACÍO (min 2 chars fallaba)
  "phone": "+573245693899",
  "phoneE164": "+573245693899",
  "phoneCountry": "CO"
}
```

#### Backend rechazaba porque:
```javascript
// Schema del backend
availability: z.number().int().min(1).max(60).optional(), // ❌ "" no es number
stack: z.string().min(2).max(200).optional(),             // ❌ "" < 2 chars
sector: z.string().min(2).max(120).optional(),            // ❌ "" < 2 chars
```

#### ✅ Lo que envía AHORA (después del fix):
```json
{
  "headline": "Desarrollador Fullstack",
  "bio": "Apasionado por agro-tech...",
  "seniority": "Semi Senior",
  "location": "Montería, CO",
  "availability": 20,          // ✅ NÚMERO o no se incluye
  "stack": "React, Node, Postgres", // ✅ STRING con contenido o no se incluye
  "sector": "Agro",            // ✅ STRING con contenido o no se incluye
  "phone": "+573245693899",
  "phoneE164": "+573245693899",
  "phoneCountry": "CO"
}
```

## ✅ Solución implementada

### 1. ProfileStep.tsx
Limpia el payload ANTES de enviarlo:

```typescript
const cleanPayload: Record<string, any> = {};

Object.entries(data).forEach(([key, value]) => {
  // Si es string vacío o null, NO incluirlo
  if (value === "" || value === null) {
    return;
  }
  cleanPayload[key] = value;
});
```

### 2. ExperienceStep.tsx
Mismo proceso + conversión de fechas:

```typescript
const cleanPayload: Record<string, any> = {};

Object.entries(data).forEach(([key, value]) => {
  if (value === "" || value === null) {
    return; // Omitir campos vacíos
  }
  
  // Convertir fechas YYYY-MM-DD a ISO datetime
  if ((key === "startDate" || key === "endDate") && value) {
    cleanPayload[key] = new Date(value as string).toISOString();
  } else {
    cleanPayload[key] = value;
  }
});
```

### 3. CertificationsStep.tsx
Mismo patrón:

```typescript
const cleanPayload: Record<string, any> = {};

Object.entries(data).forEach(([key, value]) => {
  if (value === "" || value === null) {
    return; // Omitir campos vacíos
  }
  
  // Convertir fecha a ISO datetime
  if (key === "issueDate" && value) {
    cleanPayload[key] = new Date(value as string).toISOString();
  } else {
    cleanPayload[key] = value;
  }
});
```

## 🎯 Por qué funciona ahora

### Comportamiento de react-hook-form:
```tsx
<input {...register("stack")} />
```

Cuando el input está vacío, `register()` devuelve `""` (string vacío), NO `undefined`.

### Zod validation en backend:
```javascript
stack: z.string().min(2).optional()
```

- ✅ `undefined` → válido (campo opcional)
- ✅ `"React, Node"` → válido (>= 2 chars)
- ❌ `""` → **INVÁLIDO** (< 2 chars)

### Solución:
Filtrar el payload antes de enviarlo para que los campos vacíos NO se incluyan:

```typescript
// ANTES
payload = { stack: "" }  // ❌ Backend rechaza

// AHORA
payload = {}  // ✅ Backend acepta (campo omitido = optional)
```

## 📊 Comparación con Postman

### Postman (siempre funcionó):
- Solo incluye campos con valores
- No envía campos vacíos
- Backend valida correctamente

### Frontend (ANTES del fix):
- Incluía TODOS los campos del formulario
- Campos vacíos = `""`
- Backend rechazaba con 400

### Frontend (DESPUÉS del fix):
- Solo incluye campos con valores
- Campos vacíos se omiten
- **Comportamiento idéntico a Postman** ✅

## 🔍 Archivos modificados

1. `src/components/auth/register/ProfileStep.tsx`
   - Limpieza de payload antes de enviar
   - Conversión de teléfono a E164

2. `src/components/auth/register/ExperienceStep.tsx`
   - Limpieza de payload
   - Conversión de fechas a ISO

3. `src/components/auth/register/CertificationsStep.tsx`
   - Limpieza de payload
   - Conversión de fecha a ISO

## ✅ Resultado

### ANTES:
```
PATCH /users/:userId/profile 400 Bad Request
Error: Invalid input...
```

### AHORA:
```
PATCH /users/:userId/profile 200 OK
Profile saved successfully ✅
```

## 🧪 Cómo probar

1. Inicia el backend en puerto 4001
2. Inicia el frontend en puerto 3000
3. Ve a http://localhost:3000/auth/register
4. Completa el paso de **Profile**:
   - Llena los campos obligatorios (headline, bio, seniority, location, phone)
   - **DEJA VACÍOS** los campos opcionales (availability, stack, sector)
   - Click en "Continuar"
5. Verifica en el backend:
   - ✅ Debería responder **200 OK**
   - ✅ Los campos vacíos NO deberían aparecer en el log
   - ✅ El perfil se guarda correctamente

## 💡 Lección aprendida

**Problema común en formularios con react-hook-form + Zod:**

Los campos opcionales con validaciones `.min()` SIEMPRE deben filtrarse antes de enviar al backend, porque:

1. HTML inputs vacíos = `""` (no `undefined`)
2. Zod valida `""` y falla en `.min(2)`
3. Campos opcionales deben ser `undefined` o tener valor válido

**Solución universal:**
```typescript
// Limpiar payload antes de enviar
const cleanPayload = Object.fromEntries(
  Object.entries(data).filter(([_, v]) => v !== "" && v !== null)
);
```

## 📝 Nota final

Este patrón de limpieza de payload debería aplicarse a **TODOS** los formularios con campos opcionales que tengan validaciones `.min()` en el backend.
