# Error de Base de Datos - phoneE164 y phoneCountry

## 🔴 Problema
```
Invalid `prisma.memberProfile.update()` invocation:
The column `MemberProfile.phoneE164` does not exist in the current database.
```

## 📋 Causa
Los campos `phoneE164` y `phoneCountry` están definidos en el schema de Prisma pero **no existen físicamente en la base de datos**. Esto sucede cuando:
1. Se actualiza el schema.prisma
2. Pero NO se ejecuta una migración de Prisma para aplicar los cambios a la BD

## ✅ Solución

### Opción 1: Migración de Prisma (RECOMENDADA)
Si tu backend usa Prisma, navega al directorio del backend y ejecuta:

```bash
cd [ruta-al-backend]
npx prisma migrate dev --name add_phone_e164_and_country
```

Este comando:
1. Detecta los cambios en el schema
2. Genera un archivo de migración SQL
3. Aplica la migración a la base de datos
4. Actualiza el Prisma Client

### Opción 2: SQL Manual
Si no puedes usar Prisma CLI, ejecuta el archivo SQL que generé:

**Archivo:** `ADD_PHONE_FIELDS_MIGRATION.sql`

Puedes ejecutarlo de estas formas:

#### A) Con psql (PostgreSQL CLI)
```bash
psql -d [nombre_base_datos] -f ADD_PHONE_FIELDS_MIGRATION.sql
```

#### B) Con Prisma Studio
```bash
cd [ruta-al-backend]
npx prisma studio
```
Luego usa la consola SQL en Prisma Studio.

#### C) Directamente en PostgreSQL
Conecta a tu base de datos con tu cliente preferido (pgAdmin, DBeaver, etc.) y ejecuta el SQL del archivo.

### Opción 3: Reset de Base de Datos (SOLO DESARROLLO)
⚠️ **ADVERTENCIA:** Esto borra TODOS los datos

```bash
cd [ruta-al-backend]
npx prisma migrate reset --force
```

## 🔍 Verificación

Después de ejecutar la migración, verifica que las columnas existan:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'MemberProfile' 
AND column_name IN ('phoneE164', 'phoneCountry');
```

Deberías ver:
```
column_name   | data_type
--------------+-----------
phoneE164     | text
phoneCountry  | text
```

## 📝 Campos Agregados

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `phoneE164` | String? | Número en formato E.164 | `+573001234567` |
| `phoneCountry` | String? | Código país ISO-3166 alpha-2 | `CO`, `US`, `MX` |

## 🚀 Después de la Migración

1. **Reinicia el servidor backend** para que Prisma Client reconozca los nuevos campos
2. **Prueba el registro nuevamente** - ahora debería funcionar sin el error 500
3. Los campos son opcionales, así que no romperá datos existentes

## 📚 Contexto del Código

El frontend ya está preparado para enviar estos campos en:
- `ProfileStep.tsx` (registro)
- `ProfileEditor.tsx` (dashboard)

Ambos usan `libphonenumber-js` para parsear teléfonos y extraer:
- `phoneE164`: Formato internacional completo
- `phoneCountry`: Código de país de 2 letras

## 🔗 Referencias
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [E.164 Format](https://en.wikipedia.org/wiki/E.164)
- [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
