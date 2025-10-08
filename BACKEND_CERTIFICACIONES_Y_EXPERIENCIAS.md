# 🎯 Implementar Endpoints de Certificaciones y Experiencia

## 📋 Resumen

El frontend ya tiene implementado:
- ✅ Componentes para agregar/editar/eliminar certificaciones
- ✅ Componentes para agregar/editar/eliminar experiencias
- ✅ Upload de archivos con ImageKit para certificaciones
- ✅ Integración en dashboards de miembros y líderes

**Necesitamos que el backend implemente los endpoints** para que funcione end-to-end.

---

## 🔧 Endpoints Requeridos

### **1. Certificaciones**

#### **GET** `/users/:userId/certifications`
Obtener todas las certificaciones de un usuario.

**Response (200 OK):**
```json
[
  {
    "id": "clx123...",
    "userId": "clx456...",
    "name": "AWS Certified Solutions Architect",
    "issuer": "Amazon Web Services",
    "issueDate": "2024-01-15T00:00:00.000Z",
    "url": "https://aws.amazon.com/...",
    "fileUrl": "https://ik.imagekit.io/...",
    "fileProvider": "imagekit",
    "fileKey": "certifications/clx123/cert.pdf",
    "fileType": "application/pdf",
    "fileSize": 524288,
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
]
```

#### **POST** `/users/:userId/certifications`
Crear una nueva certificación.

**Request Body:**
```json
{
  "name": "AWS Certified Solutions Architect",
  "issuer": "Amazon Web Services",
  "issueDate": "2024-01-15",
  "url": "https://aws.amazon.com/..." // opcional
}
```

**Response (201 Created):**
```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "name": "AWS Certified Solutions Architect",
  "issuer": "Amazon Web Services",
  "issueDate": "2024-01-15T00:00:00.000Z",
  "url": "https://aws.amazon.com/...",
  "createdAt": "2024-01-20T10:00:00.000Z"
}
```

#### **PATCH** `/users/:userId/certifications/:certId`
Actualizar una certificación (usualmente para agregar fileUrl después del upload).

**Request Body:**
```json
{
  "fileUrl": "https://ik.imagekit.io/...",
  "fileProvider": "imagekit",
  "fileKey": "certifications/clx123/cert.pdf",
  "fileType": "application/pdf",
  "fileSize": 524288,
  "fileWidth": 1920, // opcional, solo para imágenes
  "fileHeight": 1080 // opcional, solo para imágenes
}
```

**Response (200 OK):**
```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "name": "AWS Certified Solutions Architect",
  "fileUrl": "https://ik.imagekit.io/...",
  "fileProvider": "imagekit",
  "fileKey": "certifications/clx123/cert.pdf",
  "fileType": "application/pdf",
  "fileSize": 524288
}
```

#### **DELETE** `/users/:userId/certifications/:certId`
Eliminar una certificación.

**Response (200 OK):**
```json
{
  "message": "Certification deleted successfully"
}
```

---

### **2. Experiencias**

#### **GET** `/users/:userId/experiences`
Obtener todas las experiencias laborales de un usuario.

**Response (200 OK):**
```json
[
  {
    "id": "clx789...",
    "userId": "clx456...",
    "role": "Senior Full Stack Developer",
    "company": "Tech Corp",
    "startDate": "2020-01-01T00:00:00.000Z",
    "endDate": "2023-12-31T00:00:00.000Z", // null si es trabajo actual
    "description": "Desarrollé aplicaciones web con React y Node.js...",
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
]
```

#### **POST** `/users/:userId/experiences`
Crear una nueva experiencia laboral.

**Request Body:**
```json
{
  "role": "Senior Full Stack Developer",
  "company": "Tech Corp",
  "startDate": "2020-01-01",
  "endDate": "2023-12-31", // opcional, null para trabajo actual
  "description": "Desarrollé aplicaciones web con React y Node.js..." // opcional
}
```

**Response (201 Created):**
```json
{
  "id": "clx789...",
  "userId": "clx456...",
  "role": "Senior Full Stack Developer",
  "company": "Tech Corp",
  "startDate": "2020-01-01T00:00:00.000Z",
  "endDate": "2023-12-31T00:00:00.000Z",
  "description": "Desarrollé aplicaciones web con React y Node.js...",
  "createdAt": "2024-01-20T10:00:00.000Z"
}
```

#### **PATCH** `/users/:userId/experiences/:expId`
Actualizar una experiencia laboral.

**Request Body:**
```json
{
  "role": "Lead Developer",
  "endDate": null // actualizar a trabajo actual
}
```

**Response (200 OK):**
```json
{
  "id": "clx789...",
  "role": "Lead Developer",
  "endDate": null
}
```

#### **DELETE** `/users/:userId/experiences/:expId`
Eliminar una experiencia laboral.

**Response (200 OK):**
```json
{
  "message": "Experience deleted successfully"
}
```

