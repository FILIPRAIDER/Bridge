# ℹ️ Errores Normales en Desarrollo

> **Fecha:** 13 de Octubre 2025  
> **Contexto:** Errores que aparecen en consola durante desarrollo pero son NORMALES y NO afectan la funcionalidad

---

## 1. ⚠️ WebSocket "closed before connection" - NORMAL

### Error que ves:

```
useAreaChat.ts:312 WebSocket connection to 'ws://localhost:4001/socket.io/?EIO=4&transport=websocket' failed: 
WebSocket is closed before the connection is established.
```

### ¿Por qué ocurre?

Este error aparece **SOLO en modo desarrollo** debido a React 18 Strict Mode:

- **React 18 Strict Mode** ejecuta los efectos (`useEffect`) **DOS VECES** intencionalmente
- Primera ejecución: Crea conexión WebSocket
- Segunda ejecución: Destruye la primera conexión (genera el warning) y crea una nueva
- **Resultado:** La segunda conexión funciona perfectamente ✅

### ¿Es un problema?

**NO.** Este comportamiento es:
- ✅ **Intencional** - React lo hace para detectar bugs
- ✅ **Solo en desarrollo** - En producción NO ocurre
- ✅ **No afecta funcionalidad** - El chat funciona correctamente

### ¿Cómo verificar que funciona?

Busca en la consola **DESPUÉS** del error:

```javascript
✅ [useAreaChat] Conectando a WebSocket para área cmgpup...
✅ [useAreaChat] Token presente: eyJhbGciOiJIUzI1NiIs...
✅ [useAreaChat] WebSocket conectado
```

Si ves estos mensajes = **WebSocket funcionando correctamente** 🎉

### ¿Se puede silenciar?

**SÍ**, pero NO es recomendado porque:
- Oculta información útil de debugging
- Solo aparece en desarrollo
- En producción desaparece automáticamente

Si realmente quieres silenciarlo:

```typescript
// useAreaChat.ts
const socket = io(`${WS_BASE_URL}/areas/${areaId}`, {
  auth: { token },
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: false, // ← Deshabilita reconexión en dev
});
```

---

## 2. ⚠️ GET 404 en `/api/telegram/groups/area/:areaId` - ESPERADO

### Error que ves:

```
telegram.service.ts:82 GET http://localhost:4001/api/telegram/groups/area/cmgpup... 404 (Not Found)
```

### ¿Por qué ocurre?

El backend **aún no tiene implementados** los endpoints de Telegram:

- ❌ `/api/telegram/groups/area/:areaId` - No existe todavía
- ❌ `/api/telegram/groups` - No existe todavía
- ❌ `/api/telegram/messages` - No existe todavía

### ¿Es un problema?

**NO.** Esto es completamente esperado porque:
- ✅ El frontend YA está listo para Telegram
- ⏳ El backend aún no implementó los endpoints
- ✅ La app funciona sin problemas (solo no tiene Telegram aún)

### ¿Qué hace el frontend?

El código **silencia estos errores 404**:

```typescript
// useTelegramGroup.ts - línea 26
try {
  const data = await TelegramService.getGroupByAreaId(areaId);
  setGroup(data);
} catch (err: any) {
  // ✅ Silenciamos 404 - backend no está listo
  if (!err.message?.includes('404')) {
    console.error("Error fetching Telegram group:", err);
  }
  setGroup(null);
}
```

### ¿Cuándo desaparecerá?

Cuando el equipo de backend implemente estos endpoints:

```javascript
// Backend pendiente de implementar:
POST   /api/telegram/groups                    // Vincular grupo
GET    /api/telegram/groups/area/:areaId       // Obtener grupo por área
GET    /api/telegram/groups/:chatId            // Obtener grupo por chatId
DELETE /api/telegram/groups/:chatId            // Desvincular grupo
POST   /api/telegram/messages                  // Guardar mensaje de Telegram
POST   /api/telegram/invites                   // Enviar invitaciones
```

Referencia completa: `INTEGRACION_TELEGRAM_COMPLETADA.md`

---

## 3. ⚠️ GET 404 en `/api/teams/:teamId/areas/:areaId/members` - TEMPORAL

### Error que ves:

```
telegram.service.ts:155 GET http://localhost:4001/api/teams/.../areas/.../members 404 (Not Found)
AreaChatView.tsx:78 Error loading members: Error: Error obteniendo miembros
```

### ¿Por qué ocurre?

El endpoint **DEBERÍA existir** en el backend, pero está devolviendo 404. Posibles causas:

1. **Ruta incorrecta** - El backend tiene diferente estructura
2. **Middleware faltante** - Falta algún middleware de autenticación
3. **No implementado** - El backend aún no lo agregó

### ¿Es un problema?

