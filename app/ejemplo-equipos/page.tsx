'use client';
import { useEffect, useState } from 'react';
import type { Team } from '@/lib/types';

export default function EjemploEquiposPage() {
  const [equipos, setEquipos] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/teams')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener equipos');
        return res.json();
      })
      .then((data: Team[]) => setEquipos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-5xl mx-auto py-10 px-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-300">Equipos</h1>
      {loading && (
        <div className="flex justify-center items-center h-40">
          <span className="text-lg text-gray-400 animate-pulse">Cargando...</span>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-40">
          <span className="text-red-400 font-semibold">Error: {error}</span>
        </div>
      )}
      {!loading && !error && (
        <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {equipos.map(equipo => (
            <div
              key={equipo.id}
              className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-start border border-gray-700 hover:border-blue-500 transition-colors group"
            >
              <span className="text-xs text-gray-500 mb-2">ID: {equipo.id}</span>
              <h2 className="text-xl font-semibold text-blue-200 group-hover:text-blue-400 mb-1 truncate w-full">{equipo.name}</h2>
              <p className="text-sm text-gray-300 mb-2">Carrera: <span className="font-medium text-blue-100">{equipo.major}</span></p>
              <p className="text-sm text-gray-400">Capitán: <span className="text-gray-200">{equipo.captain_id ?? <span className="text-gray-500">—</span>}</span></p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
} 