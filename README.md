# 🏥 Salud Turnos

Sistema de gestión de turnos para centros de salud. Uso exclusivamente interno del personal.

---

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS (tipografías DM Sans + Sora)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel (recomendado)

---

## 🚀 Pasos para el deploy

### 1. Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Elegir nombre, contraseña y región (ej: South America)
3. Una vez creado, ir a **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
4. Copiar las credenciales desde **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ La autenticación por defecto usa RLS: solo usuarios autenticados pueden acceder.
> Si la app es completamente interna y sin login, podés temporalmente deshabilitar RLS en Supabase (Table Editor → cada tabla → RLS off). Para producción se recomienda configurar Supabase Auth.

---

### 2. Desarrollo local

```bash
# Clonar el proyecto
git clone https://github.com/TU_USUARIO/salud-turnos.git
cd salud-turnos

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000
```

---

### 3. Deploy en Vercel (recomendado)

#### Opción A — Deploy desde GitHub (más fácil)

1. Subir el proyecto a GitHub:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/TU_USUARIO/salud-turnos.git
git push -u origin main
```

2. Ir a [vercel.com](https://vercel.com) → **Add New Project**
3. Importar el repositorio de GitHub
4. En **Environment Variables** agregar:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Click en **Deploy** ✅

#### Opción B — Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deployar
vercel

# Agregar las variables de entorno cuando las pida,
# o configurarlas después en el dashboard de Vercel
```

---

### 4. (Opcional) Dominio personalizado

En Vercel → tu proyecto → **Settings → Domains** → agregar tu dominio.

---

## 📁 Estructura del proyecto

```
salud-turnos/
├── app/
│   ├── layout.tsx              # Layout principal con sidebar
│   ├── page.tsx                # Dashboard
│   ├── globals.css
│   ├── patients/
│   │   ├── page.tsx            # Lista de pacientes
│   │   ├── new/page.tsx        # Crear paciente
│   │   └── [id]/
│   │       ├── page.tsx        # Detalle del paciente
│   │       ├── edit/page.tsx   # Editar paciente
│   │       └── DeletePatientButton.tsx
│   └── appointments/
│       ├── page.tsx            # Lista de turnos
│       ├── new/page.tsx        # Crear turno (con selector de horarios)
│       └── [id]/edit/page.tsx  # Editar / reprogramar turno
├── components/
│   └── Sidebar.tsx             # Navegación lateral colapsable
├── lib/
│   ├── supabase.ts             # Cliente Supabase + helpers CRUD
│   └── types.ts                # TypeScript types
└── supabase/
    └── schema.sql              # Schema completo de la base de datos
```

---

## 🔐 Agregar autenticación (recomendado para producción)

Si querés proteger la app con login:

1. Activar **Email Auth** en Supabase → Authentication → Providers
2. Instalar `@supabase/ssr`
3. Crear un middleware en `middleware.ts` que redirija a `/login` si no hay sesión
4. Crear página `/login` con email + contraseña

Supabase tiene [guía oficial para Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs).

---

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase |
