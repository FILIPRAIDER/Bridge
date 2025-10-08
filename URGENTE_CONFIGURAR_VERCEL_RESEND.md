# ⚠️ CONFIGURACIÓN URGENTE: Variables de Entorno en Vercel

## 🚨 ACCIÓN REQUERIDA

Necesitas agregar/verificar estas variables en **Vercel Dashboard** para que los emails funcionen en producción.

---

## 📋 Variables a Configurar

### **1. Ve a Vercel Dashboard**
```
https://vercel.com/dashboard
→ Selecciona tu proyecto (cresia-app o bridge)
→ Settings
→ Environment Variables
```

### **2. Agrega/Verifica estas variables:**

| Variable | Valor | Environment |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_436Tv277_AftgvvLLPEcHDDYfUXBQPN8s` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_BASE_URL` | `https://cresia-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_BASE_URL` | `https://preview-url.vercel.app` | Preview (usa Vercel URL automática) |
| `NEXT_PUBLIC_API_BASE_URL` | `https://proyectoia-backend.onrender.com` | Production, Preview, Development |

---

## ✅ Cómo Agregar Variables

1. **Ir a Settings → Environment Variables**
2. **Agregar cada variable:**
   - Name: `RESEND_API_KEY`
   - Value: `re_436Tv277_AftgvvLLPEcHDDYfUXBQPN8s`
   - Environment: Seleccionar **Production**, **Preview**, **Development**
   - Click "Save"

3. **Repetir para cada variable**

4. **Redesplegar la aplicación:**
   - Ve a "Deployments"
   - Click en el deployment más reciente
   - Click "Redeploy"
   - **O simplemente haz un nuevo push** (ya se hizo con el commit anterior)

---

## 🧪 Testing en Producción

### **1. Esperar a que termine el deployment** (~2 minutos)

```
Vercel Dashboard → Deployments → Ver que esté "Ready"
```

### **2. Probar enviar una invitación:**

1. Ir a `https://cresia-app.vercel.app/dashboard` (como LIDER)
2. Ir a "Miembros del Equipo"
3. Invitar a un usuario con email real
4. Verificar:
   - ✅ Se crea la invitación en el dashboard
   - ✅ Llega el email (revisar inbox y spam)
   - ✅ El email tiene el nombre correcto (no "undefined")
   - ✅ El botón apunta a `https://cresia-app.vercel.app/join?token=...`

### **3. Revisar logs en Vercel:**

```
Vercel Dashboard → Deployments → [Latest] → Functions → View Logs
```

Buscar:
```
📧 [sendInvitationEmail] Iniciando envío de email
   - Email destino: xxx@xxx.com
   - Equipo: TransDigitalCoop
   - Invitador: Juan Pérez
✅ [sendInvitationEmail] Email enviado exitosamente
```

---

## 🔍 Troubleshooting

### **Error: "RESEND_API_KEY is not defined"**
- **Solución**: Agregar la variable en Vercel y redesplegar

### **Error: "Failed to send email"**
- **Solución**: Verificar que la API key sea válida en Resend dashboard
- **Solución 2**: Revisar logs de Vercel para más detalles

### **El email llega pero con "undefined"**
- **Solución**: Verificar que el backend tenga los endpoints:
  - `GET /teams/:teamId`
  - `GET /users/:userId`
  - Revisar documentación en `NUEVO_FLUJO_EMAILS_FRONTEND.md`

### **El botón apunta al backend en lugar del frontend**
- ✅ **Ya está solucionado** con este nuevo flujo
- El frontend controla la URL del botón directamente

---

## 📞 Siguiente Paso

1. ✅ Variables agregadas en Vercel
2. ✅ Deployment terminado
3. ⏳ **Ahora**: Notificar al backend para que implemente los cambios en `NUEVO_FLUJO_EMAILS_FRONTEND.md`

---

## 🎯 Resumen

| Componente | Estado | Responsable |
|------------|--------|-------------|
| Frontend (emails) | ✅ Implementado | Tu (Frontend) |
| Variables Vercel | ⏳ Pendiente | Tu (Configurar ahora) |
| Backend (endpoints) | ⏳ Pendiente | Backend team |

---

**IMPORTANTE**: Una vez configuradas las variables y desplegado, el frontend ya puede enviar emails. Solo falta que el backend implemente los cambios mencionados en `NUEVO_FLUJO_EMAILS_FRONTEND.md`.