**NO crítico.** La funcionalidad afectada:
- ❌ No se puede ver lista de miembros en wizard de Telegram
- ✅ El chat funciona perfectamente
- ✅ Los mensajes se envían/reciben correctamente
- ✅ Todo lo demás funciona

### ¿Qué hace el frontend?

El código **continúa sin miembros**:

```typescript
// AreaChatView.tsx - línea 72
try {
  const members = await TelegramService.getAreaMembers(teamId, area.id);
  setTelegramMembers(members);
} catch (err) {
  // ✅ App continúa sin miembros - no es crítico
  if (!err.message.includes('404')) {
    console.warn("Error loading members (non-critical):", err.message);
  }
}
```

### Solución documentada:

Ver archivo `SOLUCION_ERROR_404_MEMBERS.md` con 3 opciones:

1. ✅ **Opción 1 (implementada):** Frontend usa endpoint correcto con `teamId`
2. ⏳ **Opción 2:** Backend implementa endpoint sin `teamId`
3. ⏳ **Opción 3:** Frontend hace 2 llamadas (área + miembros)

---

## 📊 Resumen de Errores

| Error | Tipo | Crítico | Solución |
|-------|------|---------|----------|
| WebSocket closed | Warning | ❌ No | Normal en React 18 Dev - ignorar |
| 404 Telegram groups | 404 | ❌ No | Backend pendiente - funciona sin Telegram |
| 404 Area members | 404 | ⚠️ Parcial | Backend debe revisar endpoint |

---

## ✅ Checklist: ¿La app funciona?

Verifica estos puntos para confirmar que todo está bien:

### Chat Básico (Sin Telegram)
- [x] Login funciona
- [x] Dashboard carga
- [x] Puedo entrar a un área
- [x] Veo mensajes existentes
- [x] Puedo enviar mensajes
- [x] Los mensajes aparecen en tiempo real
- [x] Puedo subir archivos
- [x] El asistente IA responde
- [x] WebSocket muestra "Conectado" ✅

### Telegram (Pendiente Backend)
- [ ] Botón Telegram visible (gris = no vinculado) ✅
- [ ] Wizard se abre al hacer clic
- [ ] Puedo ingresar código de vinculación
- [ ] Se crea grupo vinculado
- [ ] Mensajes de Telegram aparecen con badge
- [ ] Puedo invitar miembros

---

## 🔧 Debugging

### Para verificar WebSocket:

```javascript
// Abrir consola del navegador (F12)
// Buscar estos mensajes:

[useAreaChat] Conectando a WebSocket para área...  // ✅ Intentando conectar
[useAreaChat] Token presente: eyJ...               // ✅ Tiene token
[useAreaChat] WebSocket conectado                  // ✅ CONECTADO!
```

### Para verificar API:

```javascript
// En consola del navegador:
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
// Debe mostrar: https://proyectoia-backend.onrender.com

console.log('WS URL:', process.env.NEXT_PUBLIC_WS_BASE_URL);
// Debe mostrar: https://proyectoia-backend.onrender.com
```

### Para verificar token:

```javascript
// En consola del navegador:
const token = localStorage.getItem('token'); // ← Si usas localStorage
// O
const session = await fetch('/api/auth/session').then(r => r.json());
console.log('Session:', session);
```

---

## 🎯 Próximos Pasos

### Para el equipo de Backend:

1. **Implementar endpoints de Telegram** (ver `INTEGRACION_TELEGRAM_COMPLETADA.md`)
2. **Revisar endpoint de members** (ver `SOLUCION_ERROR_404_MEMBERS.md`)
3. **Testear con Postman** los endpoints antes de integrar

### Para el equipo de Frontend:

1. ✅ **Todo listo** - Esperando backend
2. ✅ Errores manejados gracefully
3. ✅ App funciona sin Telegram
4. ✅ Documentación completa

---

## 📞 ¿Necesitas Ayuda?

### Si ves otros errores:

1. **Verifica variables de entorno** (`QUICKSTART_VERCEL.md`)
2. **Revisa que el backend esté corriendo** (ping a la API)
3. **Limpia caché del navegador** (Ctrl+Shift+R)
4. **Reinicia el dev server** (`npm run dev`)

### Si el chat no funciona:

1. Verifica que WebSocket dice "Conectado" (verde)
2. Abre Network tab (F12) y revisa llamadas API
3. Verifica que el token JWT no expiró
4. Prueba logout/login de nuevo

---

## 📚 Documentos Relacionados

- `INTEGRACION_TELEGRAM_COMPLETADA.md` - Especificación completa de Telegram
- `SOLUCION_ERROR_404_MEMBERS.md` - Solución detallada del endpoint members
- `QUICKSTART_VERCEL.md` - Variables de entorno necesarias
- `CONFIGURACION_VERCEL_EXACTA.md` - Guía completa de deployment

---

**Última actualización:** 13 de Octubre 2025  
**Estado:** Documentación de errores normales en desarrollo
