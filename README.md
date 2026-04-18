# Promocionales PGC

Sistema de gestion de promocionales para PageGroup Colombia.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Drizzle ORM + Vercel Postgres (Neon)
- NextAuth v5 (magic link via Resend)
- Zod + React Hook Form
- date-fns + Recharts + Sonner

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd promocionales-pgc
npm install
```

### 2. Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```bash
cp .env.example .env.local
```

Variables requeridas:

| Variable | Descripcion |
|---|---|
| `POSTGRES_URL` | URL de conexion a Vercel Postgres / Neon |
| `AUTH_SECRET` | Secreto para NextAuth (`openssl rand -base64 32`) |
| `AUTH_RESEND_KEY` | API key de Resend para magic links |
| `ALLOWED_EMAILS` | Emails permitidos separados por coma |

### 3. Base de datos

```bash
npm run db:push    # Aplicar schema a la DB
npm run db:seed    # Insertar datos iniciales (fuentes de fondos)
```

### 4. Iniciar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Deploy a Vercel

1. Conectar el repo a Vercel.
2. Agregar las variables de entorno en el dashboard de Vercel.
3. Vercel detecta automaticamente Next.js y configura el build.
4. Despues del primer deploy, ejecutar el seed manualmente o via Vercel CLI.

## Scripts

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run lint` | Ejecutar ESLint |
| `npm run db:generate` | Generar migraciones Drizzle |
| `npm run db:push` | Aplicar schema a la DB |
| `npm run db:studio` | Abrir Drizzle Studio |
| `npm run db:seed` | Ejecutar seed de datos iniciales |
