# ✅ TESTING CHECKLIST: Sistema de 5 Fases Implementado

**Fecha:** 2025-10-09  
**Backend Commit:** `d9537db` ✅ DESPLEGADO  
**Frontend Commit:** `c7c6ab1` ✅ DESPLEGADO  
**Estado:** ⏳ ESPERANDO TESTING

---

## 📋 CAMBIOS IMPLEMENTADOS (Backend IA)

### ✅ Completados:
1. [x] System prompt actualizado con 5 pasos explícitos
2. [x] Validación de `isComplete` requiere 5 flags
3. [x] Detección de objetivos mejorada (texto libre)
4. [x] Industria incluida en validación
5. [x] Mensajes de error con progreso
6. [x] Deploy a Render completado

### ⏳ Pendientes:
- [ ] Testing end-to-end completo
- [ ] Validación de que banner responde correctamente
- [ ] Verificación de persistencia con localStorage

---

## 🧪 TESTING END-TO-END

### **Test Case 1: Flujo Completo Exitoso** (PRIORIDAD ALTA 🔴)

**Objetivo:** Verificar que las 5 fases funcionan correctamente

**Pasos:**
1. Ir al dashboard empresario
2. Abrir chat IA
3. Decir: "Necesito una app"
4. **Validar:**
   - ✅ AI pregunta: "¿Qué tipo de proyecto necesitas desarrollar?"
   - ✅ Banner NO aparece aún (0/5)

5. Responder: "App móvil para delivery de comida"
6. **Validar:**
   - ✅ AI pregunta: "¿A qué industria o sector pertenece tu negocio?"
   - ✅ Banner aparece: **1/5 (20%)** 🎯
   - ✅ Badge "Tipo" con checkmark verde

7. Responder: "Alimentos y bebidas"
8. **Validar:**
   - ✅ AI pregunta: "¿Cuáles son los objetivos principales?"
   - ✅ Banner actualiza: **2/5 (40%)** 🏢
   - ✅ Badge "Industria/Sector" con checkmark verde

9. Responder: "Aumentar ventas y fidelizar clientes"
10. **Validar:**
    - ✅ AI pregunta: "¿Cuál es tu presupuesto aproximado?"
    - ✅ Banner actualiza: **3/5 (60%)** 🎯
    - ✅ Badge "Objetivos" con checkmark verde

11. Responder: "30 millones de pesos"
12. **Validar:**
    - ✅ AI pregunta: "¿En cuánto tiempo necesitas tenerlo listo?"
    - ✅ Banner actualiza: **4/5 (80%)** 💰
    - ✅ Badge "Presupuesto" con checkmark verde

13. Responder: "3 meses"
14. **Validar:**
    - ✅ Banner actualiza: **5/5 (100%)** ⏱️
    - ✅ Badge "Tiempo" con checkmark verde
    - ✅ Banner se pone **VERDE** con confetti 🎉
    - ✅ AI muestra resumen completo:
      ```
      Perfecto, vamos a crear tu proyecto con estos datos:
      • Tipo: App móvil para delivery de comida
      • Sector: Alimentos y bebidas
      • Objetivos: Aumentar ventas y fidelizar clientes
      • Presupuesto: 30 millones de pesos
      • Tiempo: 3 meses
      
      ¿Deseas que cree el proyecto con esta información?
      ```

15. Responder: "Sí, créalo"
16. **Validar:**
    - ✅ AI crea el proyecto exitosamente
    - ✅ Mensaje: "¡Tu proyecto 'App móvil para delivery de comida' ha sido creado exitosamente! 🎉"
    - ✅ Banner celebra por 2.5 segundos
    - ✅ Banner desaparece con animación suave
    - ✅ localStorage limpiado (`chatProjectProgress` = null)

17. Ir a `/dashboard/empresario/proyectos`
18. **Validar:**
    - ✅ Proyecto aparece en la lista
    - ✅ Título correcto
    - ✅ Estado: "Abierto"
    - ✅ Ciudad/área si están disponibles

