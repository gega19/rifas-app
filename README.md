# Rifas App - Monorepo

Sistema de gestión de rifas con arquitectura monorepo separada en tres proyectos independientes:

- **rifas-backend**: API Node.js + Express + Prisma
- **rifas-web**: Aplicación pública (formulario de registro, validación de referencias)
- **rifas-backoffice**: Panel de administración (dashboard, gestión completa)

## Estructura del Proyecto

```
rifas-app/
├── rifas-backend/      # API Backend
├── rifas-web/          # Web Pública
├── rifas-backoffice/    # Panel Admin
├── docker-compose.yml   # Configuración Docker
└── package.json         # Workspace root
```

## Requisitos Previos

- Node.js 20+
- Docker y Docker Compose
- npm o yarn

## Instalación

### 1. Instalar dependencias de todos los proyectos

```bash
npm install
```

Esto instalará las dependencias de todos los workspaces automáticamente.

### 2. Configurar variables de entorno

Cada proyecto tiene su propio `.env.example`. Copia y configura según sea necesario:

```bash
# Backend
cp rifas-backend/.env.example rifas-backend/.env

# Web (opcional, usa valores por defecto en desarrollo)
cp rifas-web/.env.example rifas-web/.env

# Backoffice (opcional, usa valores por defecto en desarrollo)
cp rifas-backoffice/.env.example rifas-backoffice/.env
```

### 3. Iniciar servicios con Docker

```bash
npm run docker:up
```

O manualmente:

```bash
docker-compose up -d
```

### 4. Configurar base de datos

```bash
# Ejecutar migraciones
npm run prisma:migrate:deploy --workspace=rifas-backend

# Poblar con datos iniciales
npm run prisma:seed --workspace=rifas-backend
```

O usar el script de restauración completo:

```bash
npm run restore
```

## Desarrollo

### Ejecutar todos los proyectos simultáneamente

```bash
npm run dev
```

Esto iniciará:
- Backend en `http://localhost:3001`
- Web pública en `http://localhost:3000`
- Backoffice en `http://localhost:3002`

### Ejecutar proyectos individualmente

```bash
# Solo backend
npm run dev:backend

# Solo web pública
npm run dev:web

# Solo backoffice
npm run dev:backoffice
```

## Puertos

- **3000**: Web pública (rifas-web)
- **3001**: Backend API (rifas-backend)
- **3002**: Backoffice Admin (rifas-backoffice)
- **5434**: PostgreSQL (base de datos)

## Scripts Disponibles

### Workspace Root

- `npm run dev` - Inicia todos los proyectos en modo desarrollo
- `npm run build` - Construye todos los proyectos
- `npm run docker:up` - Inicia servicios Docker
- `npm run docker:down` - Detiene servicios Docker
- `npm run docker:logs` - Muestra logs de Docker
- `npm run restore` - Restaura entorno completo (Docker + DB + Seed)

### Backend (rifas-backend)

- `npm run dev` - Inicia servidor en modo desarrollo
- `npm run build` - Compila TypeScript
- `npm run start` - Inicia servidor en producción
- `npm run prisma:generate` - Genera Prisma Client
- `npm run prisma:migrate` - Ejecuta migraciones (desarrollo)
- `npm run prisma:migrate:deploy` - Ejecuta migraciones (producción)
- `npm run prisma:seed` - Pobla base de datos con datos iniciales
- `npm run prisma:studio` - Abre Prisma Studio

### Web (rifas-web)

- `npm run dev` - Inicia servidor de desarrollo (puerto 3000)
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción

### Backoffice (rifas-backoffice)

- `npm run dev` - Inicia servidor de desarrollo (puerto 3002)
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción

## Credenciales por Defecto

**Admin Backoffice:**
- Usuario: `admin`
- Contraseña: `admin123`

## Estructura de Base de Datos

El backend usa Prisma ORM. El schema está en `rifas-backend/prisma/schema.prisma`.

Modelos principales:
- `Reference` - Referencias de rifa
- `Participant` - Participantes registrados
- `Ticket` - Números de rifa generados
- `AdminUser` - Usuarios administradores

## API Endpoints

### Públicos (rifas-web)

- `POST /validate-reference` - Validar número de referencia
- `POST /generate-tickets` - Generar números de rifa
- `GET /stats` - Obtener estadísticas públicas

### Admin (rifas-backoffice)

- `POST /admin/login` - Autenticación admin
- `GET /admin/me` - Obtener usuario actual
- `GET /admin/analytics/*` - Estadísticas del dashboard
- `GET|POST|PUT|DELETE /admin/references` - CRUD referencias
- `GET /admin/participants` - Gestión de participantes
- `GET /admin/tickets` - Gestión de tickets

## Docker

Los servicios están configurados en `docker-compose.yml`:

- `postgres` - Base de datos PostgreSQL
- `backend` - API Backend
- `web` - Web pública
- `backoffice` - Panel admin

## Notas de Desarrollo

- En desarrollo, tanto `rifas-web` como `rifas-backoffice` apuntan automáticamente a `http://localhost:3001` para el backend
- Los proyectos son completamente independientes y pueden desplegarse por separado
- Cada proyecto tiene sus propias dependencias y configuración

## Troubleshooting

### Error: Puerto ya en uso

Si algún puerto está ocupado, puedes cambiarlo en:
- `rifas-web/vite.config.ts` (puerto 3000)
- `rifas-backoffice/vite.config.ts` (puerto 3002)
- `rifas-backend/src/index.ts` (puerto 3001)
- `docker-compose.yml` (puertos expuestos)

### Error: Base de datos no conecta

1. Verifica que Docker esté corriendo
2. Verifica que el servicio `postgres` esté activo: `docker-compose ps`
3. Verifica la `DATABASE_URL` en `rifas-backend/.env`

### Error: Prisma Client no generado

```bash
cd rifas-backend
npm run prisma:generate
```

## Licencia

Privado - Todos los derechos reservados


