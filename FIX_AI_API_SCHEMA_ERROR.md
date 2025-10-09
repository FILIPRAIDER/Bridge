# 🚨 ERROR CRÍTICO: AI API Schema Inválido

## Problema
El backend de IA (bridge-ai-api.onrender.com) está fallando con error 500 debido a un schema inválido en la función `searchTeamsIntelligent`.

## Error de OpenAI
```
Invalid schema for function 'searchTeamsIntelligent': 
In context=(), 'required' is required to be supplied and to be an array 
including every key in properties. Missing 'projectId'.
```

## Causa
El parámetro `projectId` está definido en `properties` pero **NO está en el array `required`**.

## Ubicación del Error
**Archivo**: `bridge-ai-api/src/lib/openai.js` (o similar)  
**Función**: `searchTeamsIntelligent` tool definition

## Código Actual (INCORRECTO) ❌
```javascript
{
  name: "searchTeamsIntelligent",
  description: "Busca equipos usando búsqueda inteligente con expansión de skills",
  parameters: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "ID del proyecto"
      },
      skills: {
        type: "array",
        items: { type: "string" },
        description: "Skills a buscar"
      }
    },
    required: ["skills"] // ❌ FALTA 'projectId'
  }
}
```

## Código Correcto ✅
```javascript
{
  name: "searchTeamsIntelligent",
  description: "Busca equipos usando búsqueda inteligente con expansión de skills",
  parameters: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "ID del proyecto para asociar la búsqueda"
      },
      skills: {
        type: "array",
        items: { type: "string" },
        description: "Lista de skills/tecnologías a buscar en los equipos"
      }
    },
    required: ["projectId", "skills"] // ✅ Incluir TODOS los parámetros obligatorios
  }
}
```

## Solución
**BACKEND IA debe agregar `projectId` al array `required`:**

### Opción 1: Si projectId es obligatorio
```javascript
required: ["projectId", "skills"]
```

### Opción 2: Si projectId es opcional
Remover `projectId` de `properties` o hacerlo explícitamente opcional en la descripción.

## Impacto
- ❌ Chat IA completamente roto (500 error)
- ❌ No se pueden buscar equipos
- ❌ No se pueden crear proyectos
- ❌ Experiencia de usuario completamente interrumpida

## Prioridad
🔴 **CRÍTICA** - Bloquea funcionalidad principal de la aplicación

## Testing Después del Fix
1. Probar crear nuevo proyecto en Chat IA
2. Verificar que "Busca equipos con X skills" funcione
3. Confirmar que searchTeamsIntelligent se ejecuta sin errores
4. Validar que se muestran resultados con matchedSkills

## Logs de Referencia
```
[OpenAI Error]: 400 Bad Request
POST /chat 500
Error in chat endpoint: [OpenAI] 400 Bad Request
```

## Contacto
Frontend ya implementó la UI para mostrar `matchedSkills` y `searchInfo`.  
Backend IA debe arreglar el schema para que funcione.

---
**Fecha**: 2025-10-09  
**Reportado por**: Frontend Team  
**Estado**: 🔴 PENDIENTE FIX EN BACKEND IA
