# 🏥 Salud Turnos

Sistema de gestión de turnos y pacientes para centros de salud. Aplicación interna con autenticación segura mediante Supabase.

---

## 📋 Características

- ✅ **Gestión de Turnos**: Crear, editar y cancelar citas médicas
- ✅ **Gestión de Pacientes**: Registro completo de pacientes con historial
- ✅ **Gestión de Precios**: Control de tarifas y servicios
- ✅ **Autenticación Segura**: Login mediante Supabase Auth
- ✅ **Exportación de Datos**: Descargar información en CSV
- ✅ **Interfaz Responsiva**: Optimizada para desktop y móvil
- ✅ **Base de Datos Robusta**: PostgreSQL con Row Level Security (RLS)

---

## 💻 Stack Tecnológico

| Aspecto | Tecnología |
|--------|-----------|
| **Framework** | Next.js 15.3.0 (App Router) |
| **Lenguaje** | TypeScript 5 |
| **Frontend** | React 19 + Tailwind CSS 3.4 |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **UI Icons** | Lucide React |
| **Fechas** | Date-fns 3.6 |
| **Deploy** | Vercel (recomendado) |

---

## 🏗️ Estructura del Proyecto

```
salud-turnos/
├── app/                          # Rutas y vistas de Next.js
│   ├── (dashboard)/             # Rutas autenticadas (grupo de layout)
│   │   ├── appointments/        # Gestión de turnos
│   │   │   ├── [id]/edit/      # Editar turno
│   │   │   └── new/            # Crear turno
│   │   ├── patients/           # Gestión de pacientes
│   │   │   ├── [id]/           # Detalle del paciente
│   │   │   │   ├── edit/       # Editar paciente
│   │   │   │   └── PatientAppointmentsClient.tsx
│   │   │   └── new/            # Nuevo paciente
│   │   ├── prices/             # Gestión de precios
│   │   ├── layout.tsx          # Layout del dashboard
│   │   └── page.tsx            # Dashboard principal
│   ├── auth/
│   │   └── callback/           # Callback de Supabase Auth
│   ├── login/                  # Página de login
│   ├── layout.tsx              # Layout raíz
│   └── globals.css             # Estilos globales
├── components/                  # Componentes reutilizables
│   ├── LayoutShell.tsx         # Estructura del dashboard
│   ├── Sidebar.tsx             # Barra lateral
│   ├── ExportCSVButton.tsx     # Exportador de datos
│   └── ...
├── lib/                         # Utilidades
│   ├── supabase-server.ts      # Cliente Supabase (SSR)
│   ├── supabase-browser.ts     # Cliente Supabase (Cliente)
│   ├── supabase-client.ts      # Cliente Supabase genérico
│   ├── supabase.ts             # Configuración compartida
│   └── types.ts                # Tipos TypeScript
├── supabase/                    # Scripts de BD
│   ├── schema.sql              # Estructura inicial de BD
│   └── prices_table.sql        # Tabla de precios
├── middleware.ts                # Middleware de autenticación
├── next.config.js              # Configuración Next.js
├── tailwind.config.js          # Configuración Tailwind CSS
├── tsconfig.json               # Configuración TypeScript
├── package.json                # Dependencias
└── README.md                   # Este archivo
```

---

## 📋 Requisitos Previos

- **Node.js** 18.0 o superior
- **npm/yarn** o **pnpm**
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Vercel](https://vercel.com) (para deploy, opcional)

---

## 🔧 Instalación y Configuración

### 1️⃣ Crear el Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New Project**
2. Completar los datos:
   - **Nombre del proyecto**: ej. `salud-turnos`
   - **Password**: contraseña fuerte
   - **Región**: South America (o la más cercana)
3. Once creado, copiar las credenciales desde **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```

### 2️⃣ Inicializar la Base de Datos

1. En Supabase → **SQL Editor**
2. Crear una nueva query y ejecutar el contenido de `supabase/schema.sql`
3. Luego ejecutar `supabase/prices_table.sql` para la tabla de precios

> 💡 Esto creará todas las tablas necesarias: `users`, `patients`, `appointments`, `prices`, etc.

### 3️⃣ Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> ⚠️ Las variables con prefijo `NEXT_PUBLIC_` son públicas. Las credenciales mostradas aquí (URL y anon key) son seguras para exponerlas.

### 4️⃣ Desarrollo Local

```bash
# Clonar el proyecto
git clone https://github.com/TU_USUARIO/salud-turnos.git
cd salud-turnos

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🚀 Build y Deploy

### Desarrollo

```bash
npm run dev     # Servidor de desarrollo (3000)
```

### Producción

```bash
npm run build   # Compilar para producción
npm run start   # Iniciar servidor de producción
npm run lint    # Ejecutar ESLint
```

### Deploy en Vercel (Recomendado)

#### Opción A — GitHub + Vercel (Más fácil)

1. Subir a GitHub:
```bash
git init
git add .
git commit -m "chore: initial commit"
git remote add origin https://github.com/TU_USUARIO/salud-turnos.git
git push -u origin main
```

2. Ir a [vercel.com](https://vercel.com) → **Add New Project**
3. Importar repositorio de GitHub
4. En **Environment Variables** agregar:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```
5. Click en **Deploy** ✅

#### Opción B — Vercel CLI

```bash
npm i -g vercel

vercel
# Seguir las instrucciones interactivas
```

#### Configurar Dominio (Opcional)

En Vercel Dashboard → tu proyecto → **Settings → Domains** → agregar dominio personalizado.

---

## 🔐 Autenticación y Seguridad

### Row Level Security (RLS)

El proyecto usa **RLS de Supabase** para proteger datos:

- Solo **usuarios autenticados** pueden leer/escribir datos
- Cada usuario solo ve sus propios datos (según `auth.uid()`)
- Las políticas están configuradas en `supabase/schema.sql`

### Middleware de Autenticación

El archivo `middleware.ts` valida la sesión en cada request:

- Verifica token de autenticación
- Redirige usuarios no autenticados a `/login`
- Mantiene la sesión activa

---

## 📚 Scripts Disponibles

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Compilar para producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Verificar código con ESLint |

---

## 🎨 Personalización

### Tailwind CSS

Configuración en `tailwind.config.js`:
- Sistema de colores personalizado
- Tipografías: DM Sans, Sora
- Extensiones de utilidades

### Estilos Globales

`app/globals.css` contiene:
- Reseteo de estilos
- Variables CSS personalizadas
- Temas de color (light/dark)

---

## 🐛 Troubleshooting

### "Error de conexión a Supabase"
- Verificar variables de entorno en `.env.local`
- Confirmar que Supabase project está activo
- Validar URL y API key

### "No veo los datos en la BD"
- Ir a Supabase → SQL Editor
- Ejecutar nuevamente `schema.sql`
- Revisar Row Level Security (RLS) en tablas

### "Error de autenticación"
- Limpiar cookies del navegador
- Verificar que la tabla `users` existe en Supabase
- Revisar logs en Supabase → Auth → Logs

---

## 📝 Notas Importantes

- ⚠️ Este es un proyecto **interno** — no compartir credenciales de Supabase
- 🔑 Nunca commitar `.env.local` al repositorio (añadir a `.gitignore`)
- 📱 Diseño responsive — funciona en móvil, tablet y desktop
- 🌍 Interfaz en español

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crear una rama: `git checkout -b feat/nueva-feature`
2. Hacer commit: `git commit -m "feat: descripción"`
3. Push: `git push origin feat/nueva-feature`
4. Abrir Pull Request

---

## 📄 Licencia

Proyecto privado para uso interno.
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
