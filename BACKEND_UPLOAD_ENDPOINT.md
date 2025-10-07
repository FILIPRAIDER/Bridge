# 🔧 Backend: Endpoint para Subir Avatar (Solución CORS)

## Problema Actual

Tu endpoint actual solo retorna credenciales:

```javascript
// ❌ ACTUAL: Solo retorna credenciales (causa CORS)
router.post("/users/:userId/avatar/url", async (req, res, next) => {
  const auth = getImageKitAuthParams();
  res.json({
    provider: "imagekit",
    ...auth,
    folder: "/avatars",
  });
});
```

El frontend intenta subir directamente a ImageKit → **Error CORS** ❌

## Solución: Backend sube el archivo

Necesitas **dos endpoints**:

1. **GET/POST `/uploads/users/:userId/avatar/url`** - Credenciales (ya existe, opcional)
2. **POST `/uploads/users/:userId/avatar`** - **NUEVO** - Recibe archivo y lo sube

---

## 📝 Código Actualizado para `routes/uploads.js`

Reemplaza tu archivo completo con esto:

```javascript
import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import ImageKit from "imagekit";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http-errors.js";
import { getImageKitAuthParams } from "../lib/imagekit.js";

export const router = Router();

// ============================================================================
// Configurar Multer (para recibir archivos en memoria)
// ============================================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (!file.mimetype.startsWith("image/")) {
      return cb(new HttpError(400, "Solo se permiten archivos de imagen"), false);
    }
    cb(null, true);
  },
});

// ============================================================================
// Configurar ImageKit
// ============================================================================
const imagekit = new ImageKit({
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
  urlEndpoint: process.env.IK_URL_ENDPOINT,
});

// ============================================================================
// POST /uploads/certifications/:certId/url
// Responde con token/expire/signature/publicKey/urlEndpoint/folder
// ============================================================================
const CertParams = z.object({ certId: z.string().min(1) });

router.post(
  "/certifications/:certId/url",
  validate(CertParams, "params"),
  async (req, res, next) => {
    try {
      const cert = await prisma.certification.findUnique({
        where: { id: req.params.certId },
        select: { id: true, userId: true },
      });
      if (!cert) throw new HttpError(404, "Certificación no encontrada");

      const auth = getImageKitAuthParams();
      res.json({
        provider: "imagekit",
        ...auth,
        folder: auth.folder || "/certifications",
      });
    } catch (e) {
      next(e);
    }
  }
);

// ============================================================================
// POST /uploads/users/:userId/avatar/url
// Retorna credenciales de ImageKit (OPCIONAL - solo si frontend lo necesita)
// ============================================================================
const UserParams = z.object({ userId: z.string().min(1) });

router.post(
  "/users/:userId/avatar/url",
  validate(UserParams, "params"),
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.userId },
        select: { id: true },
      });
      if (!user) throw new HttpError(404, "Usuario no encontrado");

      const auth = getImageKitAuthParams();
      res.json({
        provider: "imagekit",
        ...auth,
        folder: "/avatars",
      });
    } catch (e) {
      next(e);
    }
  }
);

// ============================================================================
// 🆕 POST /uploads/users/:userId/avatar
// Recibe el archivo, lo sube a ImageKit y actualiza el usuario
// Este endpoint SOLUCIONA el problema de CORS
// ============================================================================
router.post(
  "/users/:userId/avatar",
  upload.single("file"), // Multer maneja el FormData
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const file = req.file;

      console.log(`📤 Upload avatar request for user: ${userId}`);

      // Validar que se recibió el archivo
      if (!file) {
        throw new HttpError(400, "No se recibió ningún archivo");
      }

      console.log(`📁 File received: ${file.originalname}, size: ${file.size} bytes`);

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        throw new HttpError(404, "Usuario no encontrado");
      }

      // Generar nombre único para el archivo
      const fileName = req.body.fileName || `avatar_${userId}_${Date.now()}`;
      const fileExtension = file.originalname.split(".").pop();
      const fullFileName = `${fileName}.${fileExtension}`;

      console.log(`🚀 Uploading to ImageKit: ${fullFileName}`);

      // Subir a ImageKit
      const uploadResponse = await imagekit.upload({
        file: file.buffer.toString("base64"), // Convertir buffer a base64
        fileName: fullFileName,
        folder: "/avatars",
        useUniqueFileName: true, // ImageKit agrega hash único
        tags: [`user:${userId}`, "avatar"],
      });

      console.log(`✅ Upload successful: ${uploadResponse.url}`);

      // Actualizar avatarUrl en la base de datos
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: uploadResponse.url },
      });

      console.log(`💾 Database updated for user ${userId}`);

      // Responder con la URL de la imagen
      res.json({
        success: true,
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        name: uploadResponse.name,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        message: "Avatar actualizado correctamente",
      });
    } catch (error) {
      console.error("❌ Error uploading avatar:", error);
      
      // Errores específicos de ImageKit
      if (error.message?.includes("Invalid authentication")) {
        return next(
          new HttpError(500, "Credenciales de ImageKit inválidas. Verifica las variables de entorno.")
        );
      }

      next(error);
    }
  }
);

export default router;
```

