# 🔧 ERROR: Unknown argument `avatarUrl` - Prisma Schema Fix

## ❌ Problema

```
Unknown argument `avatarUrl`. Available options are marked with ?.
```

**Causa:** El campo `avatarUrl` no existe en el modelo `User` de tu schema de Prisma.

---

## ✅ Solución: Agregar `avatarUrl` al Schema

### Paso 1: Abrir el Schema de Prisma

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
notepad prisma\schema.prisma
```

---

### Paso 2: Encontrar el Modelo `User`

Busca algo como esto:

```prisma
model User {
  id              String            @id @default(cuid())
  name            String
  email           String            @unique
  role            Role              @default(ESTUDIANTE)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  passwordHash    String?
  onboardingStep  OnboardingStep    @default(ACCOUNT_CREATED)
  
  // Relaciones
  skills          UserSkill[]
  teamMemberships TeamMember[]
  profile         MemberProfile?
  certifications  Certification[]
  experiences     Experience[]
  invitesSent     TeamInvite[]      @relation("InvitedBy")
}
```

---

### Paso 3: Agregar el Campo `avatarUrl`

**Agrega esta línea** después de `onboardingStep`:

```prisma
model User {
  id              String            @id @default(cuid())
  name            String
  email           String            @unique
  role            Role              @default(ESTUDIANTE)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  passwordHash    String?
  onboardingStep  OnboardingStep    @default(ACCOUNT_CREATED)
  avatarUrl       String?           // 👈 AGREGAR ESTA LÍNEA
  
  // Relaciones
  skills          UserSkill[]
  teamMemberships TeamMember[]
  profile         MemberProfile?
  certifications  Certification[]
  experiences     Experience[]
  invitesSent     TeamInvite[]      @relation("InvitedBy")
}
```

**Nota:** 
- `String?` significa que es **opcional** (puede ser `null`)
- Si quieres que sea obligatorio, usa `String` (sin `?`)

---

### Paso 4: Guardar el Archivo

Presiona `Ctrl+S` en Notepad y cierra.

---

### Paso 5: Crear la Migración

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA

# Crear migración
npx prisma migrate dev --name add_avatar_url_to_user
```

**Esto hará:**
1. Crear el archivo de migración en `prisma/migrations/`
2. Ejecutar la migración en la base de datos (agregar columna `avatarUrl`)
3. Regenerar el cliente de Prisma con el nuevo campo

**Output esperado:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "xxx", schema "public" at "xxx"

Applying migration `20251007123456_add_avatar_url_to_user`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251007123456_add_avatar_url_to_user/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client
```

---

### Paso 6: Verificar la Migración

Abre el archivo de migración:

```powershell
# Ver la última migración
Get-ChildItem prisma\migrations -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1 | ForEach-Object { Get-Content "$($_.FullName)\migration.sql" }
```

Deberías ver algo como:

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
```

---

### Paso 7: Restart el Backend

```powershell
# Ctrl+C para detener
bun run dev
```

---

### Paso 8: Probar el Upload

1. Ve al frontend: http://localhost:3000
2. Login como usuario
3. Ve a "Mi Perfil"
4. Sube una imagen
5. ✅ Debería funcionar sin errores

---

## 🔍 Verificar en la Base de Datos

### Opción 1: Prisma Studio

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
npx prisma studio
```

1. Se abrirá en el navegador
2. Click en "User"
3. Busca tu usuario
4. Deberías ver la columna `avatarUrl`

### Opción 2: SQL Directo

Si tienes acceso a la DB:

```sql
-- Verificar que la columna existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'avatarUrl';

-- Ver usuarios con avatares
SELECT id, name, email, "avatarUrl" FROM "User" WHERE "avatarUrl" IS NOT NULL;
```

---

## 🐛 Problemas Comunes

### 1. Error: "Cannot find module '@prisma/client'"

```powershell
npx prisma generate
```

### 2. Error: "Migration failed"

**Causa:** Ya existe una migración con cambios no aplicados.

**Solución:**
```powershell
# Ver estado de migraciones
npx prisma migrate status

# Si hay pending migrations, aplicarlas
npx prisma migrate deploy
```

### 3. Error: "Database is not in sync"

```powershell
# Reset la base de datos (CUIDADO: borra datos)
npx prisma migrate reset

# O crear una nueva migración
npx prisma migrate dev --name fix_sync
```

### 4. Campo no aparece después de migrar

```powershell
# Regenerar cliente de Prisma
npx prisma generate

# Restart backend
bun run dev
```

---

## 📋 Checklist

Antes de probar de nuevo:

- [ ] Campo `avatarUrl String?` agregado al modelo `User` en `schema.prisma`
- [ ] Migración creada con `prisma migrate dev`
- [ ] Cliente de Prisma regenerado (automático con migrate)
- [ ] Backend reiniciado
- [ ] No hay errores en la consola del backend al iniciar

---

## 🎯 Resultado Esperado

### En el Backend (logs):

```
📤 Upload avatar request for user: cmgg5vijw0000cknsguj8gx2y
📁 File received: avatar.png, 45231 bytes
🚀 Uploading to ImageKit: avatar_cmgg5vijw0000cknsguj8gx2y_1759819336433.png
✅ Upload successful: https://ik.imagekit.io/n9g1xv1xl/avatars/...
💾 Database updated for user cmgg5vijw0000cknsguj8gx2y
POST /uploads/users/cmgg5vijw0000cknsguj8gx2y/avatar 200 1517.118 ms - 200
```

### En el Frontend:

```
✅ Foto de perfil actualizada exitosamente
```

---

## 📝 Alternativa: Si No Puedes Migrar

Si estás en producción o no puedes hacer migraciones, puedes **guardar el avatar en el perfil** en lugar del usuario:

### Cambiar en `uploads.route.js`:

```javascript
// OPCIÓN 1: Guardar en User (requiere migración)
await prisma.user.update({
  where: { id: userId },
  data: { avatarUrl: uploadResponse.url },
});

// OPCIÓN 2: Guardar en MemberProfile (NO requiere migración)
await prisma.memberProfile.upsert({
  where: { userId: userId },
  create: {
    userId: userId,
    avatarUrl: uploadResponse.url,
  },
  update: {
    avatarUrl: uploadResponse.url,
  },
});
```

Pero necesitarías que `MemberProfile` tenga el campo `avatarUrl` (verifica tu schema).

---

## 🚀 Próximos Pasos

Una vez que la migración esté aplicada:

1. ✅ Restart backend
2. ✅ Probar upload desde el frontend
3. ✅ Verificar que el avatar aparece en la UI
4. ✅ Verificar que se guarda en la base de datos

---

**🎉 ¡Después de esto, el upload de avatar debería funcionar perfectamente!**