**Resultado Esperado:** ✅ TODAS las validaciones pasan

---

### **Test Case 2: Usuario Impaciente** (PRIORIDAD ALTA 🔴)

**Objetivo:** Verificar que NO se puede crear sin completar las 5 fases

**Pasos:**
1. Iniciar conversación: "Necesito una app móvil"
2. **Validar:** Banner: 1/5 (20%)
3. AI pregunta industria
4. **SIN RESPONDER**, decir: "Créala ya"
5. **Validar:**
   - ✅ AI NO crea el proyecto
   - ✅ AI responde algo como:
     ```
     ⚠️ Falta información esencial: industria, objetivos, presupuesto, tiempo.
     Dame estos datos para crear tu proyecto correctamente.
     ```
   - ✅ Banner sigue en 1/5 (20%)
   - ✅ AI vuelve a preguntar por industria

**Resultado Esperado:** ✅ Sistema rechaza creación sin info completa

---

### **Test Case 3: Objetivos en Texto Libre** (PRIORIDAD MEDIA 🟡)

**Objetivo:** Verificar que objetivos como texto libre se marcan correctamente

**Pasos:**
1. Llegar a fase de objetivos (banner: 2/5)
2. AI pregunta: "¿Cuáles son los objetivos?"
3. Responder (texto libre): "Quiero que sea intuitiva, rápida y que atraiga clientes"
4. **Validar:**
   - ✅ Flag `hasObjectives` se marca
   - ✅ Banner actualiza: **3/5 (60%)**
   - ✅ Badge "Objetivos" con checkmark verde
   - ✅ AI continúa con presupuesto

**Resultado Esperado:** ✅ Texto libre se acepta como objetivo

---

### **Test Case 4: Objetivos en Lista** (PRIORIDAD MEDIA 🟡)

**Objetivo:** Verificar que objetivos en lista se parsean correctamente

**Pasos:**
1. Llegar a fase de objetivos (banner: 2/5)
2. AI pregunta: "¿Cuáles son los objetivos?"
3. Responder (lista): "Aumentar ventas, mejorar UX y reducir costos"
4. **Validar:**
   - ✅ Flag `hasObjectives` se marca
   - ✅ Banner actualiza: **3/5 (60%)**
   - ✅ Objetivos parseados como array de 3 elementos
   - ✅ AI continúa con presupuesto

**Resultado Esperado:** ✅ Lista se parsea como array

---

### **Test Case 5: Persistencia al Navegar** (PRIORIDAD ALTA 🔴)

**Objetivo:** Verificar que banner persiste al cambiar de vista

**Pasos:**
1. Llegar a 3/5 completado (tipo + industria + objetivos)
2. **Validar:** Banner: 3/5 (60%)
3. Navegar a `/dashboard/empresario/proyectos`
4. Esperar 2 segundos
5. Regresar al chat
6. **Validar:**
   - ✅ Banner reaparece automáticamente
   - ✅ Muestra 3/5 (60%)
   - ✅ 3 badges con checkmark verde
   - ✅ Conversación continúa donde quedó
   - ✅ localStorage tiene los datos: `localStorage.getItem('chatProjectProgress')`

7. Continuar con presupuesto y timeline
8. Completar proyecto (5/5)
9. Confirmar creación
10. Esperar celebración (3 segundos)
11. **Validar:**
    - ✅ Banner desaparece
    - ✅ localStorage limpiado: `localStorage.getItem('chatProjectProgress')` = null

**Resultado Esperado:** ✅ Persistencia funciona correctamente

---

### **Test Case 6: Limpieza Manual del Chat** (PRIORIDAD BAJA 🟢)

**Objetivo:** Verificar que limpiar chat elimina progreso

**Pasos:**
1. Llegar a 4/5 completado
2. **Validar:** Banner: 4/5 (80%)
3. Click en botón 🗑️ "Limpiar chat"
4. **Validar:**
   - ✅ Banner desaparece inmediatamente
   - ✅ Mensajes borrados
   - ✅ localStorage limpiado: `chatSessionId` y `chatProjectProgress` = null
   - ✅ Chat muestra pantalla de inicio
   - ✅ Conversación reinicia desde cero

