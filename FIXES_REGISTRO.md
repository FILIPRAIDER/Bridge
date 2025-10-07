# 🔧 Fixes del Registro Multi-Fase

## 📋 Problemas encontrados y solucionados

### 1. ❌ Password no se enviaba (CRÍTICO)
**Problema:** El componente `PasswordInput` no estaba integrado con `react-hook-form`
- Usaba su propio estado interno (`useState`)
- No enviaba el valor al formulario
- Backend recibía `password: undefined`
- Error: "Invalid input: expected string, received undefined"

**Solución:** 
- Convertí `PasswordInput` a componente compatible con `react-hook-form` usando `forwardRef`
- Ahora acepta `ref`, `onChange`, `value`, `onBlur` correctamente
- En `AccountStep.tsx` usa `{...register("password")}`

### 2. ❌ ProfileStep: Mismatch de tipos (CRÍTICO)
**Problema:** El schema del backend NO coincidía con el frontend

| Campo | Backend espera | Frontend enviaba | Estado |
|-------|----------------|------------------|---------|
| `availability` | `number` (1-60 días) | `string` ("Tiempo completo") | ❌ ERROR |
| `phoneE164` | `string` (opcional) | ❌ No existía | ❌ FALTABA |
| `phoneCountry` | `string` (2 chars) | ❌ No existía | ❌ FALTABA |

**Solución:**
1. Actualicé `MemberProfile` interface en `types/api.ts`:
   ```typescript
   availability?: number; // Días disponibles (1-60)
   phoneE164?: string; // Formato E.164 (+573001234567)
   phoneCountry?: string; // ISO alpha-2 (CO, US, etc.)
   ```

2. Actualicé `ProfileSchema`:
   ```typescript
   availability: z.number().int().min(1).max(60).optional()
   ```

3. Cambié el select de disponibilidad a valores numéricos:
   ```tsx
   <option value="20">Tiempo completo (20 días/mes)</option>
   ```

4. Agregué transformación automática en `onSubmit`:
   ```typescript
   const parsed = parsePhoneNumber(data.phone);
   payload = {
     ...payload,
     phoneE164: parsed.number,
     phoneCountry: parsed.country,
   };
   ```

### 3. ❌ ExperienceStep: Fechas en formato incorrecto
**Problema:** Los inputs `type="date"` devuelven `YYYY-MM-DD`, pero el backend espera ISO datetime (`YYYY-MM-DDTHH:mm:ss.sssZ`)

**Solución:**
```typescript
const payload = {
  ...data,
  startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
  endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
};
```

### 4. ❌ CertificationsStep: Mismo problema de fechas
**Problema:** Campo `issueDate` en formato `YYYY-MM-DD` en vez de ISO datetime

**Solución:**
```typescript
const basePayload = {
  ...data,
  issueDate: data.issueDate ? new Date(data.issueDate).toISOString() : undefined,
};
```

## ✅ Archivos modificados

### 1. `src/components/ui/password-input.tsx`
- Convertido a componente `forwardRef`
- Ahora compatible con `react-hook-form`
- Acepta props: `onChange`, `value`, `onBlur`, `ref`

### 2. `src/types/api.ts`
- Actualizado `MemberProfile` interface:
  - `availability?: number` (era string)
  - Agregado `phoneE164?: string`
  - Agregado `phoneCountry?: string`
  - Agregado `identityType`, `documentNumber`, `birthdate`

### 3. `src/components/auth/register/AccountStep.tsx`
- Integrado `PasswordInput` con `{...register("password")}`

### 4. `src/components/auth/register/ProfileStep.tsx`
- Schema actualizado para coincidir con backend
- Select de disponibilidad ahora usa valores numéricos
- Procesamiento de teléfono para extraer E164 y país
- Importado `parsePhoneNumber` de libphonenumber-js

### 5. `src/components/auth/register/ExperienceStep.tsx`
- Conversión de fechas `YYYY-MM-DD` a ISO datetime

