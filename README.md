# Bienvenido a nuestro proyecto web

Este proyecto está construido con [Next.js](https://nextjs.org), una tecnología moderna que hace que las páginas web sean rápidas y fáciles de usar.

## ¿Qué es esto?

Esta es una aplicación web que te permite [breve descripción del propósito de la aplicación]. Está diseñada para ser fácil de usar y accesible para todos.

## Para empezar a usar el proyecto (si quieres ver cómo funciona en tu computadora)

No te preocupes si no eres programador. Sigue estos pasos sencillos:

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu computadora
2. Abre una ventana de terminal o símbolo del sistema
3. Navega hasta la carpeta del proyecto
4. Ejecuta uno de estos comandos para iniciar el servidor:

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