**Resultado Esperado:** ✅ Limpieza completa funciona

---

### **Test Case 7: Recarga de Página (F5)** (PRIORIDAD MEDIA 🟡)

**Objetivo:** Verificar que banner persiste al recargar

**Pasos:**
1. Llegar a 2/5 completado (tipo + industria)
2. **Validar:** Banner: 2/5 (40%)
3. Presionar F5 (reload)
4. Esperar que cargue
5. **Validar:**
   - ✅ Banner reaparece con 2/5 (40%)
   - ✅ Conversación se restaura desde backend
   - ✅ localStorage tiene los datos

**Resultado Esperado:** ✅ Recarga no pierde progreso

---

## 📊 MÉTRICAS DE VALIDACIÓN

**Después del testing, debe cumplirse:**

### Banner de Progreso
- [ ] Banner muestra 0/5 al inicio (no aparece)
- [ ] Banner muestra 1/5 (20%) después de tipo
- [ ] Banner muestra 2/5 (40%) después de industria
- [ ] Banner muestra 3/5 (60%) después de objetivos
- [ ] Banner muestra 4/5 (80%) después de presupuesto
- [ ] Banner muestra 5/5 (100%) después de timeline
- [ ] Banner se pone VERDE con confetti al completar
- [ ] Banner desaparece 2.5s después de completar

### Validaciones de Seguridad
- [ ] NO se puede crear con menos de 5/5
- [ ] NO se puede crear sin confirmación explícita
- [ ] Mensajes de error claros si falta info
- [ ] Sistema indica qué falta (ej: "Falta: industria, presupuesto")

### Persistencia
- [ ] Banner persiste al navegar entre vistas
- [ ] Banner persiste al recargar página (F5)
- [ ] Banner se limpia al completar proyecto
- [ ] Banner se limpia al limpiar chat manualmente
- [ ] localStorage sincronizado correctamente

### Parsing de Datos
- [ ] Objetivos en texto libre se aceptan
- [ ] Objetivos en lista se parsean como array
- [ ] Industria se detecta correctamente
- [ ] Todos los datos se guardan en formato correcto

---

## 🐛 BUGS POSIBLES A REVISAR

### Si Banner No Aparece:
1. Abrir DevTools (F12) → Console
2. Buscar logs: `[ChatIA]`
3. Verificar que flags se actualizan:
   ```javascript
   localStorage.getItem('chatProjectProgress')
   ```
4. Si es null, problema en backend (flags no se envían)
5. Si tiene datos, problema en frontend (banner no renderiza)

### Si Banner Muestra Número Incorrecto:
1. Console → buscar: `✅ Flags actualizados`
2. Verificar cuántos flags son `true`
3. Comparar con número del banner
4. Si no coinciden, problema en lógica de conteo

### Si Banner Desaparece al Navegar:
1. Console → buscar: `📊 Progreso del proyecto restaurado`
2. Si NO aparece, problema en useEffect de restauración
3. Verificar que localStorage tiene datos antes de navegar
4. Si localStorage está vacío, problema en guardado

### Si No Se Puede Crear Proyecto:
1. Console → buscar: `❌ Intento de crear proyecto`
2. Ver mensaje de error específico
3. Ver qué flags faltan: `missingFields: [...]`
4. Verificar que AI preguntó por esos campos

---

## 🎯 CRITERIOS DE ÉXITO

**Para considerar el testing EXITOSO:**

### Obligatorios (❌ = Blocker)
- [ ] ✅ Flujo completo de 5 fases funciona
- [ ] ✅ Banner muestra progreso correcto (1/5 → 5/5)
- [ ] ✅ Banner persiste al navegar
- [ ] ✅ No se puede crear sin 5/5 completado
- [ ] ✅ Proyecto se crea correctamente al confirmar
- [ ] ✅ Proyecto aparece en lista

