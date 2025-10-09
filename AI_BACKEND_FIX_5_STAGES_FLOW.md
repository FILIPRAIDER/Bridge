# 🚨 FLUJO DE CREACIÓN DE PROYECTO: Chat IA saltándose etapas

## Para: Backend AI Team
## De: Frontend Team  
## Fecha: 9 de Octubre, 2025
## Status: 🔴 URGENTE - UX Rota

---

## 🎯 Problema Reportado

El chat IA está **creando el proyecto demasiado rápido**, saltándose etapas importantes:

### Comportamiento Actual ❌
1. Usuario: "Quiero crear una tienda de ropa en línea"
2. IA pregunta: "¿Tienes presupuesto?" → Usuario: "40 millones"
3. IA pregunta: "¿Quieres que cree el proyecto?" → Usuario: "Sí por favor"
4. **❌ PROYECTO CREADO EN FASE 3/5** (debería ser 5/5)

### Información NO Solicitada:
- ❌ **Duración/Timeline del proyecto** (CRÍTICO - no se preguntó)
- ❌ Objetivos detallados
- ❌ Requisitos específicos
- ❌ Ubicación/ciudad

### Comportamiento Esperado ✅
El IA debe recopilar **TODAS** estas 5 etapas antes de crear el proyecto:

1. ✅ **Tipo de Proyecto + Industria** (Fase 1)
2. ✅ **Presupuesto** (Fase 2)
3. ✅ **Timeline/Duración** (Fase 3) ← **FALTÓ PREGUNTAR**
4. ✅ **Objetivos** (Fase 4)
5. ✅ **Confirmación Final** (Fase 5)

Solo después de las 5 etapas → Crear proyecto

---

## 📊 Banner de Progreso (Frontend)

El banner muestra estas 5 etapas obligatorias:

```javascript
const mainItems = [
  { label: 'Tipo', hasData: flags.hasProjectType, icon: '🎯' },
  { label: 'Industria/Sector', hasData: flags.hasIndustry, icon: '🏢' },
  { label: 'Presupuesto', hasData: flags.hasBudget, icon: '💰' },
  { label: 'Tiempo', hasData: flags.hasTimeline, icon: '⏱️' },  // ❌ NUNCA SE LLENA
  { label: 'Objetivos', hasData: flags.hasObjectivos, icon: '🎯' }
];
```

**Progreso actual**: Se completa 3/5 y ya crea el proyecto  
**Progreso esperado**: Debe llegar a 5/5 antes de crear

---

## 🔍 Análisis del Flujo Actual

### Lo que el IA SÍ hace:
```
User: "Quiero crear una tienda de ropa en línea"
IA: Detecta projectType = "E-commerce de ropa"
    Detecta industry = "Retail / Moda"
    ✅ hasProjectType = true
    ✅ hasIndustry = true
    
IA: "¿Tienes un presupuesto definido?"
User: "40 millones"
IA: Procesa budget = 40000000, currency = COP
    ✅ hasBudget = true

IA: "¿Deseas que cree este proyecto?"  ← ❌ MUY TEMPRANO
User: "Sí por favor"
IA: Llama createProject()
    ❌ PROYECTO CREADO CON SOLO 3/5 ETAPAS
```

### Lo que el IA DEBE hacer:
```
User: "Quiero crear una tienda de ropa en línea"
IA: Detecta projectType + industry
    ✅ hasProjectType = true
    ✅ hasIndustry = true
    
IA: "¿Tienes un presupuesto definido?"
User: "40 millones"
IA: ✅ hasBudget = true

IA: "¿Cuál es el tiempo estimado que manejas para el desarrollo?"
    "Por ejemplo, ¿quieres lanzar la aplicación en un mes, en tres meses?"
User: "En 3 meses"
IA: Procesa timeline = 3, timelineUnit = "months"
    ✅ hasTimeline = true

IA: "¿Cuáles son los objetivos principales de este proyecto?"
User: "Aumentar ventas y atraer nuevos clientes"
IA: Procesa objectives = ["Aumentar ventas", "Atraer nuevos clientes"]
    ✅ hasObjectives = true

IA: Ahora TODAS las etapas están completas (5/5)
IA: "Excelente! Aquí tienes un resumen de la información recopilada..."
    "¿Deseas que cree este proyecto?"
User: "Sí"
IA: Llama createProject()
    ✅ PROYECTO CREADO CON 5/5 ETAPAS
```

