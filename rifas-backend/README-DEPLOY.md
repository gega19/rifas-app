# 🚀 Guía de Despliegue del Backend

Esta guía te ayudará a desplegar el backend de la aplicación de rifas en **Vercel** o **Railway** usando GitHub.

---

## 📋 Prerrequisitos

- ✅ Cuenta en [GitHub](https://github.com)
- ✅ Cuenta en [Vercel](https://vercel.com) o [Railway](https://railway.app)
- ✅ Base de datos PostgreSQL (puedes crear una en Railway, Supabase, Neon, etc.)
- ✅ Código del proyecto subido a GitHub

---

## 🎯 Opción 1: Despliegue en Vercel (Recomendado para Serverless)

### Paso 1: Preparar el repositorio en GitHub

1. **Asegúrate de que tu código esté en GitHub:**
   ```bash
   # Si aún no tienes el repositorio
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

### Paso 2: Crear base de datos PostgreSQL

**Opción A: Usar Supabase (Recomendado - Gratis)**
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Ve a **Settings** → **Database**
4. Copia la **Connection String** (URI) que se ve así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

**Opción B: Usar Neon (Gratis)**
1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta y un nuevo proyecto
3. Copia la **Connection String**

**Opción C: Usar Railway PostgreSQL**
1. Crea un proyecto en Railway
2. Agrega un servicio PostgreSQL
3. Copia la `DATABASE_URL` que Railway genera automáticamente

### Paso 3: Conectar repositorio a Vercel

1. **Inicia sesión en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub

2. **Importar proyecto:**
   - Click en **"Add New..."** → **"Project"**
   - Selecciona tu repositorio de GitHub
   - Si no aparece, click en **"Adjust GitHub App Permissions"** y autoriza el acceso

3. **Configurar el proyecto:**
   - **Framework Preset:** Otros (o deja en blanco)
   - **Root Directory:** `rifas-backend` ⚠️ **IMPORTANTE**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Paso 4: Configurar variables de entorno en Vercel

1. En la página de configuración del proyecto, ve a **"Environment Variables"**
2. Agrega las siguientes variables:

   | Variable | Valor | Descripción |
   |----------|-------|-------------|
   | `DATABASE_URL` | `postgresql://...` | URL de tu base de datos PostgreSQL |
   | `NODE_ENV` | `production` | Ambiente de producción |
   | `WEB_URL` | `https://tu-frontend.vercel.app` | URL del frontend público (opcional) |
   | `BACKOFFICE_URL` | `https://tu-backoffice.vercel.app` | URL del backoffice (opcional) |

3. Click en **"Save"**

### Paso 5: Desplegar

1. Click en **"Deploy"**
2. Vercel comenzará a construir y desplegar tu proyecto
3. Espera a que termine el proceso (puede tardar 2-5 minutos)

### Paso 6: Aplicar migraciones de Prisma

Después del primer despliegue, necesitas aplicar las migraciones a la base de datos:

**Opción A: Desde tu máquina local**
```bash
# Obtener las variables de entorno de Vercel
vercel env pull .env.production

# Aplicar migraciones
npx prisma migrate deploy
```

**Opción B: Desde Vercel CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer login
vercel login

# Linkear el proyecto
cd rifas-backend
vercel link

# Ejecutar migraciones
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npx prisma migrate deploy
```

**Opción C: Manualmente con la URL de la base de datos**
```bash
DATABASE_URL="postgresql://user:password@host:port/database?schema=public" npx prisma migrate deploy
```

### Paso 7: Verificar el despliegue

1. Vercel te dará una URL como: `https://tu-proyecto.vercel.app`
2. Prueba el endpoint de health check:
   ```bash
   curl https://tu-proyecto.vercel.app/health
   ```
   Debería responder: `{"status":"ok"}`

3. Prueba un endpoint público:
   ```bash
   curl -X POST https://tu-proyecto.vercel.app/validate-reference \
     -H "Content-Type: application/json" \
     -d '{"reference":"123456"}'
   ```

### ✅ ¡Listo! Tu backend está desplegado en Vercel

---

## 🚂 Opción 2: Despliegue en Railway (Recomendado para Apps Tradicionales)

### Paso 1: Preparar el repositorio en GitHub

(Sigue los mismos pasos que en Vercel - Paso 1)

### Paso 2: Crear proyecto en Railway

1. **Inicia sesión en Railway:**
   - Ve a [railway.app](https://railway.app)
   - Inicia sesión con tu cuenta de GitHub

2. **Crear nuevo proyecto:**
   - Click en **"New Project"**
   - Selecciona **"Deploy from GitHub repo"**
   - Selecciona tu repositorio

### Paso 3: Agregar base de datos PostgreSQL

1. En tu proyecto de Railway, click en **"New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente una base de datos PostgreSQL
4. La `DATABASE_URL` se configurará automáticamente como variable de entorno

### Paso 4: Agregar servicio del backend

1. En el mismo proyecto, click en **"New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona tu repositorio nuevamente
4. Railway detectará automáticamente que es un proyecto Node.js

### Paso 5: Configurar el servicio del backend

1. Click en el servicio del backend
2. Ve a la pestaña **"Settings"**
3. Configura:
   - **Root Directory:** `rifas-backend` ⚠️ **IMPORTANTE**
   - **Build Command:** `npm run build` (o déjalo automático)
   - **Start Command:** `npm start` (o déjalo automático)

### Paso 6: Configurar variables de entorno

1. En el servicio del backend, ve a la pestaña **"Variables"**
2. Railway ya habrá agregado `DATABASE_URL` automáticamente
3. Agrega manualmente:
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (opcional, Railway lo asigna automáticamente)
   - `WEB_URL` = `https://tu-frontend.vercel.app` (opcional)
   - `BACKOFFICE_URL` = `https://tu-backoffice.vercel.app` (opcional)

### Paso 7: Configurar migraciones automáticas (Opcional)

Para que Railway ejecute las migraciones automáticamente en cada despliegue:

1. Actualiza el script `build` en `package.json`:
   ```json
   {
     "scripts": {
       "build": "tsc && npm run prisma:generate && npm run prisma:migrate:deploy"
     }
   }
   ```

   O ejecuta las migraciones manualmente una vez:
   ```bash
   # Instalar Railway CLI
   npm i -g @railway/cli

   # Hacer login
   railway login

   # Linkear el proyecto
   railway link

   # Ejecutar migraciones
   railway run npx prisma migrate deploy
   ```

### Paso 8: Desplegar

1. Railway comenzará a construir y desplegar automáticamente
2. Espera a que termine el proceso
3. Railway generará una URL pública automáticamente

### Paso 9: Configurar dominio personalizado (Opcional)

1. En el servicio del backend, ve a **"Settings"** → **"Networking"**
2. Click en **"Generate Domain"** para obtener una URL pública
3. O configura un dominio personalizado

### Paso 10: Verificar el despliegue

1. Prueba el endpoint de health check:
   ```bash
   curl https://tu-proyecto.railway.app/health
   ```
   Debería responder: `{"status":"ok"}`

### ✅ ¡Listo! Tu backend está desplegado en Railway

---

## 🔧 Troubleshooting

### Error: "Prisma Client not generated"
**Solución:** Asegúrate de que el script `build` incluya `npm run prisma:generate`

### Error: "Migration not applied"
**Solución:** Ejecuta manualmente:
```bash
DATABASE_URL="tu-database-url" npx prisma migrate deploy
```

### Error: "CORS policy blocked"
**Solución:** Verifica que las variables `WEB_URL` y `BACKOFFICE_URL` estén configuradas correctamente en producción

### Error: "Database connection timeout"
**Solución:** 
- Verifica que la `DATABASE_URL` sea correcta
- Si usas Supabase/Neon, habilita "Connection Pooling"
- Verifica que la base de datos permita conexiones desde la IP de Vercel/Railway

### Error: "Root Directory not found"
**Solución:** Asegúrate de configurar `Root Directory: rifas-backend` en la configuración del proyecto

---

## 📝 Resumen de URLs importantes

Después del despliegue, tendrás:

- **Backend URL:** `https://tu-backend.vercel.app` o `https://tu-backend.railway.app`
- **Health Check:** `https://tu-backend.vercel.app/health`
- **API Base:** `https://tu-backend.vercel.app/api` (si usas prefijo)

---

## 🎉 Siguiente Paso

Una vez que el backend esté desplegado, actualiza las variables de entorno en tus frontends (rifas-web y rifas-backoffice) para que apunten a la URL del backend de producción.

---

¿Necesitas ayuda con algo más? ¡Déjame saber!

