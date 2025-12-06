#!/bin/bash

# Script para restaurar el entorno completo de desarrollo
# Inicia Docker, ejecuta migraciones y seed de la base de datos

set -e

echo "🚀 Iniciando restauración del entorno..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Iniciar servicios Docker
echo "📦 Iniciando servicios Docker..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar que PostgreSQL esté saludable
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL está listo"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Intento $attempt/$max_attempts..."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Error: PostgreSQL no está respondiendo después de $max_attempts intentos"
    exit 1
fi

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones de Prisma..."
cd rifas-backend
npm run prisma:migrate:deploy || {
    echo "⚠️  Advertencia: Error al ejecutar migraciones. Intentando generar Prisma Client..."
    npm run prisma:generate
}

# Ejecutar seed
echo "🌱 Poblando base de datos con datos iniciales..."
npm run prisma:seed || {
    echo "⚠️  Advertencia: Error al ejecutar seed"
}

cd ..

# Iniciar backend
echo "🚀 Iniciando backend..."
docker-compose up -d backend

echo ""
echo "✅ Restauración completada!"
echo ""
echo "Servicios disponibles:"
echo "  - PostgreSQL: localhost:5434"
echo "  - Backend API: http://localhost:3001"
echo ""
echo "Para iniciar los frontends, ejecuta:"
echo "  npm run dev:web        # Web pública (puerto 3000)"
echo "  npm run dev:backoffice  # Backoffice (puerto 3002)"
echo ""
echo "O ejecuta todos juntos:"
echo "  npm run dev"
echo ""


