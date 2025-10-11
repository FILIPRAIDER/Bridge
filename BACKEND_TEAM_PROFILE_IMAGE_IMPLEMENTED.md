# ✅ IMPLEMENTADO: Endpoint para Foto de Perfil del Equipo

**Fecha:** 11 de Octubre, 2025  
**Status:** ✅ LISTO PARA USO  
**Endpoint:** `POST /uploads/teams/:teamId/profile-image`

---

## 🎯 Endpoint Implementado

### URL
```
POST /uploads/teams/:teamId/profile-image
```

### Ejemplo Real
```
POST https://proyectoia.onrender.com/uploads/teams/cm2abc123/profile-image
```

---

## 📤 Cómo Usar desde Frontend

### Método 1: FormData + Fetch (Recomendado)

```typescript
async function uploadTeamProfileImage(teamId: string, imageFile: File) {
  const formData = new FormData();
  formData.append('image', imageFile); // ⚠️ IMPORTANTE: campo 'image'
  
  const response = await fetch(
    `${BACKEND_URL}/uploads/teams/${teamId}/profile-image`,
    {
      method: 'POST',
      // ⚠️ NO incluir Content-Type - el browser lo maneja automáticamente
      // headers: {
      //   'Authorization': `Bearer ${token}` // Descomentar cuando tengas auth
      // },
      body: formData
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al subir imagen');
  }
  
  return await response.json();
}

// Uso en componente React
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  try {
    setLoading(true);
    const result = await uploadTeamProfileImage(teamId, file);
    
    console.log('✅ Upload exitoso:', result);
    // result.profileImage contiene la URL de la imagen
    
    setTeamImage(result.profileImage);
    toast.success(result.message);
  } catch (error) {
    console.error('❌ Error:', error);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Método 2: Axios

```typescript
import axios from 'axios';

async function uploadTeamProfileImage(teamId: string, imageFile: File) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await axios.post(
    `${BACKEND_URL}/uploads/teams/${teamId}/profile-image`,
    formData,
    {
      // headers: {
      //   'Authorization': `Bearer ${token}` // Descomentar cuando tengas auth
      // }
    }
  );
  
  return response.data;
}
```

### Método 3: React Query

```typescript
import { useMutation } from '@tanstack/react-query';