---

## 🛠️ Solución Requerida (Backend IA)

### 1. Modificar el Prompt del Sistema

Agregar instrucciones explícitas sobre las **5 etapas obligatorias**:

```javascript
// En src/lib/openai.js o donde esté el system prompt

const SYSTEM_PROMPT = `
Eres Bridge AI, un asistente inteligente para crear proyectos y encontrar equipos.

IMPORTANTE: Para crear un proyecto, debes recopilar OBLIGATORIAMENTE esta información en orden:

**ETAPAS OBLIGATORIAS (5 en total):**

1. TIPO DE PROYECTO + INDUSTRIA/SECTOR (Fase 1 - 2/5)
   - Identifica qué tipo de proyecto quiere crear
   - Detecta la industria o sector (e-commerce, fintech, salud, etc.)
   - Marca: hasProjectType = true, hasIndustry = true

2. PRESUPUESTO (Fase 2 - 3/5)
   - Pregunta: "¿Tienes un presupuesto definido para este proyecto? (Si es así, por favor indícame el monto.)"
   - Espera respuesta con monto
   - Marca: hasBudget = true

3. TIMELINE/DURACIÓN (Fase 3 - 4/5) ⚠️ CRÍTICO
   - Pregunta: "¿Cuál es el tiempo estimado que manejas para el desarrollo?"
   - Ejemplo: "Por ejemplo, ¿quieres lanzar la aplicación en un mes, en tres meses?"
   - Espera respuesta con duración (X meses, Y semanas)
   - Marca: hasTimeline = true
   - ⚠️ NO PUEDES SALTAR ESTA PREGUNTA

4. OBJETIVOS (Fase 4 - 5/5)
   - Si el usuario no ha mencionado objetivos específicos, pregunta:
     "¿Cuáles son los objetivos principales de este proyecto?"
   - Espera objetivos claros (aumentar ventas, automatizar procesos, etc.)
   - Marca: hasObjectives = true

5. CONFIRMACIÓN FINAL (Fase 5 - Ready to create)
   - Solo después de tener las 4 etapas anteriores completas
   - Muestra resumen completo:
     * Tipo de proyecto
     * Industria/Sector
     * Presupuesto
     * Timeline
     * Objetivos
   - Pregunta: "¿Deseas que cree este proyecto?"
   - Espera confirmación explícita (sí, adelante, crear, etc.)
   - Solo entonces llama createProject()

**REGLAS CRÍTICAS:**
- ❌ NO crear el proyecto hasta tener las 5 etapas completas
- ❌ NO saltarse la pregunta de TIMELINE (es obligatoria)
- ❌ NO asumir información que el usuario no dio
- ✅ Preguntar UNA cosa a la vez (no abrumar al usuario)
- ✅ Ser conversacional y natural
- ✅ Si el usuario da varias respuestas juntas, procesarlas todas

**Ejemplo de flujo correcto:**
User: "Quiero una tienda online"
AI: Detecta tipo + industria → 2/5 completo
AI: "¿Tienes un presupuesto definido?"
User: "40 millones"
AI: Procesa presupuesto → 3/5 completo
AI: "¿Cuál es el tiempo estimado para el desarrollo?"  ← NO SALTAR ESTO
User: "3 meses"
AI: Procesa timeline → 4/5 completo
AI: "¿Cuáles son los objetivos principales?"
User: "Aumentar ventas"
AI: Procesa objetivos → 5/5 completo
AI: Muestra resumen + pregunta confirmación
User: "Sí, créalo"
AI: createProject() ✅

Si en algún momento el usuario pide crear el proyecto antes de tiempo:
- Responde amablemente que faltan algunos detalles importantes
- Continúa con la siguiente pregunta pendiente
`;
```

### 2. Validar Antes de Llamar `createProject()`

Agregar validación en el tool handler:

