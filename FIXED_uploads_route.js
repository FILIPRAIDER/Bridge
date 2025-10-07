import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http-errors.js";

import multer from "multer";
import ImageKit from "imagekit";
import { getImageKitAuthParams } from "../lib/imagekit.js";

export const router = Router();

// Configurar multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ============================================================================
// Configurar ImageKit CON VALIDACIÓN
// ============================================================================
let imagekit = null;

function getImageKit() {
  if (!imagekit) {
    const { IK_PUBLIC_KEY, IK_PRIVATE_KEY, IK_URL_ENDPOINT } = process.env;

    // Validar que todas las variables existan
    if (!IK_PUBLIC_KEY || !IK_PRIVATE_KEY || !IK_URL_ENDPOINT) {
      console.error("❌ ERROR: Faltan variables de entorno de ImageKit:");
      console.error("   IK_PUBLIC_KEY:", IK_PUBLIC_KEY ? "✅" : "❌ FALTA");
      console.error("   IK_PRIVATE_KEY:", IK_PRIVATE_KEY ? "✅" : "❌ FALTA");
      console.error("   IK_URL_ENDPOINT:", IK_URL_ENDPOINT ? "✅" : "❌ FALTA");
      throw new Error(
        "Faltan credenciales de ImageKit. Verifica tu archivo .env"
      );
    }

    console.log("✅ Inicializando ImageKit...");
    console.log("   Public Key:", IK_PUBLIC_KEY.substring(0, 20) + "...");
    console.log("   URL Endpoint:", IK_URL_ENDPOINT);

    imagekit = new ImageKit({
      publicKey: IK_PUBLIC_KEY,
      privateKey: IK_PRIVATE_KEY,
      urlEndpoint: IK_URL_ENDPOINT,
    });

    console.log("✅ ImageKit inicializado correctamente");
  }

  return imagekit;
}

// ============================================================================
// POST /users/:userId/avatar
// Sube avatar directamente a ImageKit
// ============================================================================
const UserParams = z.object({ userId: z.string().min(1) });

router.post(
  "/users/:userId/avatar",
  validate(UserParams, "params"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const file = req.file;

      console.log(`📤 Upload avatar request for user: ${userId}`);

      if (!file) {
        throw new HttpError(400, "No se recibió ningún archivo");
      }

      console.log(`📁 File received: ${file.originalname}, ${file.size} bytes`);

      // Verificar usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) {
        throw new HttpError(404, "Usuario no encontrado");
      }

      // Obtener instancia de ImageKit (se inicializa solo si hay credenciales)
      const ik = getImageKit();

      // Generar nombre de archivo
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`;

      console.log(`🚀 Uploading to ImageKit: ${fileName}`);

      // Subir a ImageKit
      const uploadResponse = await ik.upload({
        file: file.buffer.toString("base64"),
        fileName: fileName,
        folder: "/avatars",
        useUniqueFileName: true,
        tags: [`user:${userId}`, "avatar"],
      });

      console.log(`✅ Upload successful: ${uploadResponse.url}`);

      // Actualizar en DB
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: uploadResponse.url },
      });

      console.log(`💾 Database updated for user ${userId}`);

      res.json({
        success: true,
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        message: "Avatar actualizado correctamente",
      });
    } catch (error) {
      console.error("❌ Error uploading avatar:", error);

      // Error específico de credenciales
      if (error.message?.includes("ImageKit")) {
        return next(
          new HttpError(
            500,
            "Error de configuración de ImageKit. Contacta al administrador."
          )
        );
      }

      next(error);
    }
  }
);

// ============================================================================
// POST /certifications/:certId/url
// Retorna credenciales para subir certificaciones
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

export default router;