---

### **3. Upload de Certificaciones con ImageKit**

#### **POST** `/uploads/certifications/:certId/url`
Obtener credenciales para upload directo a ImageKit.

**Response (200 OK):**
```json
{
  "publicKey": "public_abc123...",
  "signature": "signature_xyz...",
  "expire": 1704110400,
  "token": "token_def456...",
  "folder": "/certifications/user_clx456/cert_clx123",
  "uploadApiEndpoint": "https://upload.imagekit.io/api/v1/files/upload"
}
```

---

## 💻 Código de Implementación (Express + Prisma)

### **Certificaciones - routes/certifications.ts**

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth'; // Tu middleware
import ImageKit from 'imagekit';

const router = Router();
const prisma = new PrismaClient();

// Configurar ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ""
});

// GET /users/:userId/certifications
router.get('/:userId/certifications', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const certifications = await prisma.certification.findMany({
      where: { userId },
      orderBy: { issueDate: 'desc' }
    });
    
    return res.status(200).json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return res.status(500).json({ 
      error: { message: 'Error al obtener certificaciones' } 
    });
  }
});

// POST /users/:userId/certifications
router.post('/:userId/certifications', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, issuer, issueDate, url } = req.body;
    
    // Validación
    if (!name || !issuer || !issueDate) {
      return res.status(400).json({ 
        error: { message: 'Nombre, emisor y fecha son requeridos' } 
      });
    }
    
    const certification = await prisma.certification.create({
      data: {
        userId,
        name,
        issuer,
        issueDate: new Date(issueDate),
        url: url || null
      }
    });
    
    return res.status(201).json(certification);
  } catch (error) {
    console.error('Error creating certification:', error);
    return res.status(500).json({ 
      error: { message: 'Error al crear certificación' } 
    });
  }
});

// PATCH /users/:userId/certifications/:certId
router.patch('/:userId/certifications/:certId', authenticate, async (req, res) => {
  try {
    const { userId, certId } = req.params;
    const updateData = req.body;
    
    // Verificar que la certificación pertenece al usuario
    const existing = await prisma.certification.findFirst({
      where: { id: certId, userId }
    });
    
    if (!existing) {
      return res.status(404).json({ 
        error: { message: 'Certificación no encontrada' } 
      });
    }
    
    const certification = await prisma.certification.update({
      where: { id: certId },
      data: updateData
    });
    
    return res.status(200).json(certification);
  } catch (error) {
    console.error('Error updating certification:', error);
    return res.status(500).json({ 
      error: { message: 'Error al actualizar certificación' } 
    });
  }
});

