"use client";

import { useActionState, useEffect, useState } from "react";

import { ActionParticipation } from "@/actions/participation";
import type { Team } from "@/lib/types";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";
import Select from "../ui/Select";

const majorOptions = [
  { value: "Computación", label: "Computación" },
  { value: "Software", label: "Software" },
  { value: "Investigación Operativa", label: "Investigación Operativa" },
  { value: "Civil", label: "Civil" },
  { value: "Transporte", label: "Transporte" },
  { value: "Construcción", label: "Construcción" },
  { value: "Química", label: "Química" },
  { value: "Física", label: "Física" },
  { value: "Matemática Biomédica", label: "Matemática Biomédica" },
  { value: "Biología", label: "Biología" },
  { value: "Minería", label: "Minería" },
  { value: "Ambiental", label: "Ambiental" },
  { value: "Hidráulica", label: "Hidráulica" },
  { value: "Geociencias", label: "Geociencias" },
  { value: "Mecánica", label: "Mecánica" },
  { value: "Diseño e Innovación", label: "Diseño e Innovación" },
  { value: "Eléctrica", label: "Eléctrica" },
  { value: "Robótica", label: "Robótica" },
  { value: "Egresado", label: "Egresado" },
  { value: "Otra", label: "Otra" },
];

const positionOptions = [
  { value: "GK", label: "Portero (GK)" },
  { value: "DEF", label: "Defensa (DEF)" },
  { value: "MID", label: "Mediocampo (MID)" },
  { value: "FWD", label: "Delantero (FWD)" },
];

