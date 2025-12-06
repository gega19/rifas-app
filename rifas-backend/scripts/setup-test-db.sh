#!/bin/bash

# Script para configurar la base de datos de prueba

set -e

echo "🔧 Configurando base de datos de prueba..."

# Verificar que Docker esté corriendo
if ! docker ps | grep -q postgres; then
    echo "❌ Error: PostgreSQL no está corriendo en Docker"
    echo "   Ejecuta: docker-compose up -d postgres"
    exit 1
fi

# Crear base de datos de prueba si no existe
echo "📦 Creando base de datos rifa_db_test..."
docker exec -i rifaserviceweb-postgres-1 psql -U postgres -c "CREATE DATABASE rifa_db_test;" 2>&1 | grep -v "already exists" || echo "   Base de datos ya existe"

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones en base de datos de prueba..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/rifa_db_test?schema=public" npm run prisma:migrate:deploy

# Generar Prisma Client
echo "⚙️  Generando Prisma Client..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/rifa_db_test?schema=public" npm run prisma:generate || echo "   ⚠️  Error al generar (puede requerir permisos)"

echo ""
echo "✅ Base de datos de prueba configurada!"
echo ""
echo "Para ejecutar tests:"
echo "  npm test"
echo ""