### Importantes (⚠️ = Fix recomendado)
- [ ] ✅ Objetivos en texto libre se aceptan
- [ ] ✅ Banner se limpia al completar proyecto
- [ ] ✅ Banner persiste al recargar (F5)
- [ ] ✅ Mensajes de error son claros

### Opcionales (ℹ️ = Nice to have)
- [ ] ✅ Animación de confetti funciona
- [ ] ✅ Animación verde es suave
- [ ] ✅ Limpieza manual funciona
- [ ] ✅ Logs en console son útiles

---

## 📝 REPORTE DE BUGS (Template)

**Si encuentras un bug, documéntalo así:**

```
### Bug #[número]

**Título:** [Descripción corta del problema]

**Severidad:** 🔴 Crítico | 🟡 Importante | 🟢 Menor

**Pasos para Reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Actual:**
[Qué pasa]

**Resultado Esperado:**
[Qué debería pasar]

**Screenshots/Logs:**
[Capturas o logs de console]

**Console Logs:**
```
[Pegar logs relevantes aquí]
```

**localStorage:**
```javascript
{
  "chatSessionId": "...",
  "chatProjectProgress": { ... }
}
```

**Ambiente:**
- Navegador: [Chrome/Firefox/Safari/Edge]
- Versión: [Versión del navegador]
- OS: [Windows/Mac/Linux]
- URL: [URL exacta donde ocurrió]
```

---

## 🚀 PLAN DE TESTING

### Fase 1: Testing Individual (1 persona - 30 minutos)
1. [ ] Test Case 1: Flujo completo
2. [ ] Test Case 2: Usuario impaciente
3. [ ] Test Case 5: Persistencia al navegar

**Si falla alguno:** Documentar bug y detener testing

### Fase 2: Testing Completo (1 persona - 45 minutos)
1. [ ] Test Case 3: Objetivos texto libre
2. [ ] Test Case 4: Objetivos en lista
3. [ ] Test Case 6: Limpieza manual
4. [ ] Test Case 7: Recarga F5

**Si todo pasa:** Proceder a Fase 3

### Fase 3: Testing de Regresión (1 persona - 20 minutos)
1. [ ] Crear 3 proyectos diferentes
2. [ ] Verificar que todos aparecen en lista
3. [ ] Abrir modal de detalles de cada uno
4. [ ] Verificar que datos son correctos

**Si todo pasa:** ✅ APROBADO PARA PRODUCCIÓN

---

## ✅ CHECKLIST FINAL

### Backend IA
- [x] System prompt actualizado
- [x] Validación de 5 flags implementada
- [x] Parsing de objetivos mejorado
- [x] Industria incluida en isComplete
- [x] Mensajes de error específicos
- [x] Deploy a Render completado
- [ ] Testing end-to-end validado

### Frontend
- [x] Banner con 5 fases implementado
- [x] Persistencia en localStorage
- [x] Animación verde con confetti
- [x] Modal de detalles de proyectos
- [x] Build exitoso
- [x] Deploy a Vercel completado
- [ ] Testing end-to-end validado

### Integración
- [ ] Flujo completo probado
- [ ] Banner responde a flags correctamente
- [ ] Persistencia funciona
- [ ] Proyectos se crean correctamente
- [ ] Proyectos aparecen en lista
- [ ] Modal muestra info completa
- [ ] Sin errores de consola

---

## 📞 CONTACTOS

**Si encuentras problemas:**

**Backend IA:**
- Responsable: [Equipo Backend IA]
- Commit: `d9537db`
- Archivos: `project-flags.js`, `chat.route.js`

**Frontend:**
- Responsable: AI Assistant + FILIPRAIDER
- Commit: `c7c6ab1`
- Archivos: `ChatIA.tsx`, `ProjectProgressBanner.tsx`, `proyectos/page.tsx`

---

**Fecha de Creación:** 2025-10-09  
**Estado:** 📋 LISTO PARA TESTING  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo Estimado:** 1-2 horas de testing completo  
**Responsable Testing:** [Por asignar]  
**Deadline:** [Por definir]
