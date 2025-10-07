-- Migration: Update existing team leaders to LIDER role (PARTE 2)
-- Date: 2025-10-06
-- Description: Updates users who are team leaders from ESTUDIANTE to LIDER
-- IMPORTANTE: Ejecutar DESPUÉS de haber aplicado la migración 20251006_add_lider_role

-- Step 2: Actualizar usuarios existentes que son líderes de equipos
UPDATE "User" u
SET role = 'LIDER'
WHERE u.role = 'ESTUDIANTE' 
AND EXISTS (
  SELECT 1 FROM "TeamMember" tm 
  WHERE tm."userId" = u.id 
  AND tm.role = 'LIDER'
);
