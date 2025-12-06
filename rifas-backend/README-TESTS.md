# Testing Guide - Backend Rifas

## Configuración

### 1. Instalar Dependencias

```bash
cd rifas-backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### 2. Configurar Base de Datos de Prueba

**Opción A: Usar el script automático (Recomendado)**

```bash
cd rifas-backend
./scripts/setup-test-db.sh
```

**Opción B: Manualmente**

1. Crear base de datos de prueba:
```bash
docker exec -i rifaserviceweb-postgres-1 psql -U postgres -c "CREATE DATABASE rifa_db_test;"
```

2. Ejecutar migraciones en la base de datos de prueba:
```bash
cd rifas-backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/rifa_db_test?schema=public" npm run prisma:migrate:deploy
```

3. Generar Prisma Client (si es necesario):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/rifa_db_test?schema=public" npm run prisma:generate
```

**Nota:** Los scripts de test en `package.json` ya incluyen la `DATABASE_URL` correcta, así que no necesitas crear un archivo `.env.test` a menos que quieras personalizarlo.

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar en modo watch
npm run test:watch

# Ejecutar con cobertura
npm run test:coverage
```

## Estructura de Tests

### Tests de Validadores
- `src/utils/__tests__/validators.test.ts`
- Valida formatos de email, teléfono, cédula, referencia, ticket

### Tests de Referencias
- `src/routes/admin/__tests__/references.test.ts`
- Valida creación, duplicados, bulk create, validaciones

### Tests de Tickets
- `src/routes/public/__tests__/generate-tickets.test.ts`
- Valida unicidad, no duplicados, transacciones

### Tests de Validación de Referencias
- `src/routes/public/__tests__/validate-reference.test.ts`
- Valida formato, existencia, estado de uso

### Tests de Integración
- `src/__tests__/integration/reference-ticket-flow.test.ts`
- Flujo completo: crear → validar → generar → verificar

### Tests de Race Conditions
- `src/routes/admin/__tests__/references-race-conditions.test.ts`
- Validación de concurrencia y prevención de duplicados

## Casos Críticos Validados

### Referencias
- ✅ Constraint único en base de datos funciona
- ✅ Validación de formato antes de insertar
- ✅ Bulk create maneja duplicados correctamente
- ✅ Race conditions no permiten duplicados

### Tickets
- ✅ Números generados son únicos (0000-9999)
- ✅ No se asignan números ya usados
- ✅ No se duplican números en mismo batch
- ✅ Transacción asegura atomicidad
- ✅ Límite de 10000 tickets se respeta

### Flujo Completo
- ✅ Referencia → Validación → Generación → Marcado como usado
- ✅ Referencia usada no puede generar más tickets
- ✅ Participante se crea correctamente con tickets

## Notas Importantes

1. **Base de Datos**: Los tests limpian la base de datos antes y después de cada test
2. **Autenticación**: Se crea un admin de prueba para cada suite de tests
3. **Rate Limiting**: Se mockea para permitir múltiples requests en tests
4. **Prisma**: Se usa `testPrisma` en lugar de `prisma` para aislar los tests

## Troubleshooting

### Error: Cannot find module 'jest'
```bash
npm install --save-dev jest @types/jest ts-jest
```

### Error: Database connection
- Verifica que PostgreSQL esté corriendo
- Verifica que la base de datos de prueba exista
- Verifica DATABASE_URL en `.env.test`

### Error: Prisma Client not generated
```bash
npm run prisma:generate
```