```javascript
// En el handler de createProject
{
  name: "createProject",
  description: "Crea un nuevo proyecto. SOLO llamar cuando se hayan recopilado las 5 etapas.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      budget: { type: "number" },
      budgetCurrency: { type: "string", enum: ["COP", "USD"] },
      timeline: { type: "number" },        // ⚠️ OBLIGATORIO
      timelineUnit: { type: "string", enum: ["months", "weeks"] },  // ⚠️ OBLIGATORIO
      objectives: { 
        type: "array",
        items: { type: "string" },
        minItems: 1  // ⚠️ Al menos 1 objetivo
      },
      industry: { type: "string" },
      // ... otros campos
    },
    required: [
      "title",
      "description", 
      "budget",
      "budgetCurrency",
      "timeline",        // ✅ OBLIGATORIO
      "timelineUnit",    // ✅ OBLIGATORIO
      "objectives",      // ✅ OBLIGATORIO
      "industry"
    ]
  }
}

// En el handler
async function handleCreateProject(params, context) {
  // Validación adicional
  if (!params.timeline || params.timeline <= 0) {
    throw new Error("Timeline es obligatorio y debe ser mayor a 0");
  }
  
  if (!params.objectives || params.objectives.length === 0) {
    throw new Error("Se requiere al menos un objetivo");
  }
  
  // Proceder a crear proyecto...
  const project = await createProject(params);
  
  return {
    success: true,
    projectId: project.id,
    message: `¡Tu proyecto de "${project.title}" ha sido creado exitosamente! 🎉`
  };
}
```

### 3. Tracking de Flags en Context

Mantener tracking de qué se ha recopilado:

```javascript
// En cada turn del chat, actualizar context.projectCreation
{
  sessionId: "xxx",
  context: {
    userId: "xxx",
    companyId: "xxx",
    projectCreation: {
      hasProjectType: true/false,
      hasIndustry: true/false,
      hasBudget: true/false,
      hasTimeline: true/false,     // ⚠️ Verificar esto
      hasObjectives: true/false,
      isComplete: false,           // Solo true cuando todas las 5 están
      needsConfirmation: false,
      wasConfirmed: false
    }
  }
}

// Calcular isComplete
projectCreation.isComplete = 
  projectCreation.hasProjectType &&
  projectCreation.hasIndustry &&
  projectCreation.hasBudget &&
  projectCreation.hasTimeline &&      // ⚠️ OBLIGATORIO
  projectCreation.hasObjectives;

// Solo permitir createProject() cuando isComplete === true
```

---

## 📋 Preguntas Específicas a Hacer

### Para Timeline (LA QUE FALTA):
```
Opciones de pregunta:
1. "¿Cuál es el tiempo estimado que manejas para el desarrollo?"
2. "¿En cuánto tiempo te gustaría tener listo el proyecto?"
3. "¿Tienes una fecha límite o timeline en mente? Por ejemplo, ¿quieres lanzar en un mes, tres meses?"
4. "¿Cuál es el plazo que consideras para completar este proyecto?"

Respuestas esperadas:
- "3 meses" → timeline: 3, timelineUnit: "months"
- "En 2 meses" → timeline: 2, timelineUnit: "months"
- "6 semanas" → timeline: 6, timelineUnit: "weeks"
- "Un mes" → timeline: 1, timelineUnit: "months"
```

### Para Objetivos:
```
Si el usuario no los mencionó:
"¿Cuáles son los objetivos principales de este proyecto?"
"¿Qué esperas lograr con esta tienda online?"

Respuestas esperadas:
- "Aumentar ventas" → objectives: ["Aumentar ventas"]
- "Atraer clientes y mejorar la experiencia" → objectives: ["Atraer clientes", "Mejorar experiencia de usuario"]
```

---

## 🎨 Actualización de Flags (Response Structure)

Cada respuesta del AI debe incluir los flags actualizados:

```json
{
  "sessionId": "session_xxx",
  "message": "¿Cuál es el tiempo estimado que manejas para el desarrollo?",
  "flags": {
    "hasProjectType": true,
    "hasIndustry": true,
    "hasBudget": true,
    "hasTimeline": false,        // ← Aún no, estamos preguntando
    "hasObjectives": false,
    "isComplete": false,         // ← Solo true cuando todas las 5 estén
    "needsConfirmation": false,
    "wasConfirmed": false
  },
  "projectData": {
    "projectType": "E-commerce de ropa",
    "industry": "Retail / Moda",
    "budget": 40000000,
    "budgetCurrency": "COP",
    "timeline": null,            // ← Aún no recopilado
    "timelineUnit": null,
    "objectives": [],            // ← Aún no recopilado
    // ...
  }
}
```

