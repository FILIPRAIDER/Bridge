# 🎯 AJUSTE: Sistema de 5 Fases para Creación de Proyectos

## 📋 CONTEXTO

**Situación Actual:**
- Frontend muestra banner con progreso de **5 fases obligatorias**
- AI está recopilando 4 datos pero el banner muestra 3/5 (60%)
- Usuario confirma creación pero falla con error genérico

**Screenshot de Evidencia:**
```
Banner: "Información del Proyecto - 3/5 completado - 60%"

Información recopilada:
✓ Tipo de proyecto: App móvil para negocio de comidas rápidas
✓ Objetivos principales: Que la aplicación sea atractiva y funcional
✓ Presupuesto: 30 millones de pesos
✓ Tiempo de entrega: 3 meses

Usuario: "Sí por favor"
AI: "Parece que hubo un error al intentar crear el proyecto debi..."
```

---

## 🔍 PROBLEMA IDENTIFICADO

### 1. Discrepancia en Tracking de Flags
**Código Frontend (ProjectProgressBanner.tsx, línea 68-74):**
```typescript
const mainItems = [
  { label: 'Tipo', hasData: flags.hasProjectType, icon: '🎯' },
  { label: 'Industria/Sector', hasData: flags.hasIndustry, icon: '🏢' }, // ← NO SE MARCA
  { label: 'Presupuesto', hasData: flags.hasBudget, icon: '💰' },
  { label: 'Tiempo', hasData: flags.hasTimeline, icon: '⏱️' },
  { label: 'Objetivos', hasData: flags.hasObjectives, icon: '🎯' },
];
```

**Backend debe marcar estas 5 flags:**
- `hasProjectType` ✅ (marcada correctamente)
- `hasIndustry` ❌ (NO se está marcando aunque podría inferirse)
- `hasBudget` ✅ (marcada correctamente)
- `hasTimeline` ✅ (marcada correctamente)
- `hasObjectives` ❌ (NO se está marcando aunque se preguntó)

### 2. Flag `hasObjectives` No Se Marca
**Evidencia:**
- AI preguntó: "¿Cuáles son los objetivos principales?"
- Usuario respondió: "Que la aplicación sea atractiva y funcional"
- Banner sigue en 3/5 (debería pasar a 4/5)

**Posible causa:**
- La respuesta no se parsea como array de objetivos
- El flag no se actualiza en la sesión
- La validación es demasiado estricta

---

## ✅ SOLUCIÓN PROPUESTA

### OPCIÓN A: Mantener 5 Fases (RECOMENDADO) ⭐

**Por qué es mejor:**
1. ✅ Información completa para match inteligente de equipos
2. ✅ Mejor experiencia de usuario (siente que está siendo exhaustivo)
3. ✅ Datos estructurados y consistentes en la base de datos
4. ✅ Permite filtros avanzados en dashboard empresario

**Las 5 fases obligatorias:**
1. **Tipo de proyecto** (`hasProjectType`)
   - Pregunta: "¿Qué tipo de proyecto necesitas desarrollar?"
   - Ejemplos: App móvil, Sitio web, Sistema ERP, E-commerce, etc.
   
2. **Industria/Sector** (`hasIndustry`)
   - Pregunta: "¿A qué industria o sector pertenece tu negocio?"
   - Ejemplos: Tecnología, Salud, Retail, Alimentos, Educación, etc.
   - **IMPORTANTE**: Esto se usa para match de equipos con experiencia en el sector
   
3. **Presupuesto** (`hasBudget`)
   - Pregunta: "¿Cuál es tu presupuesto aproximado?"
   - Formato: Número + moneda (COP/USD)
   
4. **Timeline** (`hasTimeline`)
   - Pregunta: "¿En cuánto tiempo necesitas tenerlo listo?"
   - Formato: Número + unidad (meses/semanas)
   
5. **Objetivos** (`hasObjectives`)
   - Pregunta: "¿Cuáles son los objetivos principales que quieres lograr?"
   - Formato: Array de strings (incluso si el usuario da una respuesta como texto)

---

## 🔧 CAMBIOS NECESARIOS EN BACKEND IA

### 1. System Prompt - Flujo de 5 Pasos (Actualizado)

**Reemplazar la sección actual de "FLUJO DE CREACIÓN" con:**

