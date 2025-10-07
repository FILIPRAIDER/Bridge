# 🔧 Fix: Prisma Client No Reconoce avatarUrl

## ❌ El Problema

Ejecutaste la migración SQL correctamente, pero **Prisma Client no se regeneró**. El cliente de Prisma es código generado que necesita actualizarse cuando cambia el schema.

---

## ✅ Solución: Regenerar Prisma Client

### Paso 1: Actualizar schema.prisma

Abre `C:\Users\filip\OneDrive\Desktop\ProyectoIA\prisma\schema.prisma` y agrega el campo:

```prisma
model User {
  id              String          @id @default(cuid())
  name            String
  email           String          @unique
  role            Role            @default(ESTUDIANTE)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  skills          UserSkill[]
  teamMemberships TeamMember[]
  profile         MemberProfile?
  certifications  Certification[]
  experiences     Experience[]
  invitesSent     TeamInvite[]    @relation("InvitesByUser")
  passwordHash    String?         @map("password_hash")
  onboardingStep  OnboardingStep  @default(ACCOUNT)
  avatarUrl       String?         // 👈 AGREGAR ESTA LÍNEA
}
```

---

### Paso 2: Regenerar Prisma Client

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
npx prisma generate
```

**Output esperado:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (5.22.0) to .\node_modules\@prisma\client in 156ms

Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
```

---

### Paso 3: Restart el Backend

**Si usas Bun:**
```powershell
# Ctrl+C para detener
bun run dev
```

**Si usas Node:**
```powershell
# Ctrl+C para detener
npm run dev
```

---

### Paso 4: Verificar que Funciona

1. Ve al frontend: http://localhost:3000
2. Login
3. Ve a "Mi Perfil"
4. Sube un avatar

**Backend logs esperados:**
```
📤 Upload avatar request for user: cmgg5vijw0000cknsguj8gx2y
📁 File received: image.png, 45231 bytes
🚀 Uploading to ImageKit: avatar_cmgg5vijw0000cknsguj8gx2y_xxx.png
✅ Upload successful: https://ik.imagekit.io/...
💾 Database updated for user cmgg5vijw0000cknsguj8gx2y
POST /uploads/users/cmgg5vijw0000cknsguj8gx2y/avatar 200 1526.558 ms - 200
```

---

## 🐛 Si Aún No Funciona

### Verificar que el Schema Está Correcto

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
npx prisma validate
```

Debería decir: `✔ The schema is valid`

### Verificar que la Columna Existe en la DB

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
npx prisma studio
```

1. Se abre en el navegador
2. Click en "User"
3. Deberías ver la columna `avatarUrl`

### Regenerar Todo desde Cero

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA

# Limpiar node_modules de Prisma
Remove-Item -Recurse -Force node_modules\.prisma
Remove-Item -Recurse -Force node_modules\@prisma

# Reinstalar Prisma
npm install @prisma/client

# Regenerar
npx prisma generate
```

---

## ✅ Checklist

- [ ] Campo `avatarUrl String?` agregado a `schema.prisma`
- [ ] Ejecutado `npx prisma generate`
- [ ] Backend reiniciado
- [ ] No hay errores en la consola del backend al iniciar
- [ ] Upload de avatar funciona sin errores

---

**🎉 Después de `npx prisma generate` y restart del backend, debería funcionar!**
