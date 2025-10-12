# 🧪 TESTING JWT - FRONTEND

**Fecha:** 12 de octubre de 2025  
**Estado:** Listo para probar

---

## 🎯 PASOS PARA PROBAR

### 1️⃣ Limpiar Sesión Actual

**Motivo:** Tu sesión actual NO tiene el token porque se creó antes de que el backend lo implementara.

**Opciones:**

**Opción A - Limpiar desde el navegador (RECOMENDADO):**
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **Application** → **Storage**
3. Haz clic en **Clear site data**
4. Recarga la página (F5)

**Opción B - Limpiar cookies manualmente:**
1. Abre Chrome DevTools (F12)
2. Ve a **Application** → **Cookies** → `http://localhost:3000`
3. Elimina todas las cookies que empiecen con `next-auth`
4. Recarga la página (F5)

**Opción C - Ventana incógnito:**
1. Abre una ventana de incógnito en Chrome (Ctrl+Shift+N)
2. Ve a `http://localhost:3000`

---

### 2️⃣ Hacer Login Nuevamente

1. Ve a `http://localhost:3000/auth/login`
2. Ingresa tus credenciales:
   - **Email:** `felipe.berrio@campusucc.edu.co`
   - **Password:** Tu contraseña
3. Haz clic en **Iniciar Sesión**

---

### 3️⃣ Verificar que el Token se Guardó

**Abre la consola del navegador (F12)** y busca este mensaje:

```
[NextAuth] ✅ AccessToken capturado del backend
```

Si ves ⚠️ en lugar de ✅, significa que el backend aún no está devolviendo el token.

---

### 4️⃣ Verificar el Token en la Sesión

**En la consola del navegador, ejecuta:**

```javascript
// Obtener la sesión
const res = await fetch('/api/auth/session');
const session = await res.json();
console.log('Token:', session.accessToken);
console.log('Token length:', session.accessToken?.length);
```

**Resultado esperado:**
```javascript
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWdoZ...
Token length: 200+ caracteres
```

**Si el token es `null` o `undefined`:**
- El backend no está devolviendo el token en `/auth/login`
- Verifica que el backend esté actualizado

---

### 5️⃣ Probar Carga de Áreas

1. Ve al dashboard de líder: `http://localhost:3000/dashboard/lider`
2. Haz clic en la pestaña **"Gestionar Áreas"**
3. **Abre la consola del navegador (F12)** y busca:

```
[useAreas] Token info: {hasToken: true, tokenLength: 200+, tokenStart: "eyJhbGciOiJIUzI1NiIs..."}
```

4. Verifica que las áreas se carguen **sin error 401**

**Error esperado si falla:**
```
GET http://localhost:4001/teams/xxx/areas 401 (Unauthorized)
```

**Éxito esperado:**
```
GET http://localhost:4001/teams/xxx/areas 200 (OK)
```

---

### 6️⃣ Probar Crear Área

1. En **"Gestionar Áreas"**, haz clic en **"+ Nueva Área"**
2. Llena el formulario:
   - **Nombre:** Test Área JWT
   - **Descripción:** Probando autenticación JWT
3. Haz clic en **Crear**

**Abre Network en DevTools (F12 → Network):**
- Busca la petición `POST /teams/xxx/areas`
- Haz clic en ella → **Headers**
- Verifica que tenga: `Authorization: Bearer eyJhbGci...`

**Resultado esperado:**
- Status: `201 Created` o `200 OK`
- Respuesta: `{ id: "...", name: "Test Área JWT", ... }`

**Si falla con 401:**
- El endpoint `POST /teams/:teamId/areas` aún no tiene `requireAuth` en el backend
- Ver sección **"Backend Pendiente"** abajo

---

### 7️⃣ Probar Análisis IA

1. Ve a una área existente
2. Haz clic en **"Análisis IA"**
3. Verifica en DevTools → Network:
   - Peticiones a `http://localhost:4101/api/...`
   - Headers con `Authorization: Bearer ...`

---

## ✅ CHECKLIST DE PRUEBAS