const useUploadTeamImage = () => {
  return useMutation({
    mutationFn: async ({ teamId, file }: { teamId: string; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(
        `${BACKEND_URL}/uploads/teams/${teamId}/profile-image`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Upload successful:', data.profileImage);
    },
    onError: (error) => {
      console.error('❌ Upload failed:', error);
    }
  });
};

// En tu componente
const { mutate: uploadImage, isLoading } = useUploadTeamImage();

const handleUpload = (file: File) => {
  uploadImage({ teamId: 'cm2abc123', file });
};
```

---

## 📋 Validaciones del Backend

### 1. Archivo Requerido ✅
```json
// Si no envías archivo
{
  "error": {
    "message": "No se ha proporcionado ninguna imagen"
  }
}
```

### 2. Tipo de Archivo ✅
**Permitidos:** JPG, JPEG, PNG, WebP  
**Rechazados:** GIF, SVG, BMP, TIFF, etc.

```json
// Si envías tipo no permitido
{
  "error": {
    "message": "Solo se permiten imágenes JPG, PNG o WebP"
  }
}
```

### 3. Tamaño Máximo: 5MB ✅
```json
// Si el archivo supera 5MB
{
  "error": {
    "message": "La imagen no debe superar 5MB"
  }
}
```

### 4. Equipo Existe ✅
```json
// Si el teamId no existe
{
  "error": {
    "message": "Equipo no encontrado"
  }
}
```

### 5. Permisos (Comentado por ahora) ⏳
```javascript
// TODO: Descomentar cuando tengas autenticación
// Solo usuarios con rol LIDER pueden subir foto
```

---

## ✅ Respuesta Exitosa

### Status Code: `200 OK`

```json
{
  "success": true,
  "message": "Foto de perfil actualizada correctamente",
  "profileImage": "https://ik.imagekit.io/cresia/teams/profile-images/team_cm2abc123_1697040000000.jpg",
  "team": {
    "id": "cm2abc123",
    "name": "DevTeam Pro",
    "profileImage": "https://ik.imagekit.io/cresia/teams/profile-images/team_cm2abc123_1697040000000.jpg"
  }
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Siempre `true` en éxito |
| `message` | string | Mensaje descriptivo |
| `profileImage` | string | **URL de la imagen subida** (usar esto en el `<img>`) |
| `team.id` | string | ID del equipo |
| `team.name` | string | Nombre del equipo |
| `team.profileImage` | string | URL de la imagen (mismo que `profileImage`) |

---

## 🎨 Ejemplo de Componente React

```tsx
import { useState } from 'react';
import { Upload, Camera } from 'lucide-react';

interface TeamProfileImageUploaderProps {
  teamId: string;
  currentImage?: string;
  onImageUpdate: (newImageUrl: string) => void;
}

export function TeamProfileImageUploader({
  teamId,
  currentImage,
  onImageUpdate
}: TeamProfileImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones del lado del cliente
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG o WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    // Preview local inmediato
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      setLoading(true);

      // Subir a backend
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/uploads/teams/${teamId}/profile-image`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al subir imagen');
      }

      const data = await response.json();
      
      // Actualizar con la URL real de ImageKit
      setPreviewUrl(data.profileImage);
      onImageUpdate(data.profileImage);
      
      // Mostrar mensaje de éxito
      console.log('✅', data.message);

    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert(error.message);
      
      // Revertir preview en caso de error
      setPreviewUrl(currentImage || null);
    } finally {
      setLoading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  return (
    <div className="relative w-32 h-32">
      {/* Preview de la imagen */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Team profile"
          className="w-full h-full object-cover rounded-full border-4 border-gray-200"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
          <Camera className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Botón de upload */}
      <label
        htmlFor="team-image-upload"
        className={`
          absolute bottom-0 right-0 
          bg-blue-600 hover:bg-blue-700 
          text-white rounded-full p-2 
          cursor-pointer shadow-lg
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </label>

      <input
        id="team-image-upload"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={loading}
        className="hidden"
      />
    </div>
  );
}
```

---

## 🔧 Lo que Hace el Backend (Internamente)

1. **Recibe el archivo** del campo `'image'` en FormData
2. **Valida:**
   - Que el archivo exista
   - Tipo de archivo (JPG/PNG/WebP)
   - Tamaño (≤ 5MB)
   - Equipo existe en BD
3. **Elimina imagen anterior** de ImageKit (si existe)
4. **Sube a ImageKit:**
   - Folder: `/teams/profile-images`
   - Filename: `team_{teamId}_{timestamp}.{ext}`
   - Tags: `['team:{teamId}', 'profile-image']`
5. **Actualiza BD:**
   - `Team.profileImage` = URL de ImageKit
   - `Team.avatarProvider` = "imagekit"
   - `Team.avatarKey` = fileId (para eliminación futura)
   - `Team.avatarType`, `avatarSize`, `avatarWidth`, `avatarHeight`
6. **Retorna URL** de la imagen subida

---

## 🗄️ Campos Actualizados en la BD

Cuando subes una imagen, se actualizan estos campos en la tabla `Team`:

```prisma
model Team {
  // ...otros campos
  
  profileImage   String?  // ← URL principal de la imagen
  avatarProvider String?  // "imagekit"
  avatarKey      String?  // fileId de ImageKit (para eliminar)
  avatarType     String?  // "image/jpeg", "image/png", etc.
  avatarSize     Int?     // Tamaño en bytes
  avatarWidth    Int?     // Ancho de la imagen
  avatarHeight   Int?     // Alto de la imagen
}
```

---

## 🧪 Testing con cURL

```bash
# Subir imagen de prueba
curl -X POST \
  http://localhost:4000/uploads/teams/cm2abc123/profile-image \
  -F "image=@/path/to/your/image.jpg"

# Respuesta esperada:
# {
#   "success": true,
#   "message": "Foto de perfil actualizada correctamente",
#   "profileImage": "https://ik.imagekit.io/...",
#   "team": { ... }
# }
```

---

## 📊 Logs del Backend

Cuando subes una imagen, verás estos logs en el servidor:

```
📸 [Team Profile Image] Received upload request for team: cm2abc123
📦 File info: team-photo.jpg, image/jpeg, 245678 bytes
✅ Team found: DevTeam Pro
✅ Previous team image deleted from ImageKit: ik_abc123xyz
📤 Uploading to ImageKit...
✅ Upload successful - URL: https://ik.imagekit.io/cresia/teams/profile-images/team_cm2abc123_1697040000000.jpg
✅ Team profile image updated in database for team: DevTeam Pro
```

---

## ⚠️ Importante: Autenticación

**Estado actual:** El endpoint funciona **SIN autenticación** por ahora.

**Para habilitar autenticación:**

1. Descomentar las líneas en `uploads.route.js`:
```javascript
// DESCOMENTAR ESTO:
if (!req.user) {
  throw new HttpError(401, "No autenticado");
}

const member = team.members.find(
  (m) => m.userId === req.user.id && m.role === "LIDER"
);

if (!member) {
  throw new HttpError(403, "Solo los líderes pueden cambiar la foto del equipo");
}
```

2. Agregar middleware de autenticación en la ruta:
```javascript
router.post(
  "/teams/:teamId/profile-image",
  authenticate, // ← Agregar este middleware
  upload.single("image"),
  async (req, res, next) => {
    // ...
  }
);
```

3. Frontend debe enviar token:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## ✅ Checklist Frontend

- [ ] Usar `FormData` para enviar archivo
- [ ] Campo debe llamarse `'image'` (no `'file'`)
- [ ] NO incluir `Content-Type` en headers (el browser lo maneja)
- [ ] Validar tipo de archivo: JPG, PNG, WebP
- [ ] Validar tamaño máximo: 5MB
- [ ] Mostrar loading state durante upload
- [ ] Manejar errores con mensajes claros
- [ ] Actualizar UI con `data.profileImage` después del upload
- [ ] Preview local antes de subir (opcional pero recomendado)

---

## 🚀 Deploy

El endpoint ya está implementado en:

```javascript
// Archivo: src/routes/uploads.route.js
// Líneas: ~230-350
router.post("/teams/:teamId/profile-image", ...)
```

**Para desplegar:**

1. Commit y push:
```bash
git add src/routes/uploads.route.js
git commit -m "feat: add team profile image upload endpoint"
git push origin main
```

2. Render desplegará automáticamente

3. Endpoint estará disponible en:
```
https://proyectoia.onrender.com/uploads/teams/:teamId/profile-image
```

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs del backend** - hay logs detallados de cada paso
2. **Verifica el campo FormData** - debe ser `'image'`, no `'file'`
3. **No incluyas Content-Type** - déjalo que el browser lo maneje
4. **Revisa el tamaño del archivo** - máximo 5MB
5. **Verifica el tipo de archivo** - solo JPG, PNG, WebP

---

**Status:** ✅ LISTO PARA USO  
**Próximo paso:** Commit + Push → Deploy automático  
**Testing:** Puedes probar con Postman o desde tu frontend