```
⚙️ FLUJO DE CREACIÓN DE PROYECTO (OBLIGATORIO - SIGUE ESTOS PASOS EN ORDEN):

1. Pregunta: "¿Qué tipo de proyecto necesitas desarrollar?" 
   → Espera respuesta → Marca hasProjectType = true
   
2. Pregunta: "¿A qué industria o sector pertenece tu negocio?"
   → Espera respuesta → Marca hasIndustry = true
   → Ejemplos si dudas: "¿Es tecnología, salud, retail, alimentos, educación...?"
   
3. Pregunta: "¿Cuáles son los objetivos principales que quieres lograr con este proyecto?"
   → Espera respuesta → Marca hasObjectives = true
   → Convierte la respuesta en array (aunque sea un solo string)
   
4. Pregunta: "¿Cuál es tu presupuesto aproximado en pesos colombianos?"
   → Espera respuesta → Marca hasBudget = true
   
5. Pregunta: "¿En cuánto tiempo necesitas tenerlo listo?"
   → Espera respuesta → Marca hasTimeline = true
   
6. Resume TODA la información recopilada:
   "Perfecto, vamos a crear tu proyecto con estos datos:
   • Tipo: [tipo]
   • Sector: [industria]
   • Objetivos: [lista de objetivos]
   • Presupuesto: [presupuesto]
   • Tiempo: [timeline]
   
   ¿Deseas que cree el proyecto con esta información?"
   
7. SOLO si el usuario confirma (dice "sí", "confirmo", "adelante", "correcto", "dale") 
   → Marca wasConfirmed = true
   → Llama createProjectDraft con isComplete: true
   
8. Una vez creado exitosamente, ofrece buscar equipos

⚠️ REGLAS CRÍTICAS:
- ❌ NO llames createProjectDraft si falta alguna de las 5 flags: hasProjectType, hasIndustry, hasObjectives, hasBudget, hasTimeline
- ❌ NO llames createProjectDraft sin confirmación explícita (wasConfirmed = true)
- ❌ NO asumas información - pregunta TODO antes de crear
- ✅ SÍ actualiza las flags en CADA respuesta del usuario
- ✅ SÍ valida que isComplete = true solo cuando las 5 flags estén marcadas
- ✅ SÍ convierte respuestas de objetivos en array aunque sea un solo texto
```

---

### 2. Actualizar Lógica de Flags (project-flags.js o equivalente)

**Agregar validación específica para `hasObjectives`:**

```javascript
// Cuando el usuario responde objetivos
if (userMessage.toLowerCase().includes('objetivo') || 
    (contextHints.askingForObjectives && userMessage.length > 10)) {
  
  // Convertir respuesta a array de objetivos
  let objectives = [];
  
  // Si es una lista (separada por comas, puntos, "y", etc.)
  if (userMessage.includes(',') || userMessage.includes(' y ')) {
    objectives = userMessage
      .split(/[,y]/)
      .map(obj => obj.trim())
      .filter(obj => obj.length > 3);
  } else {
    // Si es un solo objetivo en texto libre
    objectives = [userMessage.trim()];
  }
  
  // Actualizar data y flag
  sessionData.projectData.objectives = objectives;
  sessionData.projectFlags.hasObjectives = true;
  
  console.log('✅ Objetivos marcados:', objectives);
}
```

**Agregar validación específica para `hasIndustry`:**

```javascript
// Cuando el usuario responde industria/sector
if (userMessage.toLowerCase().match(/tecnolog[ií]a|salud|retail|alimentos|educaci[oó]n|financiero|construcci[oó]n|textil|manufactura|servicios|transporte/i) ||
    (contextHints.askingForIndustry && userMessage.length > 3)) {
  
  // Extraer industria mencionada
  const industry = userMessage.trim();
  
  // Actualizar data y flag
  sessionData.projectData.industry = industry;
  sessionData.projectFlags.hasIndustry = true;
  
  console.log('✅ Industria marcada:', industry);
}
```

---

### 3. Validación Antes de Crear Proyecto (chat.route.js)

**Actualizar la validación en el handler de `createProjectDraft`:**