Después de que usuario responda "3 meses":

```json
{
  "sessionId": "session_xxx",
  "message": "Perfecto, 3 meses es un buen plazo. ¿Cuáles son los objetivos principales?",
  "flags": {
    "hasProjectType": true,
    "hasIndustry": true,
    "hasBudget": true,
    "hasTimeline": true,         // ✅ Ahora sí
    "hasObjectives": false,
    "isComplete": false,         // ← Todavía falta objectives
    "needsConfirmation": false,
    "wasConfirmed": false
  },
  "projectData": {
    "projectType": "E-commerce de ropa",
    "industry": "Retail / Moda",
    "budget": 40000000,
    "budgetCurrency": "COP",
    "timeline": 3,               // ✅ Recopilado
    "timelineUnit": "months",    // ✅ Recopilado
    "objectives": [],            // ← Siguiente a recopilar
    // ...
  }
}
```

---

## 🧪 Testing Requerido

### Test 1: Flujo Completo Normal
```
User: "Quiero una tienda online"
AI: Pregunta presupuesto
User: "40 millones"
AI: Pregunta timeline ← DEBE PREGUNTAR ESTO
User: "3 meses"
AI: Pregunta objetivos ← DEBE PREGUNTAR ESTO
User: "Aumentar ventas"
AI: Muestra resumen + confirmación
User: "Sí, créalo"
AI: createProject() ✅
Banner: 5/5 completo → verde → desaparece
```

### Test 2: Usuario Impaciente
```
User: "Crea mi proyecto ya"
AI: "Claro, pero primero necesito algunos detalles. ¿Qué tipo de proyecto?"
User: "Una app móvil"
AI: "¿Cuál es el presupuesto?"
User: "Créala de una vez"
AI: "Entiendo tu urgencia, pero para crear el proyecto necesito el presupuesto y timeline"
    ← NO CREAR HASTA TENER TODO
```

### Test 3: Usuario da Todo Junto
```
User: "Quiero una tienda online con presupuesto de 40 millones para 3 meses"
AI: Procesa todo:
    hasProjectType = true
    hasBudget = true
    hasTimeline = true ✅
AI: "Genial! Solo falta conocer los objetivos principales"
    ← Inteligente: procesa lo que dio, pregunta lo que falta
```

---

## 📊 Checklist de Implementación

- [ ] Actualizar system prompt con las 5 etapas obligatorias
- [ ] Agregar validación de timeline en createProject schema
- [ ] Hacer timeline y objectives REQUIRED en el schema
- [ ] Implementar tracking de flags en context
- [ ] Calcular isComplete correctamente (las 5 etapas)
- [ ] Agregar lógica para preguntar timeline si falta
- [ ] Agregar lógica para preguntar objectives si faltan
- [ ] No permitir createProject() hasta isComplete === true
- [ ] Probar flujo completo end-to-end
- [ ] Verificar que banner llegue a 5/5 antes de crear

---

## 🎯 Resultado Esperado

**Antes del Fix** ❌:
```
1/5 → 2/5 → 3/5 → ¡PROYECTO CREADO! (mal)
```

**Después del Fix** ✅:
```
1/5 → 2/5 → 3/5 → 4/5 → 5/5 → Confirmación → ¡PROYECTO CREADO! ✅
                              ↑ Verde + Confetti
```

---

## 🔗 Referencias

- **Frontend**: `src/components/chat/ProjectProgressBanner.tsx`
- **Backend IA**: `bridge-ai-api/src/lib/openai.js`
- **Schema**: Tool definition de `createProject`

---

**Reportado por**: Frontend Team  
**Fecha**: 9 de Octubre, 2025  
**Prioridad**: 🔴 ALTA (UX rota)  
**Status**: 🔴 PENDIENTE FIX EN BACKEND IA
