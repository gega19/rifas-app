#!/bin/bash

# Script para ejecutar migraciones en Railway
# Uso: railway run ./scripts/run-migrations.sh

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations applied successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