```javascript
// ⚠️ VALIDACIÓN: Las 5 flags OBLIGATORIAS
if (!updatedFlags.isComplete) {
  const missing = [];
  
  if (!updatedFlags.hasProjectType) {
    missing.push('tipo de proyecto');
  }
  if (!updatedFlags.hasIndustry) {
    missing.push('industria o sector del negocio'); // ← NUEVA
  }
  if (!updatedFlags.hasObjectives) {
    missing.push('objetivos principales del proyecto'); // ← ACTUALIZADA
  }
  if (!updatedFlags.hasBudget) {
    missing.push('presupuesto aproximado');
  }
  if (!updatedFlags.hasTimeline) {
    missing.push('tiempo de desarrollo estimado');
  }
  
  toolResults.push({
    name,
    result: { 
      error: 'Información incompleta para crear el proyecto.', 
      status: 400,
      message: `⚠️ Falta información esencial: ${missing.join(', ')}. Por favor, responde estas preguntas antes de intentar crear el proyecto.`,
      missingFields: missing,
      currentProgress: `${5 - missing.length}/5 completado`
    },
    toolCallId
  });
  
  console.error('❌ Intento de crear proyecto con info incompleta:', {
    missing,
    flags: updatedFlags
  });
  
  continue; // Skip to next tool
}

// ⚠️ VALIDACIÓN: Confirmación explícita
const wasConfirmed = updatedFlags.wasConfirmed;

if (!wasConfirmed) {
  toolResults.push({
    name,
    result: { 
      error: 'Confirmación requerida.', 
      status: 400,
      message: '⚠️ Necesito que confirmes explícitamente para crear el proyecto. Por favor, responde "sí", "confirmo" o "adelante".',
    },
    toolCallId
  });
  
  console.error('❌ Intento de crear proyecto sin confirmación');
  continue;
}

// ✅ TODO OK - Proceder con la creación
console.log('✅ Validaciones pasadas, creando proyecto:', {
  type: sessionData.projectData.projectType,
  industry: sessionData.projectData.industry,
  objectives: sessionData.projectData.objectives,
  budget: sessionData.projectData.budget,
  timeline: sessionData.projectData.timeline
});
```

---

### 4. Mejor Manejo de Errores

**Cuando falla la creación, responder con mensaje específico:**

```javascript
catch (error) {
  console.error('❌ Error al crear proyecto:', error);
  
  // Mensaje de error más útil para el usuario
  let userMessage = 'Lo siento, hubo un problema al crear tu proyecto.';
  
  if (error.message.includes('companyId')) {
    userMessage = 'No pude identificar tu empresa. Por favor, recarga la página e intenta de nuevo.';
  } else if (error.message.includes('validation')) {
    userMessage = 'Algunos datos no tienen el formato correcto. Revisemos la información...';
  } else if (error.message.includes('timeout')) {
    userMessage = 'La conexión tardó demasiado. Intentemos de nuevo en un momento.';
  }
  
  toolResults.push({
    name,
    result: { 
      error: error.message, 
      status: error.status || 500,
      message: userMessage,
      detailedError: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    toolCallId
  });
}
```

---

## 🧪 CASOS DE PRUEBA

### Test Case 1: Flujo Completo Exitoso
```
Usuario: "Necesito una app"
AI: "¿Qué tipo de proyecto necesitas desarrollar?"
Usuario: "App móvil para delivery de comida"
AI: [Marca hasProjectType ✅] "¿A qué industria pertenece?"
Usuario: "Alimentos y bebidas"
AI: [Marca hasIndustry ✅] "¿Cuáles son los objetivos?"
Usuario: "Aumentar ventas y fidelizar clientes"
AI: [Marca hasObjectives ✅, objectives: ["Aumentar ventas y fidelizar clientes"]] "¿Presupuesto?"
Usuario: "30 millones"
AI: [Marca hasBudget ✅] "¿En cuánto tiempo?"
Usuario: "3 meses"
AI: [Marca hasTimeline ✅, isComplete ✅] [Muestra resumen] "¿Deseas crear este proyecto?"
Usuario: "Sí"
AI: [wasConfirmed ✅] → createProjectDraft() → "¡Proyecto creado!" ✅

Banner debe mostrar: 5/5 completado (100%) 🎉
```

### Test Case 2: Usuario Impaciente (Intenta Crear Antes de Completar)
```
Usuario: "Necesito una app móvil"
AI: [hasProjectType ✅] "¿A qué industria?"
Usuario: "Créala ya"
AI: NO debe crear, debe responder:
    "⚠️ Falta información esencial: industria, objetivos, presupuesto, tiempo. 
     Dame estos datos para crear tu proyecto correctamente."
Banner debe mostrar: 1/5 completado (20%)
```

