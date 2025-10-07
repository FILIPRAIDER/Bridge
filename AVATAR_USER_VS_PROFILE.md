# 🔄 OPCIÓN: Guardar Avatar en MemberProfile (Ya Existe el Campo)

Ya tienes `avatarUrl` en `MemberProfile`, así que puedes usar ese campo **SIN necesidad de migración**.

---

## ✅ Solución Rápida: Usar MemberProfile

### Opción 1: Solo Actualizar el Backend (Sin Migración)

Cambia el código en **backend** `uploads.route.js`:

```javascript
// ❌ ANTES (requiere migración):
await prisma.user.update({
  where: { id: userId },
  data: { avatarUrl: uploadResponse.url },
});

// ✅ DESPUÉS (usa campo existente):
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

**Ventaja:** No requiere migración, funciona inmediatamente.

**Desventaja:** Requiere hacer JOIN para obtener el avatar del usuario.

---

## 🚀 Solución Completa: Agregar `avatarUrl` a User

### ¿Por qué agregarlo a User si ya está en MemberProfile?

1. **Performance:** Acceso directo sin JOIN
2. **Simplicidad:** `user.avatarUrl` en lugar de `user.profile?.avatarUrl`
3. **Consistencia:** NextAuth trabaja con el User directamente

### Cómo Aplicar la Migración Manual

#### Paso 1: Conectarte a la Base de Datos

**Clever Cloud:**
1. Ve a https://console.clever-cloud.com
2. Click en tu addon PostgreSQL
3. Click en "Connection information"
4. Copia el connection string

**O desde tu backend:**
```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
notepad .env
```

Copia el valor de `DATABASE_URL`.

---

#### Paso 2: Ejecutar el SQL

**Opción A: Con `psql` (si lo tienes instalado)**

```powershell
# Conectar a la DB
psql "postgresql://usuario:password@host:port/database"

# Copiar y pegar el SQL de ADD_AVATAR_TO_USER_MIGRATION.sql
```

**Opción B: Con Prisma Studio (más fácil)**

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
npx prisma studio
```

1. Se abre en el navegador
2. Click en "Query" (arriba a la derecha)
3. Pegar el SQL de `ADD_AVATAR_TO_USER_MIGRATION.sql`
4. Click "Run"

**Opción C: Desde Clever Cloud Console**

1. Ve a tu addon PostgreSQL en Clever Cloud
2. Click en "Console" o "CLI Access"
3. Pegar el SQL

---

#### Paso 3: Actualizar schema.prisma

Abre `C:\Users\filip\OneDrive\Desktop\ProyectoIA\prisma\schema.prisma`:

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

  @@index([avatarUrl])            // 👈 OPCIONAL: índice para búsquedas
}
```

---

#### Paso 4: Regenerar Prisma Client

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
npx prisma generate
```

---

#### Paso 5: Crear el Archivo de Migración (Para Historial)

Esto es **opcional** pero buena práctica para tener registro:

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA

# Crear carpeta de migración
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationFolder = "prisma\migrations\${timestamp}_add_avatar_url_to_user"
New-Item -ItemType Directory -Path $migrationFolder

