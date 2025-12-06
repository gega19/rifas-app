# Migración de Prisma a Supabase

Para que el backoffice funcione, necesitas crear la tabla `admin_users` en tu base de datos de Supabase.

## Opción 1: Usar Prisma con Supabase (Recomendado)

1. Actualiza tu `.env` o variables de entorno de Supabase Functions con la `DATABASE_URL` de Supabase:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
   ```

2. Ejecuta la migración de Prisma apuntando a Supabase:
   ```bash
   # Temporalmente cambia DATABASE_URL en .env a la de Supabase
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. Vuelve a cambiar DATABASE_URL a tu base de datos local si es necesario.

## Opción 2: Crear la tabla manualmente en Supabase

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_users_username_idx ON admin_users(username);
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);

-- Crear usuario admin por defecto (contraseña: admin123)
-- Necesitarás hashear la contraseña con bcrypt primero
INSERT INTO admin_users (username, email, password, role)
VALUES ('admin', 'admin@rifa.com', '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin')
ON CONFLICT (username) DO NOTHING;
```

**Nota:** El hash de la contraseña `admin123` con bcrypt es: `$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq`

Para generar un hash correcto, puedes usar:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h))"
```

## Opción 3: Usar Supabase CLI

Si tienes Supabase CLI instalado:

```bash
supabase db push
```

Esto aplicará las migraciones de Prisma a Supabase.