### Test Case 3: Usuario Da Objetivos en Texto Libre
```
AI: "¿Cuáles son los objetivos?"
Usuario: "Quiero que sea intuitiva, rápida y que atraiga clientes"
AI: [Debe parsear y marcar hasObjectives ✅]
    objectives: ["Quiero que sea intuitiva, rápida y que atraiga clientes"]
    "Perfecto, ¿cuál es tu presupuesto?"
Banner debe mostrar: 3/5 completado (60%) → 4/5 (80%)
```

### Test Case 4: Usuario Da Objetivos en Lista
```
AI: "¿Cuáles son los objetivos?"
Usuario: "Aumentar ventas, mejorar UX y reducir costos"
AI: [Debe parsear y marcar hasObjectives ✅]
    objectives: ["Aumentar ventas", "mejorar UX", "reducir costos"]
    "Excelente, ¿cuál es tu presupuesto?"
Banner debe mostrar: 3/5 completado (60%) → 4/5 (80%)
```

### Test Case 5: Error de Backend (Network/Timeout)
```
[Todas las 5 fases completadas, usuario confirma]
AI: [Intenta crear pero falla por timeout]
AI debe responder: 
    "Lo siento, la conexión tardó demasiado. Intentemos de nuevo en un momento."
    [NO debe marcar como creado]
    [Debe mantener la sesión con los datos]
Usuario: "Inténtalo de nuevo"
AI: [Reintenta con mismos datos] → "¡Proyecto creado!" ✅
```

---

## 📊 MÉTRICAS DE VALIDACIÓN

**Después de implementar estos cambios, debe cumplirse:**

✅ **Banner muestra 1/5 (20%)** cuando solo tiene tipo  
✅ **Banner muestra 2/5 (40%)** cuando tiene tipo + industria  
✅ **Banner muestra 3/5 (60%)** cuando tiene tipo + industria + objetivos  
✅ **Banner muestra 4/5 (80%)** cuando tiene tipo + industria + objetivos + presupuesto  
✅ **Banner muestra 5/5 (100%)** cuando tiene TODOS los datos (antes de confirmación)  
✅ **Banner se pone VERDE** con confetti cuando isComplete = true  
✅ **Banner desaparece suavemente** 2.5s después de completarse  
✅ **NO se puede crear proyecto** con menos de 5/5 completado  
✅ **NO se puede crear proyecto** sin confirmación explícita del usuario  

---

## 🎯 DECISIÓN FINAL: MANTENER 5 FASES

**Justificación:**
1. ✅ **Industria/Sector es CRÍTICA** para el match inteligente de equipos
2. ✅ **5 preguntas toman <2 minutos** en responder (no es engorroso)
3. ✅ **Mejor calidad de datos** = Mejores recomendaciones de equipos
4. ✅ **Consistencia** con el resto de la plataforma (perfil empresario también pide sector)
5. ✅ **Diferenciador de valor** vs competencia (match más preciso)

**NO recomendamos reducir a 3 o 4 fases porque:**
- ❌ Perdemos capacidad de match por sector/industria
- ❌ Proyectos incompletos en la base de datos
- ❌ Peor experiencia para equipos (proyectos poco claros)
- ❌ Menor calidad de recomendaciones

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Backend IA (Prioridad ALTA) 🔴
1. ✅ Actualizar system prompt con flujo de 5 pasos explícito
2. ✅ Agregar lógica para marcar `hasIndustry` flag
3. ✅ Mejorar parsing de `hasObjectives` (texto libre + listas)
4. ✅ Reforzar validación de 5 flags antes de crear
5. ✅ Mejorar mensajes de error específicos

**Tiempo Estimado:** 2-3 horas  
**Testing:** Con los 5 casos de prueba arriba

### Fase 2: Monitoreo (Post-Deploy)
1. ✅ Log de tracking de flags en cada mensaje
2. ✅ Log de intentos de creación rechazados (por qué flag faltaba)
3. ✅ Métricas de tiempo promedio para completar 5 fases
4. ✅ Rate de éxito de creación (con vs sin errores)

**Tiempo Estimado:** 30 minutos  
**Herramientas:** Console logs + Render logs

---

## 📝 NOTAS PARA EL EQUIPO

### Para Backend IA
- Este cambio es **100% backend** (sin cambios en frontend)
- Prioridad: **ALTA** (afecta experiencia core del producto)
- Testing necesario con los 5 casos arriba
- Deploy: **Render auto-deploy** en 2-3 minutos

### Para Frontend
- **No hay cambios necesarios** - el banner ya está listo para 5 fases
- Solo probar que el banner responda correctamente a los flags
- Verificar animación de confetti al llegar a 5/5