| Prueba | Estado | Error Esperado |
|--------|--------|----------------|
| Login devuelve token | ⬜ | `[NextAuth] ✅ AccessToken capturado` |
| Token en sesión | ⬜ | `session.accessToken` debe existir |
| GET áreas (200 OK) | ⬜ | Sin error 401 |
| POST crear área | ⬜ | 401 si backend no tiene `requireAuth` |
| PUT actualizar área | ⬜ | 401 si backend no tiene `requireAuth` |
| DELETE eliminar área | ⬜ | 401 si backend no tiene `requireAuth` |
| Análisis IA | ⬜ | Sin error 401 |

---

## 🐛 PROBLEMAS COMUNES

### Problema 1: Token es `null` o `undefined`

**Causa:** Backend no está devolviendo el token en `/auth/login`

**Solución:**
1. Verifica que el backend esté corriendo
2. Prueba el login directamente con Thunder Client/Postman:
   ```bash
   POST http://localhost:4001/auth/login
   Content-Type: application/json

   {
     "email": "tu@email.com",
     "password": "tu-password"
   }
   ```
3. Verifica que la respuesta incluya:
   ```json
   {
     "user": { ... },
     "token": "eyJhbGci...",
     "expiresIn": "7d"
   }
   ```

---

### Problema 2: Error 401 en endpoints de áreas

**Causa:** El endpoint específico aún no tiene `requireAuth` en el backend

**Solución:** Ver `RESPUESTA_JWT_IMPLEMENTADO.md` → **"Endpoints Pendientes"**

El backend solo agregó `requireAuth` a **1 endpoint:**
- ✅ `GET /teams/:teamId/areas`

Los siguientes **AÚN NO** tienen `requireAuth`:
- ⏳ POST /teams/:teamId/areas
- ⏳ PUT /teams/:teamId/areas/:areaId
- ⏳ DELETE /teams/:teamId/areas/:areaId
- ⏳ Endpoints de members, files, messages

---

### Problema 3: Consola muestra `[NextAuth] ⚠️ Backend aún no devuelve token`

**Causa:** Backend no actualizado

**Solución:** Verificar con el backend que `/auth/login` devuelva el token

---

### Problema 4: Token aparece pero sigue dando 401

**Causa:** El token está mal formado o el backend no lo está validando

**Solución:**
1. Copia el token de la consola
2. Ve a https://jwt.io
3. Pega el token
4. Verifica que se decodifique correctamente
5. Verifica que tenga `userId` en el payload

---

## 🔄 SI TODO FUNCIONA

Si todas las pruebas pasan ✅:

1. **Actualizar documentación:**
   - Marcar `ESTADO_AUTH_INTEGRACION.md` como 100% completo
   - Crear screenshots de la consola mostrando el token
   
2. **Commit del éxito:**
   ```bash
   git add .
   git commit -m "test: Verificado JWT funcionando - Frontend integrado correctamente"
   git push
   ```

3. **Coordinar con backend:**
   - Confirmar que agreguen `requireAuth` a los endpoints pendientes
   - Documentar cuáles endpoints ya están protegidos

---

## 📊 RESULTADOS ESPERADOS

### ✅ Flujo Exitoso:

```
1. Usuario hace login
   ↓
2. Backend devuelve { user, token, expiresIn }
   ↓
3. NextAuth captura el token y lo guarda en la sesión
   ↓
4. Frontend usa el token en todas las peticiones
   ↓
5. Backend valida el token con requireAuth
   ↓
6. Petición exitosa: 200 OK
```

### ❌ Flujo con Error:

```
1. Usuario hace login
   ↓
2. Backend devuelve { user } ← ❌ NO HAY TOKEN
   ↓
3. NextAuth no puede guardar el token
   ↓
4. Frontend envía Authorization: Bearer undefined
   ↓
5. Backend rechaza: 401 Unauthorized
```

---

## 📞 CONTACTO

**Si algo falla:**
1. Copia los logs de la consola
2. Copia el error de Network → Response
3. Verifica el estado del backend
4. Revisa `RESPUESTA_JWT_IMPLEMENTADO.md`

**Documentación relacionada:**
- `RESPUESTA_BACKEND_AUTH.md` - Guía completa del backend
- `RESPUESTA_JWT_IMPLEMENTADO.md` - Estado actual de implementación
- `ESTADO_AUTH_INTEGRACION.md` - Checklist de integración

---

**Estado:** ✅ FRONTEND LISTO  
**Próximo paso:** Probar que el token se captura correctamente al hacer login