### 6. `src/components/auth/register/CertificationsStep.tsx`
- Conversión de fecha `issueDate` a ISO datetime

## 🔍 Validaciones del Backend

### Endpoints correctos (según routes suministradas):

#### POST /users
```json
{
  "name": "string",
  "email": "string",
  "role": "EMPRESARIO" | "ESTUDIANTE" | "ADMIN",
  "password": "string (8-72 chars, mayúscula, número, especial)"
}
```

#### POST/PATCH /users/:userId/profile
```json
{
  "headline": "string (2-120 chars, opcional)",
  "bio": "string (max 2000 chars, opcional)",
  "seniority": "string (2-40 chars, opcional)",
  "location": "string (2-120 chars, opcional)",
  "availability": "number (1-60, opcional)",
  "stack": "string (2-200 chars, opcional)",
  "sector": "string (2-120 chars, opcional)",
  "identityType": "CC|TI|CE|PEP|PASAPORTE|NIT (opcional)",
  "documentNumber": "string (3-40 chars, opcional)",
  "phone": "string (7-30 chars, opcional)",
  "phoneE164": "string (formato +573001234567, opcional)",
  "phoneCountry": "string (2 chars ISO, opcional)",
  "birthdate": "string (ISO datetime, opcional)"
}
```

#### POST/PATCH /users/:userId/experiences
```json
{
  "role": "string (2-120 chars)",
  "company": "string (2-160 chars, opcional)",
  "startDate": "string (ISO datetime, opcional)",
  "endDate": "string (ISO datetime, opcional)",
  "description": "string (max 2000 chars, opcional)"
}
```

#### POST/PATCH /users/:userId/certifications
```json
{
  "name": "string (2-160 chars)",
  "issuer": "string (2-160 chars, opcional)",
  "issueDate": "string (ISO datetime, opcional)",
  "url": "string (URL, opcional)",
  "fileUrl": "string (URL, opcional)",
  "fileProvider": "string (2-40 chars, opcional)",
  "fileKey": "string (opcional)",
  "fileType": "string (3-100 chars, opcional)",
  "fileSize": "number (max 10MB, opcional)",
  "fileWidth": "number (max 20000, opcional)",
  "fileHeight": "number (max 20000, opcional)"
}
```

#### POST /users/:userId/skills
```json
{
  "skillId": "string",
  "level": "number (1-5)"
}
```

#### POST /teams
```json
{
  "name": "string (min 2 chars)",
  "city": "string (min 2 chars, opcional)",
  "area": "string (2-50 chars, opcional)"
}
```

#### POST /teams/:teamId/members
```json
{
  "userId": "string",
  "role": "LIDER" | "MIEMBRO"
}
```

#### POST /companies
```json
{
  "name": "string (min 2 chars)",
  "sector": "string (opcional)",
  "city": "string (opcional)",
  "website": "string (URL, opcional)",
  "about": "string (opcional)"
}
```

## 🎯 Próximos pasos

1. **Probar el registro completo:**
   - http://localhost:3000/auth/register
   - Completar los 5 pasos: Account → Profile → Experience → Certifications → Skills

2. **Verificar backend:**
   - Asegurarse que el backend esté corriendo en puerto 4001
   - Verificar que todas las rutas estén registradas correctamente

3. **Pendientes:**
   - Implementar dashboard para EMPRESARIO (actualmente solo LIDER y MIEMBRO)
   - Mejorar manejo de errores con mensajes más específicos
   - Agregar validación de archivos (tipos MIME, tamaño) en frontend

## 📝 Notas importantes

- **Passwords:** Ahora se envían correctamente con todas las validaciones
- **Fechas:** Siempre se convierten a ISO datetime antes de enviar al backend
- **Teléfonos:** Se extraen automáticamente formato E164 y código de país
- **Availability:** Ahora es número de días/mes (no string)
- **Rol LIDER:** Se mapea a ESTUDIANTE en backend pero se mantiene en frontend para la lógica de UI