### Para Testing/QA
- Probar flujo completo de creación de proyecto
- Verificar que banner muestre 1/5, 2/5, 3/5, 4/5, 5/5 correctamente
- Validar que no se pueda crear con info incompleta
- Validar mensajes de error si faltan datos
- Probar con diferentes formatos de objetivos (texto libre, lista, etc.)

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] System prompt actualizado con 5 pasos explícitos
- [ ] Validación de `hasIndustry` agregada
- [ ] Parsing mejorado de `hasObjectives` (texto libre + listas)
- [ ] Validación de 5 flags obligatorias antes de crear
- [ ] Mensajes de error específicos implementados
- [ ] Logs de debugging agregados
- [ ] Commit realizado con mensaje descriptivo
- [ ] Push a main
- [ ] Render auto-deploy completado
- [ ] Testing con los 5 casos de prueba
- [ ] Verificación end-to-end con frontend
- [ ] Métricas de monitoreo revisadas

---

## 🎯 RESULTADO ESPERADO

**Después de este ajuste, el flujo será:**

```
👤 Usuario: "Necesito una app"
🤖 AI: "¿Qué tipo de proyecto?" → [1/5 - 20%]
👤 Usuario: "App móvil"
🤖 AI: "¿Qué industria?" → [2/5 - 40%]
👤 Usuario: "Alimentos"
🤖 AI: "¿Objetivos?" → [3/5 - 60%]
👤 Usuario: "Aumentar ventas"
🤖 AI: "¿Presupuesto?" → [4/5 - 80%]
👤 Usuario: "30M"
🤖 AI: "¿Tiempo?" → [5/5 - 100%] 🎉
👤 Usuario: "3 meses"
🤖 AI: [Resumen completo] "¿Crear proyecto?"
👤 Usuario: "Sí"
🤖 AI: "¡Creado! 🎉" → [Banner verde con confetti]
```

**Banner debe coincidir EXACTAMENTE con el progreso real del AI** ✅

---

## ✅ ESTADO DE IMPLEMENTACIÓN

**Commit:** `d9537db`  
**Fecha Implementación:** 2025-10-09  
**Estado:** ✅ IMPLEMENTADO Y DESPLEGADO  
**Render:** Auto-deploy en progreso (~2-3 minutos)

### Cambios Implementados

#### 1. **project-flags.js** ✅
- [x] Lógica `isComplete` actualizada para requerir 5 flags
- [x] Detección de objetivos mejorada (acepta texto libre)
- [x] Validación de industria ya existía (solo faltaba incluirla en isComplete)
- [x] Instrucciones AI actualizadas para mostrar las 5 fases

#### 2. **chat.route.js** ✅
- [x] System prompt actualizado con flujo de 5 pasos explícito
- [x] Validación en handler actualizada para las 5 flags
- [x] Mensajes de error con indicador de progreso (3/5, 4/5, etc.)
- [x] Reglas NUNCA actualizadas para mencionar las 5 fases

#### 3. **Comportamiento Esperado** ✅
- [x] Banner mostrará 1/5 cuando solo tenga tipo
- [x] Banner mostrará 2/5 cuando tenga tipo + industria
- [x] Banner mostrará 3/5 cuando tenga tipo + industria + objetivos
- [x] Banner mostrará 4/5 cuando tenga + presupuesto
- [x] Banner mostrará 5/5 cuando tenga TODOS los datos
- [x] No se puede crear proyecto sin las 5 fases completas

### Testing Pendiente
- [ ] Probar flujo completo en frontend (después de deploy)
- [ ] Verificar que banner responda a los 5 flags
- [ ] Validar que objetivos en texto libre se marcan correctamente
- [ ] Validar que industria se marca en fase 2

---

**Fecha Original:** 2025-01-09  
**Documento:** BACKEND_IA_AJUSTE_FASES_PROYECTO.md  
**Versión:** 1.1 (Implementado)  
**Estado Anterior:** 📋 LISTO PARA IMPLEMENTAR  
**Estado Actual:** ✅ IMPLEMENTADO - ESPERANDO TESTING  
**Prioridad:** 🔴 ALTA (Bug crítico de UX)  
**Tiempo Real:** ~45 minutos implementación  
**Responsable Backend IA:** AI Assistant  
**Revisión Frontend:** No requiere cambios  
**Aprobado por:** FILIPRAIDER