---

## 📦 Instalar Dependencias

```bash
cd backend
npm install imagekit multer
```

---

## 🔧 Variables de Entorno

Asegúrate de tener estas variables en `backend/.env`:

```env
# ImageKit Configuration
IK_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxxxxxx
IK_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxxxx
IK_URL_ENDPOINT=https://ik.imagekit.io/tu_id_aqui

# Database
DATABASE_URL=postgresql://...?connection_limit=3&pool_timeout=20
```

### Cómo obtener las credenciales de ImageKit:

1. Ve a https://imagekit.io/dashboard
2. Click en "Developer Options" (menú izquierdo)
3. Click en "API Keys"
4. Copia:
   - **Public Key** → `IK_PUBLIC_KEY`
   - **Private Key** → `IK_PRIVATE_KEY`
   - **URL Endpoint** → `IK_URL_ENDPOINT`

---

## 🚀 Restart Backend

```bash
# Si usas nodemon/node
npm run dev

# Si usas pm2
pm2 restart all
```

---

## 🧪 Probar el Endpoint

### Con cURL (desde terminal):

```bash
# Reemplaza con valores reales
curl -X POST http://localhost:4001/uploads/users/cmgg5vijw0000cknsguj8gx2y/avatar \
  -F "file=@/ruta/a/tu/imagen.jpg" \
  -F "fileName=avatar_test"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "url": "https://ik.imagekit.io/xxx/avatars/avatar_xxx_xxx.jpg",
  "fileId": "xxx",
  "message": "Avatar actualizado correctamente"
}
```

### Con Postman/Insomnia:

1. **Method:** POST
2. **URL:** `http://localhost:4001/uploads/users/{userId}/avatar`
3. **Body:** Form-data
   - Key: `file` (tipo: File)
   - Value: Selecciona una imagen
   - Key: `fileName` (tipo: Text, opcional)
   - Value: `avatar_test`

---

## ✅ Checklist de Verificación

Antes de probar en el frontend, verifica:

- [ ] `npm install imagekit multer` ejecutado
- [ ] Variables `IK_PUBLIC_KEY`, `IK_PRIVATE_KEY`, `IK_URL_ENDPOINT` en `.env`
- [ ] Backend reiniciado
- [ ] Endpoint responde correctamente (test con cURL/Postman)
- [ ] No hay errores en logs del backend

---

## 🐛 Troubleshooting

### Error: "Module 'imagekit' not found"
```bash
cd backend
npm install imagekit
```

### Error: "Invalid authentication"
- Verifica que las credenciales en `.env` estén correctas
- Sin espacios extra al copiarlas
- Restart el backend después de cambiar `.env`

### Error: "No se recibió ningún archivo"
- Verifica que el frontend envíe el campo `file` en el FormData
- Verifica que el Content-Type sea `multipart/form-data`

### Error: "413 Payload Too Large"
Aumenta el límite en tu servidor Express:

```javascript
// En tu backend/src/index.js (antes de las rutas)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
```

---

## 📊 Flujo Completo

```
1. Frontend (AvatarUploader.tsx)
   ↓
   POST /uploads/users/{userId}/avatar
   Body: FormData { file: <imagen>, fileName: "avatar_xxx" }

2. Backend (routes/uploads.js)
   ↓
   Multer recibe el archivo en memoria
   ↓
   ImageKit.upload(buffer en base64)
   ↓
   Prisma actualiza user.avatarUrl
   ↓
   Responde: { url: "https://...", success: true }

3. Frontend
   ↓
   Actualiza session.user.avatarUrl
   ↓
   ✅ Avatar visible en UI
```

---

## 🎉 Resultado Final

Una vez implementado:

1. ✅ Sin errores de CORS
2. ✅ Archivo se sube correctamente a ImageKit
3. ✅ URL se guarda en la base de datos
4. ✅ Avatar visible en el perfil del usuario

---

**📝 Nota:** El frontend ya está 100% preparado. Solo falta implementar este endpoint en el backend.