# Copiar el SQL
Copy-Item "C:\Users\filip\OneDrive\Desktop\ia-app\ADD_AVATAR_TO_USER_MIGRATION.sql" "$migrationFolder\migration.sql"
```

---

#### Paso 6: Marcar Migración como Aplicada

```powershell
cd C:\Users\filip\OneDrive\Desktop\ProyectoIA
npx prisma migrate resolve --applied ${timestamp}_add_avatar_url_to_user
```

Reemplaza `${timestamp}` con el valor real (ej: `20251007140530`).

---

## 📊 Comparación: User vs MemberProfile

| Aspecto | avatarUrl en User | avatarUrl en MemberProfile |
|---------|-------------------|---------------------------|
| **Migración** | ⚠️ Requiere SQL manual | ✅ Ya existe |
| **Performance** | ✅ Directo (sin JOIN) | ⚠️ Requiere JOIN |
| **Código** | `user.avatarUrl` | `user.profile?.avatarUrl` |
| **NextAuth** | ✅ Integración simple | ⚠️ Requiere query extra |
| **Duplicación** | ⚠️ Duplica dato | ✅ Dato único |

---

## 🎯 Mi Recomendación

### Para Desarrollo Rápido (Ahora Mismo):
**Usar MemberProfile** - Sin migración, funciona inmediatamente.

### Para Producción (Mejor Performance):
**Agregar a User también** - Ejecutar el SQL manual una sola vez.

---

## 🔧 Código Final para Ambas Opciones

### Backend: uploads.route.js

```javascript
router.post("/users/:userId/avatar", upload.single("file"), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    console.log(`📤 Upload avatar request for user: ${userId}`);
    console.log(`📁 File received: ${file.originalname}, ${file.size} bytes`);

    const imagekit = getImageKit();
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`;

    console.log(`🚀 Uploading to ImageKit: ${fileName}`);

    const uploadResponse = await imagekit.upload({
      file: file.buffer.toString("base64"),
      fileName: fileName,
      folder: "/avatars",
      useUniqueFileName: false,
    });

    console.log(`✅ Upload successful: ${uploadResponse.url}`);

    // OPCIÓN 1: Guardar solo en MemberProfile (sin migración)
    await prisma.memberProfile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        avatarUrl: uploadResponse.url,
        avatarProvider: "imagekit",
        avatarKey: uploadResponse.fileId,
        avatarType: uploadResponse.fileType,
        avatarSize: uploadResponse.size,
        avatarWidth: uploadResponse.width,
        avatarHeight: uploadResponse.height,
      },
      update: {
        avatarUrl: uploadResponse.url,
        avatarProvider: "imagekit",
        avatarKey: uploadResponse.fileId,
        avatarType: uploadResponse.fileType,
        avatarSize: uploadResponse.size,
        avatarWidth: uploadResponse.width,
        avatarHeight: uploadResponse.height,
      },
    });

    // OPCIÓN 2: Si agregaste el campo a User (después de migración)
    // Descomentar estas líneas:
    /*
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: uploadResponse.url },
    });
    */

    console.log(`💾 Database updated for user ${userId}`);

    res.json({
      message: "Avatar uploaded successfully",
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    next(error);
  }
});
```

---

### Frontend: Cargar Avatar (Si Usas MemberProfile)

```typescript
// auth.config.ts - Callback para incluir avatar del profile
export default {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Cargar profile para obtener avatar
        const profile = await prisma.memberProfile.findUnique({
          where: { userId: user.id },
          select: { avatarUrl: true },
        });
        token.avatarUrl = profile?.avatarUrl || null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.avatarUrl = token.avatarUrl;
      return session;
    },
  },
};
```

---

## ✅ Checklist

### Opción 1: Solo MemberProfile (Sin Migración)
- [ ] Actualizar `uploads.route.js` para usar `memberProfile.upsert()`
- [ ] Actualizar callbacks de NextAuth para cargar `profile.avatarUrl`
- [ ] Restart backend y frontend
- [ ] Probar upload

### Opción 2: Agregar a User (Con Migración)
- [ ] Ejecutar SQL de `ADD_AVATAR_TO_USER_MIGRATION.sql` en la DB
- [ ] Agregar `avatarUrl String?` a `schema.prisma`
- [ ] Correr `npx prisma generate`
- [ ] Descomentar `prisma.user.update()` en `uploads.route.js`
- [ ] Restart backend
- [ ] Probar upload

---

## 🎉 Resultado Esperado

### Opción 1 (MemberProfile):
```
💾 MemberProfile updated for user cmgg5vijw0000cknsguj8gx2y
```

### Opción 2 (User + MemberProfile):
```
💾 Database updated for user cmgg5vijw0000cknsguj8gx2y
```

---

**¿Cuál prefieres? Te recomiendo empezar con MemberProfile (sin migración) para probarlo rápido, y luego agregar a User si necesitas mejor performance.**
