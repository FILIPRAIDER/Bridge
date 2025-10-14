# 👥 Flujos de Usuario - Bridge

## Información General

Este documento describe todos los flujos de usuario principales en la plataforma Bridge, incluyendo diagramas, casos de uso y escenarios de error.

---

## 📋 Índice de Flujos

1. [Registro e Inicio de Sesión](#1-registro-e-inicio-de-sesión)
2. [Creación de Equipo](#2-creación-de-equipo)
3. [Invitación de Miembros](#3-invitación-de-miembros)
4. [Gestión de Áreas](#4-gestión-de-áreas)
5. [Chat y Mensajería](#5-chat-y-mensajería)
6. [Integración con Telegram](#6-integración-con-telegram)
7. [Funciones de IA](#7-funciones-de-ia)
8. [Gestión de Archivos](#8-gestión-de-archivos)

---

## 1. Registro e Inicio de Sesión

### 1.1 Registro de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE REGISTRO                         │
└─────────────────────────────────────────────────────────────┘

Página Inicial (/auth/register/select)
    │
    ├─── Seleccionar Rol
    │    ├─> Líder
    │    ├─> Estudiante
    │    └─> Empresario
    │
    ↓
Formulario de Registro (/auth/register/{rol})
    │
    ├─── Ingresar Datos
    │    ├─> Nombre completo
    │    ├─> Email
    │    ├─> Contraseña
    │    └─> Teléfono (opcional)
    │
    ↓
Validación
    │
    ├─── ✅ Datos válidos
    │    └─> Crear cuenta
    │         └─> Redirigir a Dashboard
    │
    └─── ❌ Datos inválidos
         └─> Mostrar errores
              └─> Regresar al formulario
```

### 1.2 Inicio de Sesión

```
Login Page (/auth/login)
    │
    ├─── Ingresar Credenciales
    │    ├─> Email
    │    └─> Contraseña
    │
    ↓
Autenticación
    │
    ├─── ✅ Credenciales válidas
    │    └─> Generar JWT
    │         └─> Redirigir según rol
    │              ├─> LIDER → /dashboard/lider
    │              ├─> ESTUDIANTE → /dashboard/miembro
    │              └─> EMPRESARIO → /dashboard/empresario
    │
    └─── ❌ Credenciales inválidas
         └─> Mostrar error
              └─> Regresar a login
```

### 1.3 Casos de Uso

#### UC-001: Usuario se registra como Líder
**Actor:** Usuario nuevo  
**Precondición:** Ninguna  
**Flujo principal:**
1. Usuario accede a `/auth/register/select`
2. Selecciona rol "Líder"
3. Completa formulario con datos personales
4. Sistema valida información
5. Sistema crea cuenta y equipo automáticamente
6. Usuario es redirigido a dashboard de líder

**Postcondición:** Usuario tiene cuenta activa y equipo creado

#### UC-002: Usuario inicia sesión
**Actor:** Usuario registrado  
**Precondición:** Usuario tiene cuenta activa  
**Flujo principal:**
1. Usuario accede a `/auth/login`
2. Ingresa email y contraseña
3. Sistema valida credenciales
4. Sistema genera JWT token
5. Usuario es redirigido a su dashboard según rol

**Postcondición:** Usuario está autenticado en la plataforma

---

## 2. Creación de Equipo

### 2.1 Flujo de Creación

```
Dashboard Líder
    │
    ├─── Click "Crear Equipo" / "Configurar Equipo"
    │
    ↓
Formulario de Equipo
    │
    ├─── Ingresar Información
    │    ├─> Nombre del equipo
    │    ├─> Descripción
    │    ├─> Logo (opcional)
    │    └─> Configuración inicial
    │
    ↓
Guardar Equipo
    │
    ├─── ✅ Guardado exitoso
    │    └─> Crear áreas por defecto
    │         ├─> "General"
    │         ├─> "Desarrollo"
    │         └─> "Recursos"
    │         └─> Redirigir a vista de equipo
    │
    └─── ❌ Error al guardar
         └─> Mostrar mensaje de error
              └─> Reintentar
```

### 2.2 Casos de Uso

#### UC-003: Líder crea equipo
**Actor:** Líder  
**Precondición:** Usuario tiene rol LIDER  
**Flujo principal:**
1. Líder accede a dashboard
2. Click en "Crear Equipo"
3. Completa información del equipo
4. Sistema crea equipo con áreas por defecto
5. Líder puede comenzar a invitar miembros

**Postcondición:** Equipo creado con áreas base

---

## 3. Invitación de Miembros

### 3.1 Flujo de Invitación

```
Dashboard Líder
    │
    ├─── Sección "Invitar Miembros"
    │
    ↓
Formulario de Invitación
    │
    ├─── Ingresar Emails
    │    ├─> Email 1
    │    ├─> Email 2
    │    └─> Email N
    │
    ↓
Enviar Invitaciones
    │
    ├─── ✅ Emails válidos
    │    └─> Crear enlaces de invitación
    │         └─> Enviar emails
    │              └─> Mostrar confirmación
    │
    └─── ❌ Emails inválidos
         └─> Mostrar errores
              └─> Corregir y reintentar
```

### 3.2 Flujo de Aceptación

```
Invitado recibe email
    │
    ├─── Click en enlace de invitación
    │
    ↓
Página de Unión (/join?token=...)
    │
    ├─── ¿Usuario tiene cuenta?
    │    │
    │    ├─── ✅ Sí
    │    │    └─> Login
    │    │         └─> Unirse al equipo
    │    │              └─> Redirigir a dashboard
    │    │
    │    └─── ❌ No
    │         └─> Registro rápido
    │              └─> Unirse al equipo
    │                   └─> Redirigir a dashboard
    │
    └─── Token inválido/expirado
         └─> Mostrar error
              └─> Contactar al líder
```

### 3.3 Casos de Uso

#### UC-004: Líder invita miembros
**Actor:** Líder  
**Precondición:** Equipo creado  
**Flujo principal:**
1. Líder accede a "Invitar Miembros"
2. Ingresa emails de personas a invitar
3. Sistema genera links únicos
4. Sistema envía emails con invitaciones
5. Miembros reciben emails con instrucciones

**Postcondición:** Invitaciones enviadas

#### UC-005: Usuario acepta invitación
**Actor:** Usuario invitado  
**Precondición:** Usuario recibió email de invitación  
**Flujo principal:**
1. Usuario click en link del email
2. Sistema valida token de invitación
3. Usuario se registra o inicia sesión
4. Sistema agrega usuario al equipo
5. Usuario accede a dashboard de miembro

**Postcondición:** Usuario es miembro del equipo

---

## 4. Gestión de Áreas

### 4.1 Creación de Área

```
Vista de Equipo
    │
    ├─── Click "Nueva Área"
    │
    ↓
Modal de Creación
    │
    ├─── Ingresar Información
    │    ├─> Nombre del área
    │    ├─> Descripción
    │    ├─> Color/Icono
    │    └─> Miembros iniciales
    │
    ↓
Crear Área
    │
    ├─── ✅ Creada exitosamente
    │    └─> Agregar a lista de áreas
    │         └─> Notificar a miembros
    │
    └─── ❌ Error
         └─> Mostrar mensaje
              └─> Reintentar
```

### 4.2 Acceso a Área

```
Dashboard
    │
    ├─── Seleccionar Área
    │
    ↓
Vista de Chat del Área
    │
    ├─── Cargar componentes
    │    ├─> Lista de mensajes
    │    ├─> Panel de archivos
    │    ├─> Información del área
    │    └─> Miembros online
    │
    ├─── Conectar WebSocket
    │    └─> Unirse a sala del área
    │
    └─── Cargar datos iniciales
         ├─> Últimos 50 mensajes
         ├─> Archivos compartidos
         └─> Estado de Telegram
```

### 4.3 Casos de Uso

#### UC-006: Líder crea área nueva
**Actor:** Líder  
**Precondición:** Equipo existe  
**Flujo principal:**
1. Líder click en "Nueva Área"
2. Completa información del área
3. Selecciona miembros iniciales
4. Sistema crea área
5. Miembros reciben notificación

**Postcondición:** Área creada y accesible

#### UC-007: Usuario accede a área
**Actor:** Miembro del equipo  
**Precondición:** Usuario pertenece al área  
**Flujo principal:**
1. Usuario selecciona área del menú
2. Sistema carga vista de chat
3. Sistema conecta WebSocket
4. Usuario puede ver mensajes y participar

**Postcondición:** Usuario en área activa

---

## 5. Chat y Mensajería

### 5.1 Envío de Mensaje

```
Vista de Chat
    │
    ├─── Usuario escribe mensaje
    │    └─> Emit "typing_start"
    │
    ↓
Usuario envía mensaje
    │
    ├─── Validar contenido
    │    ├─> No vacío
    │    └─> Longitud válida
    │
    ↓
WebSocket emit "send_message"
    │
    ├─── ✅ Enviado exitosamente
    │    ├─> Agregar a lista local
    │    ├─> Broadcast a otros usuarios
    │    └─> Sincronizar con Telegram (si vinculado)
    │
    └─── ❌ Error al enviar
         └─> Mostrar error
              └─> Marcar como fallido
                   └─> Opción de reenviar
```

### 5.2 Recepción de Mensaje

```
WebSocket event "new_message"
    │
    ├─── ¿Mensaje del área actual?
    │    │
    │    ├─── ✅ Sí
    │    │    └─> Agregar a lista
    │    │         └─> Scroll al final
    │    │              └─> Reproducir sonido (opcional)
    │    │
    │    └─── ❌ No
    │         └─> Incrementar contador no leídos
    │              └─> Mostrar badge en menú
```

### 5.3 Indicador de Escritura

```
Usuario escribe
    │
    ├─── Emit "typing_start" (throttled)
    │    └─> Broadcast a otros usuarios
    │         └─> Mostrar "Usuario escribiendo..."
    │
Usuario para de escribir
    │
    └─── Emit "typing_stop" (debounced 2s)
         └─> Ocultar indicador
```

### 5.4 Casos de Uso

#### UC-008: Usuario envía mensaje de texto
**Actor:** Miembro del área  
**Precondición:** Usuario en vista de chat  
**Flujo principal:**
1. Usuario escribe mensaje
2. Sistema muestra indicador "escribiendo" a otros
3. Usuario presiona Enter o click en enviar
4. Sistema valida y envía mensaje
5. Mensaje aparece en chat de todos los miembros

**Postcondición:** Mensaje enviado y visible

#### UC-009: Usuario recibe mensaje
**Actor:** Miembro del área  
**Precondición:** Usuario en vista de chat  
**Flujo principal:**
1. Otro usuario envía mensaje
2. WebSocket notifica al usuario
3. Sistema agrega mensaje al chat
4. Sistema hace scroll automático
5. Usuario ve el nuevo mensaje

**Postcondición:** Mensaje recibido y visible

---

## 6. Integración con Telegram

### 6.1 Vinculación de Grupo (Flujo Completo)

```
┌─────────────────────────────────────────────────────────────┐
│            FLUJO DE VINCULACIÓN CON TELEGRAM                 │
└─────────────────────────────────────────────────────────────┘

Dashboard → Área sin Telegram
    │
    ├─── Líder click "Conectar Telegram"
    │
    ↓
Wizard de Configuración (Paso 1/6)
    │
    ├─── Introducción
    │    └─> Explicación del proceso
    │         └─> Click "Comenzar"
    │
    ↓
Paso 2: Crear Grupo en Telegram
    │
    ├─── Instrucciones
    │    ├─> Abrir Telegram
    │    ├─> Crear nuevo grupo
    │    ├─> Darle nombre
    │    └─> Click "Siguiente"
    │
    ↓
Paso 3: Agregar Bot
    │
    ├─── Instrucciones
    │    ├─> Buscar @BridgeBot
    │    ├─> Agregarlo al grupo
    │    ├─> Darle permisos de admin
    │    └─> Click "Siguiente"
    │
    ↓
Paso 4: Vincular Grupo
    │
    ├─── Instrucciones
    │    ├─> En grupo: escribir /vincular
    │    ├─> Bot responde con código
    │    │    └─> Formato: TG-XXX-XXXXXXX
    │    ├─> Copiar código
    │    └─> Click "Ingresar Código"
    │
    ↓
Modal de Código
    │
    ├─── Ingresar código
    │    ├─> Auto-formateo
    │    ├─> Validación en tiempo real
    │    └─> Click "Vincular"
    │
    ↓
Validación Backend
    │
    ├─── ¿Código válido?
    │    │
    │    ├─── ✅ Sí
    │    │    ├─> Obtener info del grupo
    │    │    ├─> Crear registro en DB
    │    │    ├─> Generar inviteLink
    │    │    └─> Ir a Paso 5
    │    │
    │    └─── ❌ No
    │         ├─> ¿Error 409? (Ya vinculado)
    │         │    │
    │         │    ├─── ✅ Sí
    │         │    │    ├─> Obtener grupo existente
    │         │    │    └─> Saltar a Paso 5 (Invitación)
    │         │    │
    │         │    └─── ❌ Otro error
    │         │         └─> Mostrar error
    │         │              └─> Reintentar
    │
    ↓
Paso 5: Invitar Miembros
    │
    ├─── Modal de Invitación
    │    ├─> Tab: Código QR (activo por defecto)
    │    │    ├─> Mostrar QR
    │    │    ├─> Botón Descargar
    │    │    └─> Botón Compartir
    │    │
    │    └─> Tab: Link Directo
    │         ├─> Mostrar link
    │         └─> Botón Copiar
    │
    ↓
Paso 6: Éxito
    │
    └─── Confirmación
         ├─> Resumen de configuración
         ├─> Instrucciones finales
         └─> Click "Finalizar"
              └─> Regresar al chat
                   └─> Ver badge "Telegram conectado"
```

### 6.2 Flujo con Grupo Ya Vinculado

```
Dashboard → Área con Telegram
    │
    ├─── Líder click "Telegram"
    │
    ↓
Modal de Invitación (directo)
    │
    ├─── Tab: Código QR (activo por defecto)
    │    ├─> Mostrar QR del grupo
    │    ├─> Botón Descargar
    │    └─> Botón Compartir
    │
    └─── Tab: Link Directo
         ├─> Mostrar inviteLink
         └─> Botón Copiar
```

### 6.3 Sincronización de Mensajes

```
┌────────────────────────────────────────────────────────────┐
│              SINCRONIZACIÓN BIDIRECCIONAL                   │
└────────────────────────────────────────────────────────────┘

Mensaje desde Web App:
    │
    Usuario envía mensaje en Bridge
        ↓
    Backend recibe mensaje
        ├─> Guardar en DB
        ├─> Broadcast WebSocket
        └─> Enviar a Telegram Bot
             └─> Bot publica en grupo
                  └─> Usuarios en Telegram lo ven

Mensaje desde Telegram:
    │
    Usuario envía mensaje en Telegram
        ↓
    Bot recibe webhook
        ├─> Backend procesa mensaje
        ├─> Guardar en DB
        └─> Broadcast WebSocket
             └─> Usuarios en Bridge lo ven
```

### 6.4 Casos de Uso

#### UC-010: Líder vincula grupo de Telegram
**Actor:** Líder  
**Precondición:** Área creada, bot de Telegram activo  
**Flujo principal:**
1. Líder click en "Conectar Telegram"
2. Wizard muestra instrucciones paso a paso
3. Líder crea grupo en Telegram
4. Líder agrega bot al grupo
5. Líder ejecuta /vincular en grupo
6. Bot genera código de vinculación
7. Líder ingresa código en Bridge
8. Sistema valida y vincula grupo
9. Líder ve modal con QR para invitar miembros

**Postcondición:** Grupo vinculado, sincronización activa

#### UC-011: Líder invita miembros vía QR
**Actor:** Líder  
**Precondición:** Grupo de Telegram vinculado  
**Flujo principal:**
1. Líder click en botón "Telegram"
2. Modal se abre en tab "Código QR"
3. Líder descarga QR o comparte pantalla
4. Miembros escanean QR con cámara/Telegram
5. Miembros se unen al grupo automáticamente

**Postcondición:** Miembros en grupo de Telegram

#### UC-012: Usuario se une vía QR
**Actor:** Miembro del equipo  
**Precondición:** Líder compartió QR  
**Flujo principal:**
1. Usuario recibe imagen de QR (WhatsApp, email, etc.)
2. Usuario abre cámara de móvil
3. Usuario escanea QR
4. Notificación muestra link de Telegram
5. Usuario click en notificación
6. Telegram abre grupo
7. Usuario click en "Unirse"

**Postcondición:** Usuario es miembro del grupo

---

## 7. Funciones de IA

### 7.1 Asistente IA (@IA)

```
Usuario en Chat
    │
    ├─── Escribe mensaje con @IA
    │    Ejemplo: "@IA ¿Cuál es el estado del proyecto?"
    │
    ↓
Sistema detecta comando @IA
    │
    ├─── Extraer pregunta
    │    └─> "¿Cuál es el estado del proyecto?"
    │
    ↓
Enviar a Backend IA
    │
    ├─── Contexto incluido
    │    ├─> Mensajes recientes del área
    │    ├─> Archivos compartidos
    │    └─> Información del equipo
    │
    ↓
OpenAI GPT procesa
    │
    ├─── Genera respuesta
    │    └─> Basada en contexto
    │
    ↓
Mostrar Respuesta
    │
    └─── Componente AIAssistantMessage
         ├─> Icono de IA
         ├─> Respuesta formateada
         └─> Timestamp
```

### 7.2 Resumen de Conversación

```
Usuario click "Resumir"
    │
    ↓
Modal de Configuración
    │
    ├─── Seleccionar opciones
    │    ├─> Período (última hora, día, semana)
    │    ├─> Nivel de detalle
    │    └─> Idioma
    │
    ↓
Generar Resumen
    │
    ├─── Recopilar mensajes
    │    └─> Filtrar por período
    │
    ├─── Enviar a IA
    │    └─> Procesar con GPT
    │
    ↓
Mostrar Resumen
    │
    └─── Modal con resultado
         ├─> Puntos clave
         ├─> Tareas mencionadas
         ├─> Decisiones tomadas
         └─> Botón descargar PDF
```

### 7.3 Grabación de Minutas

```
Usuario click "Minuta"
    │
    ↓
Iniciar Grabación
    │
    ├─── Solicitar permisos de micrófono
    │
    ├─── ✅ Permisos concedidos
    │    └─> Comenzar grabación
    │         ├─> Mostrar indicador visual
    │         ├─> Timer activo
    │         └─> Botón "Detener"
    │
    └─── ❌ Permisos denegados
         └─> Mostrar mensaje de error
              └─> Instrucciones para habilitar
```

### 7.4 Casos de Uso

#### UC-013: Usuario consulta al asistente IA
**Actor:** Miembro del área  
**Precondición:** Usuario en chat del área  
**Flujo principal:**
1. Usuario escribe mensaje comenzando con @IA
2. Sistema detecta comando de IA
3. Sistema envía pregunta con contexto a backend
4. IA procesa y genera respuesta
5. Sistema muestra respuesta en chat
6. Usuario puede hacer seguimiento con más preguntas

**Postcondición:** Usuario recibe respuesta de IA

#### UC-014: Líder genera resumen de conversación
**Actor:** Líder  
**Precondición:** Área con historial de mensajes  
**Flujo principal:**
1. Líder click en botón "Resumir"
2. Modal muestra opciones de configuración
3. Líder selecciona período y opciones
4. Sistema recopila mensajes relevantes
5. IA genera resumen estructurado
6. Líder ve resumen en modal
7. Líder puede descargar como PDF

**Postcondición:** Resumen generado y disponible

---

## 8. Gestión de Archivos

### 8.1 Subida de Archivos

```
Usuario en Chat
    │
    ├─── Click icono de adjunto 📎
    │
    ↓
Selector de Archivos
    │
    ├─── Seleccionar archivo(s)
    │    ├─> Imágenes (jpg, png, gif)
    │    ├─> Documentos (pdf, docx, xlsx)
    │    └─> Otros
    │
    ↓
Validación
    │
    ├─── ¿Archivo válido?
    │    │
    │    ├─── ✅ Sí
    │    │    ├─> Tamaño < 10MB
    │    │    └─> Tipo permitido
    │    │
    │    └─── ❌ No
    │         └─> Mostrar error
    │              ├─> Tamaño excedido
    │              └─> Tipo no permitido
    │
    ↓
Subir a ImageKit/Storage
    │
    ├─── Mostrar progress bar
    │
    ├─── ✅ Subida exitosa
    │    ├─> Obtener URL
    │    ├─> Crear mensaje tipo FILE
    │    └─> Mostrar en chat
    │         └─> Agregar a panel de archivos
    │
    └─── ❌ Error al subir
         └─> Mostrar error
              └─> Opción de reintentar
```

### 8.2 Panel de Archivos

```
Chat View
    │
    └─── Sidebar: Panel de Archivos
         │
         ├─── Archivos Compartidos
         │    ├─> Lista de archivos
         │    │    ├─> Thumbnail
         │    │    ├─> Nombre
         │    │    ├─> Tamaño
         │    │    └─> Fecha
         │    │
         │    └─> Acciones
         │         ├─> Ver
         │         ├─> Descargar
         │         └─> Eliminar (solo autor/líder)
         │
         └─── Drag & Drop Zone
              └─> Arrastrar archivos para subir
```

### 8.3 Casos de Uso

#### UC-015: Usuario sube archivo
**Actor:** Miembro del área  
**Precondición:** Usuario en chat del área  
**Flujo principal:**
1. Usuario click en icono de adjunto
2. Selector de archivos se abre
3. Usuario selecciona archivo
4. Sistema valida archivo
5. Sistema sube archivo a storage
6. Sistema crea mensaje con archivo
7. Archivo aparece en chat y panel lateral

**Postcondición:** Archivo subido y accesible

#### UC-016: Usuario descarga archivo
**Actor:** Miembro del área  
**Precondición:** Archivo disponible en área  
**Flujo principal:**
1. Usuario ve archivo en chat o panel
2. Usuario click en botón descargar
3. Sistema genera URL de descarga
4. Navegador inicia descarga
5. Archivo se guarda en dispositivo del usuario

**Postcondición:** Archivo descargado

---

## 9. Gestión de Errores

### 9.1 Errores Comunes y Manejo

```
┌─────────────────────────────────────────────────────────────┐
│                  ESTRATEGIA DE MANEJO DE ERRORES             │
└─────────────────────────────────────────────────────────────┘

Error de Red
    ├─> Mostrar toast: "Error de conexión"
    ├─> Mostrar estado offline
    ├─> Reintentar automáticamente (3 intentos)
    └─> Permitir retry manual

Error 401 (No Autorizado)
    ├─> Limpiar sesión
    ├─> Redirigir a login
    └─> Mostrar: "Sesión expirada"

Error 403 (Prohibido)
    ├─> Mostrar: "No tienes permisos"
    └─> Sugerir contactar al líder

Error 404 (No Encontrado)
    ├─> Mostrar: "Recurso no encontrado"
    └─> Redirigir a página anterior

Error 409 (Conflicto) - Telegram ya vinculado
    ├─> Obtener grupo existente
    ├─> Mostrar modal de invitación
    └─> Toast: "Grupo ya vinculado"

Error 500 (Servidor)
    ├─> Mostrar: "Error del servidor"
    ├─> Log del error
    └─> Sugerir reintentar más tarde

WebSocket Desconectado
    ├─> Mostrar badge: "Desconectado"
    ├─> Intentar reconexión automática
    ├─> Backoff exponencial
    └─> Notificar cuando reconecte
```

### 9.2 Validaciones del Cliente

```
Validación de Formularios
    ├─> Email: formato válido
    ├─> Contraseña: mínimo 8 caracteres
    ├─> Teléfono: formato internacional
    ├─> Nombres: no vacíos, min 2 caracteres
    └─> URLs: formato válido

Validación de Archivos
    ├─> Tamaño máximo: 10MB
    ├─> Tipos permitidos: lista blanca
    └─> Nombre: caracteres válidos

Validación de Mensajes
    ├─> No vacío (después de trim)
    ├─> Longitud máxima: 5000 caracteres
    └─> No solo espacios en blanco
```

---

## 10. Casos de Borde y Escenarios Especiales

### 10.1 Usuario Pierde Conexión

```
Durante Chat Activo
    │
    WebSocket se desconecta
        ↓
    Sistema detecta desconexión
        ├─> Mostrar badge "Desconectado"
        ├─> Deshabilitar envío de mensajes
        └─> Intentar reconexión automática
             │
             ├─── ✅ Reconexión exitosa
             │    ├─> Ocultar badge
             │    ├─> Sincronizar mensajes perdidos
             │    └─> Habilitar funcionalidad
             │
             └─── ❌ No se puede reconectar
                  ├─> Mensaje: "Sin conexión"
                  └─> Botón "Reintentar"
```

### 10.2 Múltiples Ventanas Abiertas

```
Usuario abre misma área en 2 tabs
    │
    ├─── Ambos tabs conectados vía WebSocket
    │
    ├─── Usuario envía mensaje en Tab 1
    │    └─> Mensaje aparece en ambos tabs
    │
    └─── Sincronización automática
         └─> Estado consistente en ambos tabs
```

### 10.3 Usuario Cambia de Rol

```
Usuario promovido a Líder
    │
    ├─── Backend actualiza rol en DB
    │
    ├─── ¿Usuario online?
    │    │
    │    ├─── ✅ Sí
    │    │    └─> WebSocket notifica cambio
    │    │         └─> UI se actualiza inmediatamente
    │    │              ├─> Nuevos permisos visibles
    │    │              └─> Nuevas acciones disponibles
    │    │
    │    └─── ❌ No
    │         └─> Cambios visibles en próximo login
```

---

## 11. Métricas y Analytics

### 11.1 Eventos Trackeados

```
Registro de Usuario
    ├─> Rol seleccionado
    ├─> Método de registro
    └─> Tiempo hasta completar

Actividad en Áreas
    ├─> Tiempo de sesión
    ├─> Mensajes enviados
    ├─> Archivos compartidos
    └─> Consultas a IA

Integración Telegram
    ├─> Tiempo hasta vincular
    ├─> Método de invitación usado
    └─> Tasa de éxito en vinculación

Engagement
    ├─> Áreas más activas
    ├─> Usuarios más activos
    ├─> Horas pico de actividad
    └─> Retención de usuarios
```

---

## 12. Accesibilidad

### 12.1 Características de Accesibilidad

```
Teclado
    ├─> Navegación completa por teclado
    ├─> Atajos de teclado documentados
    └─> Focus visible en todos los elementos

Lectores de Pantalla
    ├─> ARIA labels en botones
    ├─> Roles semánticos
    └─> Anuncios de mensajes nuevos

Visual
    ├─> Contraste suficiente (WCAG AA)
    ├─> Textos redimensionables
    └─> Modo oscuro disponible

Móvil
    ├─> Touch targets > 44px
    ├─> Gestos intuitivos
    └─> Responsive design
```

---

**Documento generado:** Octubre 14, 2025  
**Versión:** 1.0.0  
**Próxima revisión:** Según cambios en funcionalidad
