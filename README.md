# Bienvenido a nuestro proyecto web

Este proyecto está construido con [Next.js](https://nextjs.org), una tecnología moderna que hace que las páginas web sean rápidas y fáciles de usar.

## ¿Qué es esto?

Esta es una aplicación web que te permite [breve descripción del propósito de la aplicación]. Está diseñada para ser fácil de usar y accesible para todos.

## Para empezar a usar el proyecto (si quieres ver cómo funciona en tu computadora)

No te preocupes si no eres programador. Sigue estos pasos sencillos:

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu computadora
2. Abre una ventana de terminal o símbolo del sistema
3. Navega hasta la carpeta del proyecto
4. Instala las dependencias necesarias para iniciar el servidor:

```bash
npm install # o puedes usar npm i
```

5. Ejecuta uno de estos comandos para iniciar el servidor:

```bash
npm run dev
# o si prefieres usar otras herramientas:
yarn dev
# o
pnpm dev
# o
bun dev
```

5. Abre tu navegador web y visita [http://localhost:3000](http://localhost:3000)

¡Listo! Ahora deberías ver la página web funcionando en tu navegador.

## ¿Qué puedo hacer con este proyecto?

Puedes explorar la página y todas sus funciones. Si quieres hacer cambios, puedes editar los archivos en la carpeta `app`, comenzando por `app/page.tsx`. La página se actualizará automáticamente cuando guardes los cambios.

## Características principales

- Diseño moderno y responsivo
- Carga rápida de páginas
- Experiencia de usuario intuitiva
- Fuentes optimizadas automáticamente con la familia tipográfica [Geist](https://vercel.com/font)

## ¿Quieres aprender más?

Si te interesa aprender sobre la tecnología detrás de esta página web:

- [Documentación de Next.js](https://nextjs.org/docs) - aprende sobre las características y API de Next.js
- [Aprende Next.js](https://nextjs.org/learn) - un tutorial interactivo para principiantes

## Arquitectura del Backend

### 🔐 Flujo de Autenticación con Supabase

El proyecto implementa un sistema de autenticación utilizando Supabase Auth:

**1. Configuración de Middleware (`middleware.ts`)**

- Intercepta todas las rutas y gestiona las sesiones automáticamente
- Utiliza `@supabase/ssr` para mantener las sesiones sincronizadas entre servidor y cliente
- Excluye archivos estáticos y optimiza el rendimiento

**2. Cliente de Supabase Server-Side (`lib/supabase/server.ts`)**

- Crea instancias del cliente de Supabase usando cookies del servidor
- Maneja la persistencia de sesiones con Next.js cookies API
- Utiliza la directiva `"use server"` para operaciones del servidor

**3. Verificación de Roles (`app/actions/auth.ts`)**

```typescript
// Verificación de usuario administrador
export async function isAdmin();
// Verificación de usuario autenticado
export async function isAuthUser();
```

**4. Protección de Rutas**

- Rutas con prefijo `(auth-users)/` requieren autenticación (login)
- Rutas con prefijo `(admin)/` requieren permisos de administrador (rol de profile)
- Cada layout verifica los permisos antes de renderizar el contenido

### ⚡ Server Components y Server Actions

**Server Components:**

- Todos los componentes en `/app/components/dashboard/` son Server Components
- Se ejecutan en el servidor y pueden acceder directamente a la base de datos
- Ejemplo: `CompetitionsGrid.tsx` obtiene datos sin API routes

**Server Actions:**

- Ubicadas en `/app/actions/` con la directiva `"use server"`
- Permiten mutaciones de datos directamente desde client components
- Utilizan `useActionState` hook para manejo de estado y formularios.
  > (Basandose en codigo de [Ramos UC Frontend](https://github.com/open-source-uc/ramos-uc-frontend))
- Ejemplo de flujo:

```typescript
// En el componente (client)
const [state, action] = useActionState(ActionLogin, initialState);

// La action se ejecuta en el servidor
("use server");
export async function ActionLogin(prevState, formData) {
  // Lógica de autenticación en el servidor
}
```

### ⏳ Suspense para Carga Asíncrona

**1. Suspense en Layouts:**

```typescript
<Suspense fallback={<p>Checking admin access...</p>}>
  <AdminChecker>{children}</AdminChecker>
</Suspense>
```

**2. Suspense en Componentes de Datos:**

```typescript
<Suspense fallback={<div>Loading teams...</div>}>
  <TeamsGrid />
</Suspense>
```

**3. Patrones de Loading:**

- **Boundaries por sección**: Cada componente que solicite datos tiene su propio Suspense
- **Loading UI descriptivo**: Mensajes específicos para cada tipo de contenido
- **Fallbacks no bloqueantes**: Los usuarios ven contenido parcial mientras carga el resto

## Contacto y soporte

Si tienes preguntas o encuentras algún problema con la página, no dudes en contactarnos a través de [información de contacto].

## ¿Quieres poner esta página en internet?

La forma más sencilla de publicar esta página web es usar [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), la plataforma de los creadores de Next.js.

Ellos hacen que publicar tu sitio web sea tan fácil como hacer unos pocos clics.

## API REST

La aplicación expone una API RESTful para consultar y gestionar datos históricos de la Major League. Todas las respuestas son en formato JSON.

### Endpoints implementsdos

- `GET    /api/teams`           — Listar equipos
- `GET    /api/teams/{id}`      — Detalle de equipo

- `GET    /api/competitions`    — Listar competiciones
- `GET    /api/competitions/{id}` — Detalle de competición

- `GET    /api/matches`         — Listar partidos
- `GET    /api/matches/{id}`    — Detalle de partido

### Ejemplo de uso

A continuación se muestra un ejemplo usando las interfaces de `lib/types.ts` y hooks de React.

#### Listar equipos (GET) con useEffect y useState
```tsx
'use client';
import { useEffect, useState } from 'react';
import type { Team } from '@/lib/types';

export function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/teams')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener equipos');
        return res.json();
      })
      .then((data: Team[]) => setTeams(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <ul>
      {teams.map(team => (
        <li key={team.id}>{team.name} ({team.major})</li>
      ))}
    </ul>
  );
}
```

**Notas:**
- Consulta los tipos de datos en `lib/types.ts`.
- Usa siempre manejo de errores (`try/catch` o `res.ok`).
- Sigue la convención REST y tipa tus respuestas.

### Visualización de ejemplo

Puedes ver un ejemplo visual de la consulta de equipos accediendo a la ruta `/ejemplo-equipos` en la aplicación. Esta página muestra los equipos en tarjetas utilizando Tailwind CSS.