export default function ParticipationForm({ teams }: { teams: Team[] }) {
  const [state, action, pending] = useActionState(ActionParticipation, {
    errors: 0,
    success: 0,
    message: "",
    body: {
      birthdate: "",
      major: "",
      position: "",
      generation: "",
      teamId: "",
      notes: "",
      firstName: "",
      lastName: "",
      nickname: "",
    },
  });

  const [selectedMajor, setSelectedMajor] = useState(state.body.major);
  const [selectedGeneration, setSelectedGeneration] = useState(state.body.generation);

  const currentYear = new Date().getFullYear();
  const genOptions = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  const majorToTeamMapping: Record<string, string[]> = {
    Computación: ["Atletico Byte"],
    Software: ["Atletico Byte"],
    "Investigación Operativa": ["Industrial FC"],
    Civil: ["Manchester Civil"],
    Transporte: ["Manchester Civil"],
    Construcción: ["Manchester Civil"],
    Química: ["Manchester Science"],
    Física: ["Manchester Science"],
    "Matemática Biomédica": ["Manchester Science"],
    Biología: ["Manchester Science"],
    Minería: ["Minerham Forest"],
    Ambiental: ["Minerham Forest"],
    Hidráulica: ["Minerham Forest"],
    Geociencias: ["Minerham Forest"],
    Mecánica: ["Naranja Mecanica"],
    "Diseño e Innovación": ["Naranja Mecanica"],
    Eléctrica: ["Robovolt United"],
    Robótica: ["Robovolt United"],
    Egresado: ["Old Boys"],
    Otra: [],
  };

  const generationYear = parseInt(selectedGeneration) || currentYear;
  const isNovato = generationYear >= currentYear - 1;

  const getAvailableTeams = () => {
    if (isNovato) {
      return teams.filter((team) => team.name === "New Boys");
    }

    if (selectedMajor === "Egresado") {
      return teams.filter((team) => team.name === "Old Boys");
    }

    if (!selectedMajor) {
      return teams.filter((team) => !["New Boys", "Old Boys"].includes(team.name));
    }

    if (selectedMajor === "Otra") {
      return teams.filter((team) => !["New Boys", "Old Boys"].includes(team.name));
    }

    const allowedTeamNames = majorToTeamMapping[selectedMajor] || [];
    const filteredTeams = teams.filter((team) => allowedTeamNames.includes(team.name));

    if (filteredTeams.length === 0) {
      return teams.filter((team) => !["New Boys", "Old Boys"].includes(team.name));
    }

    return filteredTeams;
  };

  const availableTeams = getAvailableTeams();
  const teamOptions = availableTeams.map((team) => ({
    value: team.id?.toString() || "",
    label: team.name,
  }));

  const [localTeamId, setLocalTeamId] = useState(state.body.teamId);

  useEffect(() => {
    if (teamOptions.length === 1) {
      const autoSelectedTeam = teamOptions[0].value;
      if (localTeamId !== autoSelectedTeam) {
        setLocalTeamId(autoSelectedTeam);
        state.body.teamId = autoSelectedTeam;
      }
    } else if (teamOptions.length === 0) {
      setLocalTeamId("");
      state.body.teamId = "";
    } else if (localTeamId && !teamOptions.find((option) => option.value === localTeamId)) {
      setLocalTeamId("");
      state.body.teamId = "";
    }
  }, [teamOptions, localTeamId, state.body]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          Formulario de <span className="text-primary-darken">Participación</span>
        </h1>
        <p className="text-ml-grey text-lg">Completa la información para ser asignado automáticamente a tu equipo</p>
      </div>

      <div className="bg-background-header border-border-header rounded-lg border p-6">
        <h3 className="text-foreground mb-4 flex items-center gap-2 text-2xl font-semibold">
          <span className="text-primary text-2xl">📋</span>
          Instrucciones Importantes
        </h3>
        <ul className="text-ml-grey space-y-2 text-sm">
          <li>
            • <strong>Información personal:</strong> Asegúrate de que todos los datos sean correctos
          </li>
          <li>
            • <strong>Asignación automática:</strong> Tu equipo se determina según tu carrera/estado
          </li>
          <li>
            • <strong>Novatos (2 últimos años):</strong> Asignados automáticamente a &quot;New Boys&quot;
          </li>
          <li>
            • <strong>Egresados:</strong> Asignados automáticamente a &quot;Old Boys&quot;
          </li>
          <li>
            • <strong>Solicitud única:</strong> Solo puedes tener una solicitud activa a la vez
          </li>
        </ul>
      </div>

      <Form action={action} className="space-y-6">
        <div className="bg-background-header border-border-header rounded-lg border p-6">
          <h3 className="text-foreground mb-4 text-2xl font-semibold">Información Personal</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Nombre"
              name="firstName"
              type="text"
              placeholder="Juan"
              defaultValue={state.body.firstName}
              required
            />

            <Input
              label="Apellido"
              name="lastName"
              type="text"
              placeholder="Pérez"
              defaultValue={state.body.lastName}
              required
            />

            <Input
              label="Apodo (Opcional)"
              name="nickname"
              type="text"
              placeholder="Juanito"
              defaultValue={state.body.nickname}
            />

            <Input
              label="Fecha de Nacimiento"
              name="birthdate"
              type="date"
              defaultValue={state.body.birthdate}
              required
            />

            <Select
              label="Carrera/Estado Académico"
              name="major"
              options={majorOptions}
              defaultValue={selectedMajor}
              onChange={(value) => setSelectedMajor(value)}
              required
            />
          </div>
        </div>

        <div className="bg-background-header border-border-header rounded-lg border p-6">
          <h3 className="text-foreground mb-4 text-2xl font-semibold">Información Futbolística</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Posición Preferida"
              name="position"
              options={positionOptions}
              defaultValue={state.body.position}
              required
            />

            <Select
              label="Generación (Año de ingreso)"
              name="generation"
              options={genOptions}
              defaultValue={selectedGeneration}
              onChange={(value) => setSelectedGeneration(value)}
              required
            />

            <div className="md:col-span-2">
              <Select
                label="Equipo Asignado"
                name="teamId"
                options={teamOptions}
                defaultValue={localTeamId}
                key={`${selectedMajor}-${selectedGeneration}-${teamOptions.length}`}
                required
              />

              {isNovato ? (
                <div className="mt-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-blue-400">
                    <span>🆕</span>
                    Asignación Automática: Novato
                  </p>
                  <p className="mt-1 text-xs text-blue-300">
                    Como estudiante de generación {generationYear}, has sido asignado automáticamente al equipo
                    &quot;New Boys&quot;.
                  </p>
                </div>
              ) : null}

              {!isNovato && selectedMajor && selectedMajor !== "Otra" ? (
                <div className="mt-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-green-400">
                    <span>🎯</span>
                    Asignación Automática por Carrera
                  </p>
                  <p className="mt-1 text-xs text-green-300">
                    Tu carrera &quot;{selectedMajor}&quot; te asigna automáticamente a este equipo específico.
                  </p>
                </div>
              ) : null}

              {!isNovato && selectedMajor === "Egresado" && (
                <div className="mt-2 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-purple-400">
                    <span>🎓</span>
                    Asignación Automática: Egresado
                  </p>
                  <p className="mt-1 text-xs text-purple-300">
                    Como egresado, has sido asignado automáticamente al equipo &quot;Old Boys&quot;.
                  </p>
                </div>
              )}

              {!isNovato && selectedMajor === "Otra" && (
                <div className="mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-yellow-400">
                    <span>🔄</span>
                    Carrera &quot;Otra&quot; - Selección Libre
                  </p>
                  <p className="mt-1 text-xs text-yellow-300">
                    Al seleccionar &quot;Otra&quot;, puedes elegir entre los equipos generales disponibles.
                  </p>
                </div>
              )}

              {!isNovato && !selectedMajor && (
                <p className="text-ml-grey mt-1 text-xs">
                  Selecciona tu carrera/estado para ver tu asignación automática de equipo
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background-header border-border-header rounded-lg border p-6">
          <h3 className="text-foreground mb-4 text-2xl font-semibold">Información Adicional</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="notes" className="text-foreground mb-2 block text-sm font-medium">
                Comentarios (Opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Cuéntanos sobre tu experiencia futbolística, disponibilidad, o cualquier información relevante..."
                defaultValue={state.body.notes}
                className="bg-background border-border-header text-foreground placeholder:text-ml-grey focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {state.message ? (
          <div
            className={`rounded-lg border p-4 ${
              state.success
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{state.success ? "✅" : "❌"}</span>
              <span className="font-medium">{state.message}</span>
            </div>
          </div>
        ) : null}

        {state.success ? (
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 border-primary/30 rounded-lg border p-6">
              <div className="text-primary mb-2 text-4xl">🎉</div>
              <h3 className="text-foreground mb-2 text-2xl font-semibold">¡Solicitud Enviada!</h3>
              <p className="text-ml-grey mb-4 text-sm">
                Tu solicitud ha sido recibida exitosamente. El equipo de Major League UC la revisará y se pondrá en
                contacto contigo pronto.
              </p>
              <a
                href="/participa/gracias"
                className="bg-primary-darken hover:bg-primary text-background inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
              >
                <span>👍</span>
                Ver Estado de Solicitud
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ButtonSubmit
              processing={
                <span className="flex items-center gap-2">
                  <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Enviando solicitud...
                </span>
              }
            >
              <span className="flex items-center gap-2">
                <span>🚀</span>
                Enviar Solicitud
              </span>
            </ButtonSubmit>
          </div>
        )}
      </Form>
    </div>
  );
}