// DELETE /users/:userId/certifications/:certId
router.delete('/:userId/certifications/:certId', authenticate, async (req, res) => {
  try {
    const { userId, certId } = req.params;
    
    // Verificar que existe
    const existing = await prisma.certification.findFirst({
      where: { id: certId, userId }
    });
    
    if (!existing) {
      return res.status(404).json({ 
        error: { message: 'Certificación no encontrada' } 
      });
    }
    
    // Si tiene archivo en ImageKit, eliminarlo
    if (existing.fileKey) {
      try {
        await imagekit.deleteFile(existing.fileKey);
      } catch (err) {
        console.error('Error deleting file from ImageKit:', err);
      }
    }
    
    await prisma.certification.delete({
      where: { id: certId }
    });
    
    return res.status(200).json({ 
      message: 'Certificación eliminada' 
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return res.status(500).json({ 
      error: { message: 'Error al eliminar certificación' } 
    });
  }
});

export default router;
```

### **Experiencias - routes/experiences.ts**

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /users/:userId/experiences
router.get('/:userId/experiences', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const experiences = await prisma.experience.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    });
    
    return res.status(200).json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return res.status(500).json({ 
      error: { message: 'Error al obtener experiencias' } 
    });
  }
});

// POST /users/:userId/experiences
router.post('/:userId/experiences', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, company, startDate, endDate, description } = req.body;
    
    // Validación
    if (!role || !company || !startDate) {
      return res.status(400).json({ 
        error: { message: 'Rol, empresa y fecha de inicio son requeridos' } 
      });
    }
    
    const experience = await prisma.experience.create({
      data: {
        userId,
        role,
        company,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null
      }
    });
    
    return res.status(201).json(experience);
  } catch (error) {
    console.error('Error creating experience:', error);
    return res.status(500).json({ 
      error: { message: 'Error al crear experiencia' } 
    });
  }
});

// PATCH /users/:userId/experiences/:expId
router.patch('/:userId/experiences/:expId', authenticate, async (req, res) => {
  try {
    const { userId, expId } = req.params;
    const updateData = req.body;
    
    // Convertir fechas si existen
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate !== undefined) {
      updateData.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }
    
    // Verificar que existe
    const existing = await prisma.experience.findFirst({
      where: { id: expId, userId }
    });
    
    if (!existing) {
      return res.status(404).json({ 
        error: { message: 'Experiencia no encontrada' } 
      });
    }
    
    const experience = await prisma.experience.update({
      where: { id: expId },
      data: updateData
    });
    
    return res.status(200).json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    return res.status(500).json({ 
      error: { message: 'Error al actualizar experiencia' } 
    });
  }
});

// DELETE /users/:userId/experiences/:expId
router.delete('/:userId/experiences/:expId', authenticate, async (req, res) => {
  try {
    const { userId, expId } = req.params;
    
    const existing = await prisma.experience.findFirst({
      where: { id: expId, userId }
    });
    
    if (!existing) {
      return res.status(404).json({ 
        error: { message: 'Experiencia no encontrada' } 
      });
    }
    
    await prisma.experience.delete({
      where: { id: expId }
    });
    
    return res.status(200).json({ 
      message: 'Experiencia eliminada' 
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return res.status(500).json({ 
      error: { message: 'Error al eliminar experiencia' } 
    });
  }
});

export default router;
```

### **ImageKit Upload - routes/uploads.ts**

```typescript
import { Router } from 'express';
import ImageKit from 'imagekit';
import { authenticate } from '../middleware/auth';

const router = Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ""
});

// POST /uploads/certifications/:certId/url
router.post('/certifications/:certId/url', authenticate, async (req, res) => {
  try {
    const { certId } = req.params;
    const userId = req.user.id; // Del middleware de autenticación
    
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return res.status(200).json({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      signature: authenticationParameters.signature,
      expire: authenticationParameters.expire,
      token: authenticationParameters.token,
      folder: `/certifications/user_${userId}/cert_${certId}`,
      uploadApiEndpoint: "https://upload.imagekit.io/api/v1/files/upload"
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ 
      error: { message: 'Error al generar URL de upload' } 
    });
  }
});

export default router;
```

### **Registrar Rutas en app.ts**

```typescript
// app.ts

import express from 'express';
import certificationRoutes from './routes/certifications';
import experienceRoutes from './routes/experiences';
import uploadRoutes from './routes/uploads';

const app = express();

// Middleware
app.use(express.json());

// Rutas
app.use('/users', certificationRoutes); // /users/:userId/certifications
app.use('/users', experienceRoutes);    // /users/:userId/experiences
app.use('/uploads', uploadRoutes);      // /uploads/certifications/:certId/url

// ... resto del código
```

---

## 🔒 Variables de Entorno Necesarias

```bash
# .env (Backend)

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_abc123...
IMAGEKIT_PRIVATE_KEY=private_xyz789...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourId

# Database
DATABASE_URL=postgresql://...
```

---

## ✅ Checklist de Implementación

### Certificaciones:
- [ ] Crear `routes/certifications.ts`
- [ ] Implementar GET `/users/:userId/certifications`
- [ ] Implementar POST `/users/:userId/certifications`
- [ ] Implementar PATCH `/users/:userId/certifications/:certId`
- [ ] Implementar DELETE `/users/:userId/certifications/:certId`
- [ ] Agregar manejo de archivos con ImageKit

### Experiencias:
- [ ] Crear `routes/experiences.ts`
- [ ] Implementar GET `/users/:userId/experiences`
- [ ] Implementar POST `/users/:userId/experiences`
- [ ] Implementar PATCH `/users/:userId/experiences/:expId`
- [ ] Implementar DELETE `/users/:userId/experiences/:expId`

### Uploads:
- [ ] Crear `routes/uploads.ts`
- [ ] Implementar POST `/uploads/certifications/:certId/url`
- [ ] Configurar ImageKit

### General:
- [ ] Registrar rutas en `app.ts`
- [ ] Configurar variables de entorno
- [ ] Probar endpoints con Postman/Thunder Client
- [ ] Desplegar a producción

---

## 🧪 Testing

```bash
# Certificaciones
curl -X GET "http://localhost:4001/users/clx456/certifications" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST "http://localhost:4001/users/clx456/certifications" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AWS Certified",
    "issuer": "Amazon",
    "issueDate": "2024-01-15"
  }'

# Experiencias
curl -X GET "http://localhost:4001/users/clx456/experiences" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST "http://localhost:4001/users/clx456/experiences" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Developer",
    "company": "Tech Corp",
    "startDate": "2020-01-01",
    "description": "Trabajé con React..."
  }'
```

---

## 🎯 Resultado Final

Una vez implementado:
- ✅ Los miembros podrán agregar/editar/eliminar certificaciones
- ✅ Los miembros podrán subir archivos PDF o imágenes de certificaciones
- ✅ Los miembros podrán agregar/editar/eliminar experiencias laborales
- ✅ Los líderes tendrán las mismas funcionalidades en su dashboard
- ✅ Todo se sincroniza automáticamente con el backend
