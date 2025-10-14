# 🤖 Funcionalidades de Inteligencia Artificial - Bridge

## Información General

**Plataforma:** Bridge  
**Motor IA:** OpenAI GPT-4  
**Última actualización:** Octubre 14, 2025

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Asistente IA (@IA)](#2-asistente-ia-ia)
3. [Resúmenes de Conversaciones](#3-resúmenes-de-conversaciones)
4. [Grabación y Transcripción](#4-grabación-y-transcripción)
5. [Generación de Minutas](#5-generación-de-minutas)
6. [Arquitectura Técnica](#6-arquitectura-técnica)
7. [API y Endpoints](#7-api-y-endpoints)
8. [Gestión de Contexto](#8-gestión-de-contexto)
9. [Optimización de Costos](#9-optimización-de-costos)
10. [Permisos y Seguridad](#10-permisos-y-seguridad)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Visión General

### 1.1 ¿Qué es Bridge AI?

Bridge integra inteligencia artificial en múltiples niveles:

- 🤖 **Asistente Virtual** - Responde preguntas sobre el proyecto
- 📝 **Resúmenes Automáticos** - Sintetiza conversaciones largas
- 🎤 **Transcripción de Voz** - Convierte audio a texto
- 📋 **Generación de Minutas** - Crea documentos estructurados
- 💡 **Análisis de Contexto** - Entiende el contexto del proyecto

### 1.2 Beneficios

**Para Equipos:**
- ⏰ Ahorro de tiempo en documentación
- 📊 Mejor seguimiento de decisiones
- 🔍 Búsqueda inteligente de información
- 🚀 Productividad aumentada

**Para Líderes:**
- 📈 Visibilidad de progreso
- 📝 Documentación automática
- 🎯 Seguimiento de acuerdos
- 💼 Reportes profesionales

---

## 2. Asistente IA (@IA)

### 2.1 Características

El asistente IA de Bridge puede:

✅ **Responder Preguntas:**
- Sobre el proyecto actual
- Sobre conversaciones pasadas
- Sobre tareas y asignaciones
- Sobre miembros del equipo

✅ **Proveer Información:**
- Estado de áreas de trabajo
- Resumen de actividad reciente
- Tareas pendientes
- Decisiones importantes

✅ **Asistir con Tareas:**
- Generar resúmenes
- Crear minutas de reuniones
- Sugerir próximos pasos
- Formatear información

### 2.2 Cómo Invocar al Asistente

#### Opción 1: Mencionar @IA

En cualquier chat de área:

```
@IA ¿Cuál es el estado del proyecto?
```

```
@IA Resume las últimas 50 conversaciones
```

```
@IA ¿Qué tareas están pendientes?
```

#### Opción 2: Botón "Consultar IA"

1. Abrir chat de área
2. Click en botón "Consultar IA"
3. Escribir pregunta
4. Recibir respuesta

### 2.3 Tipos de Consultas

**Consulta de Estado:**
```
Usuario: "@IA ¿Qué hemos discutido hoy?"
IA: "Hoy se han discutido 3 temas principales:
     1. Integración con Telegram (5 mensajes)
     2. Diseño de UI/UX (12 mensajes)
     3. Bug fixes pendientes (8 mensajes)"
```

**Consulta de Información:**
```
Usuario: "@IA ¿Quién es el responsable del módulo de autenticación?"
IA: "El responsable del módulo de autenticación es Juan Pérez (@jperez),
     asignado el 10 de octubre de 2025."
```

**Generación de Resumen:**
```
Usuario: "@IA Resume esta conversación"
IA: "📝 Resumen de conversación:
     
     Participantes: 4 miembros
     Duración: 45 minutos
     
     Temas principales:
     1. Se acordó usar Tailwind CSS v4
     2. Deadline establecido: 20 de octubre
     3. María liderará el equipo de frontend
     
     Próximos pasos:
     - Setup de proyecto (Juan)
     - Diseño de mockups (María)
     - Revisión de código (Carlos)"
```

---

## 3. Resúmenes de Conversaciones

### 3.1 Resumen Automático

**Trigger:** Conversaciones con más de 50 mensajes

**Proceso:**
1. Sistema detecta umbral alcanzado
2. Muestra notificación: "¿Generar resumen?"
3. Usuario acepta
4. IA procesa mensajes
5. Genera resumen estructurado
6. Guarda en historial del área

### 3.2 Resumen Manual

**Ubicación:** Menú de área → "Generar Resumen"

**Opciones:**
- Últimos N mensajes (10, 25, 50, 100)
- Rango de fechas personalizado
- Desde último resumen

### 3.3 Estructura del Resumen

```markdown
# 📝 Resumen de Conversación
**Área:** Desarrollo Frontend
**Fecha:** 14 de Octubre, 2025
**Período:** 10:00 AM - 2:30 PM
**Participantes:** 5 miembros

## 🎯 Temas Principales
1. **Integración con Telegram**
   - Se completó la vinculación
   - QR codes funcionando correctamente
   - Pendiente: invitación por email

2. **UI/UX Improvements**
   - Nuevo diseño de modal
   - Botón X ahora visible
   - Modo oscuro mejorado

## ✅ Acuerdos y Decisiones
- Usar Socket.IO para WebSockets
- Deploy en Vercel
- Revisión de código los viernes

## 📋 Tareas Asignadas
- [ ] Juan: Fix del bug #123
- [ ] María: Diseño de dashboard
- [ ] Carlos: Documentación API

## ⏭️ Próximos Pasos
1. Completar feature de invitaciones
2. Testing en producción
3. Reunión de revisión el lunes
```

### 3.4 Exportar Resumen

**Formatos disponibles:**
- 📄 Markdown (.md)
- 📝 PDF (.pdf)
- 📊 Word (.docx)
- 📋 Texto plano (.txt)

**Ejemplo de uso:**
```typescript
<Button
  onClick={() => exportSummary('markdown')}
  icon={<Download />}
>
  Exportar Resumen
</Button>
```

---

## 4. Grabación y Transcripción

### 4.1 Grabación de Audio

**Acceso:** Solo líderes de área

**Proceso:**
1. Click en botón "Grabar"
2. Permitir acceso al micrófono
3. Hablar durante la reunión
4. Click "Detener"
5. Archivo se sube automáticamente

**Límites:**
- Duración máxima: 2 horas
- Formato: WAV, MP3, M4A
- Tamaño máximo: 500 MB

### 4.2 Transcripción con Whisper

**Motor:** OpenAI Whisper API

**Características:**
- ✅ Reconocimiento multiidioma
- ✅ Puntuación automática
- ✅ Identificación de hablantes (limitado)
- ✅ Alta precisión (>95%)

**Proceso:**
```
1. Usuario sube archivo de audio
   ↓
2. Backend recibe archivo
   ↓
3. Validación de formato y tamaño
   ↓
4. Envío a Whisper API
   ↓
5. Recepción de transcripción
   ↓
6. Post-procesamiento
   ├─> Formateo de párrafos
   ├─> Corrección de puntuación
   └─> Timestamps opcionales
   ↓
7. Almacenamiento en DB
   ↓
8. Notificación al usuario
```

**Ejemplo de transcripción:**
```
[00:00:00] Bienvenidos a la reunión de hoy. Vamos a discutir tres temas principales.

[00:00:15] El primero es la integración con Telegram. Juan, ¿puedes dar un update?

[00:00:30] Sí, claro. Hemos completado la vinculación de grupos. El sistema de QR está funcionando perfectamente.

[00:01:00] Excelente. ¿Hay algún pendiente?

[00:01:05] Sí, la invitación por email está en desarrollo.
```

### 4.3 Edición de Transcripción

**Funcionalidades:**
- ✏️ Corrección manual de texto
- 👤 Asignación de hablantes
- 🕐 Ajuste de timestamps
- 📝 Agregar notas
- 🔖 Marcar secciones importantes

---

## 5. Generación de Minutas

### 5.1 Botón "Minuta de Reunión"

**Ubicación:** Vista de chat → Botón con ícono 📋

**Requisitos:**
- Usuario debe ser líder del área
- Debe existir contexto de conversación
- Al menos 10 mensajes en el área

### 5.2 Proceso de Generación

```
1. Usuario click "Minuta de Reunión"
   ↓
2. Modal con opciones:
   ├─> Incluir últimos N mensajes
   ├─> Incluir transcripción de audio
   └─> Personalizar template
   ↓
3. Usuario confirma
   ↓
4. Sistema procesa contexto
   ↓
5. IA genera minuta estructurada
   ↓
6. Usuario revisa y edita
   ↓
7. Guardar como documento
   ↓
8. Compartir con equipo
```

### 5.3 Template de Minuta

```markdown
# 📋 MINUTA DE REUNIÓN

## Información General
**Equipo:** [Nombre del equipo]
**Área:** [Nombre del área]
**Fecha:** [DD/MM/YYYY]
**Hora:** [HH:MM - HH:MM]
**Moderador:** [Nombre del líder]

## 👥 Participantes
- [Nombre 1] - [Rol]
- [Nombre 2] - [Rol]
- [Nombre 3] - [Rol]

## 📌 Objetivo de la Reunión
[Descripción del propósito de la reunión]

## 📋 Agenda
1. [Tema 1]
2. [Tema 2]
3. [Tema 3]

## 💬 Temas Discutidos

### 1. [Tema 1]
**Descripción:** [Resumen de la discusión]

**Puntos clave:**
- [Punto 1]
- [Punto 2]

**Decisiones:**
- [Decisión 1]

---

### 2. [Tema 2]
**Descripción:** [Resumen de la discusión]

**Puntos clave:**
- [Punto 1]
- [Punto 2]

**Decisiones:**
- [Decisión 1]

---

## ✅ Acuerdos y Decisiones
1. [Acuerdo 1]
2. [Acuerdo 2]
3. [Acuerdo 3]

## 📋 Tareas Asignadas
| Tarea | Responsable | Fecha Límite | Estado |
|-------|-------------|--------------|--------|
| [Tarea 1] | [Nombre] | [DD/MM/YYYY] | Pendiente |
| [Tarea 2] | [Nombre] | [DD/MM/YYYY] | Pendiente |

## ⏭️ Próximos Pasos
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

## 📅 Próxima Reunión
**Fecha:** [DD/MM/YYYY]
**Hora:** [HH:MM]
**Temas a tratar:**
- [Tema 1]
- [Tema 2]

---

**Minuta generada automáticamente por Bridge AI**
**Fecha de generación:** [DD/MM/YYYY HH:MM]
```

### 5.4 Edición de Minuta

**Editor integrado:**
- Rich text editor
- Markdown support
- Drag & drop para reorganizar
- Auto-save cada 30 segundos

### 5.5 Compartir Minuta

**Opciones:**
- 📧 Enviar por email a participantes
- 💬 Publicar en chat del área
- 📤 Exportar como PDF
- 🔗 Generar link compartible

---

## 6. Arquitectura Técnica

### 6.1 Diagrama de Componentes

```
┌───────────────────────────────────────────────────────┐
│                    ARQUITECTURA IA                     │
└───────────────────────────────────────────────────────┘

Frontend
    │
    ├─── ChatInput
    │    ├─> Detección de @IA
    │    └─> Trigger de consultas
    │
    ├─── AIAssistantButton
    │    └─> Modal de consulta
    │
    ├─── SummaryButton
    │    └─> Modal de opciones
    │
    ├─── MinuteButton
    │    └─> Modal de generación
    │
    └─── AIService
         ├─> consultAI()
         ├─> generateSummary()
         ├─> generateMinute()
         └─> transcribeAudio()

                    ↓ REST API

Backend (Node.js + Express)
    │
    ├─── AI Controller
    │    ├─> POST /api/ai/consult
    │    ├─> POST /api/ai/summary
    │    ├─> POST /api/ai/minute
    │    └─> POST /api/ai/transcribe
    │
    ├─── Context Manager
    │    ├─> Recolección de mensajes
    │    ├─> Filtrado de relevancia
    │    ├─> Compresión de contexto
    │    └─> Token optimization
    │
    ├─── OpenAI Service
    │    ├─> Chat completions (GPT-4)
    │    ├─> Whisper (transcripción)
    │    └─> Embeddings (búsqueda)
    │
    └─── Cache Layer (Redis)
         ├─> Resúmenes generados
         ├─> Respuestas frecuentes
         └─> Contexto de áreas

                    ↓ HTTP

OpenAI API
    │
    ├─── GPT-4 Turbo
    │    └─> Chat completions
    │
    ├─── Whisper
    │    └─> Audio transcription
    │
    └─── Embeddings
         └─> text-embedding-3-small
```

### 6.2 Flujo de Consulta a IA

```
1. Usuario escribe "@IA [pregunta]"
   ↓
2. Frontend detecta patrón @IA
   ↓
3. AIService.consultAI({
     question: "...",
     areaId: "...",
     contextMessages: 50
   })
   ↓
4. Backend recibe request
   ↓
5. Context Manager:
   ├─> Obtiene últimos 50 mensajes del área
   ├─> Obtiene info del área y equipo
   ├─> Obtiene resúmenes anteriores
   └─> Construye contexto optimizado
   ↓
6. OpenAI Service:
   ├─> Construye prompt con contexto
   ├─> Envía a GPT-4 Turbo
   └─> Recibe respuesta
   ↓
7. Post-procesamiento:
   ├─> Formateo de markdown
   ├─> Extracción de menciones
   └─> Validación de contenido
   ↓
8. Guardar en DB como mensaje
   ↓
9. Broadcast via WebSocket
   ↓
10. UI muestra respuesta con badge "IA"
```

---

## 7. API y Endpoints

### 7.1 POST /api/ai/consult

Realiza una consulta al asistente IA.

**Request:**
```typescript
{
  question: string;
  areaId: string;
  teamId: string;
  contextMessages?: number; // default: 50
  includeFiles?: boolean;   // default: false
}
```

**Response:**
```typescript
{
  success: boolean;
  response: string;  // Respuesta del asistente
  messageId: string; // ID del mensaje generado
  tokensUsed: number;
  cost: number;      // Costo en USD
}
```

**Ejemplo:**
```typescript
const result = await AIService.consultAI({
  question: "¿Cuáles son las tareas pendientes?",
  areaId: "area-123",
  teamId: "team-456",
  contextMessages: 100
});

console.log(result.response);
// "Hay 5 tareas pendientes:
//  1. Fix bug #123 (Juan)
//  2. Diseño de dashboard (María)
//  ..."
```

---

### 7.2 POST /api/ai/summary

Genera un resumen de conversaciones.

**Request:**
```typescript
{
  areaId: string;
  teamId: string;
  messageCount?: number;     // Últimos N mensajes
  startDate?: string;        // Fecha inicio (ISO)
  endDate?: string;          // Fecha fin (ISO)
  format?: 'markdown' | 'plain';
  includeDecisions?: boolean; // Destacar decisiones
  includeTasks?: boolean;     // Extraer tareas
}
```

**Response:**
```typescript
{
  success: boolean;
  summary: string;        // Resumen generado
  summaryId: string;      // ID del resumen guardado
  messageCount: number;   // Mensajes procesados
  tokensUsed: number;
  cost: number;
  metadata: {
    participants: string[];
    mainTopics: string[];
    decisions: string[];
    tasks: Array<{
      description: string;
      assignee?: string;
      dueDate?: string;
    }>;
  };
}
```

---

### 7.3 POST /api/ai/minute

Genera una minuta de reunión estructurada.

**Request:**
```typescript
{
  areaId: string;
  teamId: string;
  title?: string;
  messageCount?: number;
  includeTranscription?: boolean;
  transcriptionId?: string;
  template?: 'default' | 'agile' | 'executive';
}
```

**Response:**
```typescript
{
  success: boolean;
  minute: {
    id: string;
    title: string;
    content: string;       // Markdown
    metadata: {
      date: string;
      participants: string[];
      duration?: number;   // minutos
      topics: string[];
      decisions: string[];
      tasks: Array<{
        description: string;
        assignee: string;
        dueDate?: string;
      }>;
    };
  };
  tokensUsed: number;
  cost: number;
}
```

---

### 7.4 POST /api/ai/transcribe

Transcribe un archivo de audio.

**Request:** `multipart/form-data`
```typescript
{
  file: File;          // Audio file
  areaId: string;
  teamId: string;
  language?: string;   // 'es', 'en', 'auto'
  includeTimestamps?: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  transcription: {
    id: string;
    text: string;
    language: string;
    duration: number;    // segundos
    segments?: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  };
  cost: number;
}
```

---

## 8. Gestión de Contexto

### 8.1 Context Manager

**Responsabilidades:**
1. Recolectar información relevante
2. Comprimir contexto para reducir tokens
3. Priorizar información reciente
4. Mantener coherencia temporal

**Estrategias de Compresión:**

#### 8.1.1 Mensajes Recientes (High Priority)
```
Últimos 20 mensajes: Texto completo
```

#### 8.1.2 Mensajes Medios (Medium Priority)
```
Mensajes 21-50: Resumen de 3-5 líneas por mensaje
```

#### 8.1.3 Mensajes Antiguos (Low Priority)
```
Mensajes 51+: Solo keywords y metadata
```

### 8.2 Prompt Engineering

**Template base:**
```
Eres un asistente inteligente del sistema Bridge, una plataforma de gestión de equipos.

Contexto del área:
- Nombre: {areaName}
- Equipo: {teamName}
- Líder: {leaderName}
- Miembros: {memberCount}

Últimas conversaciones:
{recentMessages}

Resúmenes anteriores:
{previousSummaries}

Usuario pregunta: "{userQuestion}"

Instrucciones:
1. Responde de forma concisa y profesional
2. Usa formato markdown cuando sea apropiado
3. Si no tienes suficiente información, indícalo claramente
4. Prioriza información reciente sobre antigua
5. Menciona a usuarios con @username cuando sea relevante
```

### 8.3 Optimización de Tokens

**Límites por modelo:**
| Modelo | Contexto | Output | Total |
|--------|----------|--------|-------|
| GPT-4 Turbo | 128k | 4k | 132k |
| GPT-3.5 Turbo | 16k | 4k | 20k |

**Estrategia de Bridge:**
```typescript
const contextBudget = {
  systemPrompt: 500,      // Instrucciones base
  areaInfo: 200,          // Info del área
  recentMessages: 4000,   // Últimos mensajes
  summaries: 1000,        // Resúmenes anteriores
  userQuestion: 300,      // Pregunta del usuario
  buffer: 1000,           // Margen de seguridad
};

const totalBudget = Object.values(contextBudget).reduce((a, b) => a + b);
// totalBudget = 7000 tokens ~= $0.035 por consulta
```

---

## 9. Optimización de Costos

### 9.1 Costos por Modelo

**Pricing OpenAI (Octubre 2025):**
| Modelo | Input | Output |
|--------|-------|--------|
| GPT-4 Turbo | $0.01 / 1k tokens | $0.03 / 1k tokens |
| GPT-3.5 Turbo | $0.001 / 1k tokens | $0.002 / 1k tokens |
| Whisper | $0.006 / minuto | - |

### 9.2 Estimación de Costos

**Consulta típica:**
```
Input: 7,000 tokens × $0.01 / 1k = $0.07
Output: 500 tokens × $0.03 / 1k = $0.015
Total: ~$0.085 por consulta
```

**Resumen (100 mensajes):**
```
Input: 15,000 tokens × $0.01 / 1k = $0.15
Output: 1,000 tokens × $0.03 / 1k = $0.03
Total: ~$0.18 por resumen
```

**Transcripción (30 minutos):**
```
30 minutos × $0.006 = $0.18
```

### 9.3 Estrategias de Ahorro

✅ **Caching de Respuestas:**
```typescript
// Cache respuestas frecuentes por 1 hora
const cacheKey = `ai:response:${hash(question + context)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const response = await openai.chat.completions.create(...);
await redis.setex(cacheKey, 3600, JSON.stringify(response));
```

✅ **Rate Limiting:**
```typescript
// Máximo 10 consultas por usuario por hora
const rateLimitKey = `ai:rate:${userId}`;
const count = await redis.incr(rateLimitKey);

if (count === 1) {
  await redis.expire(rateLimitKey, 3600);
}

if (count > 10) {
  throw new Error('Rate limit exceeded');
}
```

✅ **Compresión Inteligente:**
- Usar GPT-3.5 para queries simples
- Resumir mensajes antiguos
- Eliminar información redundante

---

## 10. Permisos y Seguridad

### 10.1 Permisos por Rol

| Acción | Líder | Miembro | Espectador |
|--------|-------|---------|------------|
| Consultar IA | ✅ | ✅ | ❌ |
| Generar resumen | ✅ | ✅ | ❌ |
| Generar minuta | ✅ | ❌ | ❌ |
| Grabar audio | ✅ | ❌ | ❌ |
| Transcribir | ✅ | ✅ | ❌ |
| Ver historial IA | ✅ | ✅ | ❌ |

### 10.2 Validaciones

**Antes de procesar:**
1. ✅ Usuario autenticado
2. ✅ Usuario pertenece al equipo
3. ✅ Usuario tiene permisos en área
4. ✅ Área existe y está activa
5. ✅ Rate limit no excedido
6. ✅ Cuota de tokens disponible

### 10.3 Privacidad

**Datos procesados por IA:**
- ✅ Mensajes del área (con permiso del usuario)
- ✅ Metadata del equipo
- ✅ Transcripciones de audio

**Datos NO compartidos con OpenAI:**
- ❌ Información personal sensible
- ❌ Contraseñas o tokens
- ❌ Datos financieros
- ❌ Mensajes de otras áreas sin permiso

**Retención de datos en OpenAI:**
- OpenAI no usa datos de API para entrenar modelos
- Datos eliminados después de 30 días
- Cumple con GDPR y regulaciones de privacidad

---

## 11. Troubleshooting

### 11.1 Problema: "IA no responde"

**Causas posibles:**
1. Rate limit excedido
2. Error de API de OpenAI
3. Contexto demasiado largo
4. Permisos insuficientes

**Soluciones:**
1. Esperar 1 hora y reintentar
2. Verificar status de OpenAI
3. Reducir número de mensajes de contexto
4. Verificar rol en el área

---

### 11.2 Problema: "Respuesta irrelevante"

**Causas:**
1. Contexto insuficiente
2. Pregunta ambigua
3. Datos antiguos

**Soluciones:**
1. Incluir más mensajes de contexto
2. Reformular pregunta con más detalle
3. Generar resumen actualizado

---

### 11.3 Problema: "Transcripción incorrecta"

**Causas:**
1. Audio de baja calidad
2. Ruido de fondo
3. Múltiples hablantes superpuestos
4. Idioma no detectado correctamente

**Soluciones:**
1. Grabar en ambiente silencioso
2. Usar micrófono de calidad
3. Hablar de forma clara
4. Especificar idioma manualmente

---

## 12. Mejores Prácticas

### 12.1 Para Consultas

✅ **DO:**
- Ser específico en las preguntas
- Proporcionar contexto cuando sea necesario
- Usar @IA solo cuando sea relevante
- Verificar respuestas importantes

❌ **DON'T:**
- Hacer preguntas muy generales
- Sobrecargar con múltiples preguntas en una
- Confiar ciegamente sin verificar
- Abusar del sistema (rate limits)

### 12.2 Para Resúmenes

✅ **DO:**
- Generar resúmenes regularmente
- Revisar y editar si es necesario
- Exportar resúmenes importantes
- Compartir con el equipo

❌ **DON'T:**
- Resumir conversaciones muy cortas (<10 mensajes)
- Ignorar resúmenes generados
- Generar múltiples resúmenes del mismo período

### 12.3 Para Minutas

✅ **DO:**
- Usar template apropiado
- Revisar y completar información faltante
- Asignar tareas específicas
- Establecer fechas límite claras
- Compartir dentro de 24 horas

❌ **DON'T:**
- Generar minutas sin reunión real
- Dejar secciones vacías
- No hacer seguimiento de tareas
- Guardar minutas sin compartir

---

## 13. Roadmap

### 13.1 Funcionalidades Futuras

🔜 **En Desarrollo:**
- Búsqueda semántica en historial
- Sugerencias proactivas de tareas
- Análisis de sentimiento en conversaciones

🎯 **Planificado:**
- Integración con Google Calendar
- Recordatorios automáticos de tareas
- Análisis de productividad del equipo
- Chatbot con memoria a largo plazo

💡 **Ideas:**
- Generación automática de reportes
- Traducción en tiempo real
- Síntesis de voz (TTS)
- Asistente de código

---

**Documento generado:** Octubre 14, 2025  
**Versión:** 1.0.0  
**Autor:** Equipo Bridge  
**Última revisión:** Primera versión completa
