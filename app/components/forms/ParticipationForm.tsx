"use client";

import Link from "next/link";
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
    <Form action={action} className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">�</span>
          <h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
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
        </div>
      </div>

      {/* Academic Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎓</span>
          <h3 className="text-lg font-semibold text-foreground">Información Académica</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Select
            label="Carrera/Estado Académico"
            name="major"
            options={majorOptions}
            defaultValue={selectedMajor}
            onChange={(value) => setSelectedMajor(value)}
            required
          />

          <Select
            label="Año de ingreso"
            name="generation"
            options={genOptions}
            defaultValue={selectedGeneration}
            onChange={(value) => setSelectedGeneration(value)}
            required
          />
        </div>
      </div>

      {/* Football Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚽</span>
          <h3 className="text-lg font-semibold text-foreground">Información Futbolística</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Select
            label="Posición Preferida"
            name="position"
            options={positionOptions}
            defaultValue={state.body.position}
            required
          />

          <div className="tablet:col-span-2">
            <Select
              label="Tu Equipo"
              name="teamId"
              options={teamOptions}
              defaultValue={localTeamId}
              key={`${selectedMajor}-${selectedGeneration}-${teamOptions.length}`}
              required
            />

            {/* Team Assignment Information */}
            {isNovato && (
              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span>🆕</span>
                  Equipo: New Boys
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Como estudiante reciente, formarás parte del equipo New Boys
                </p>
              </div>
            )}

            {!isNovato && selectedMajor === "Egresado" && (
              <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span>�</span>
                  Equipo: Old Boys
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Como egresado, formarás parte del equipo Old Boys
                </p>
              </div>
            )}

            {!isNovato && selectedMajor && selectedMajor !== "Otra" && selectedMajor !== "Egresado" && (
              <div className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span>�</span>
                  Asignado por carrera
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tu carrera determina automáticamente tu equipo
                </p>
              </div>
            )}

            {!isNovato && selectedMajor === "Otra" && (
              <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span>🔄</span>
                  Selección libre
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Puedes elegir entre los equipos disponibles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💭</span>
          <h3 className="text-lg font-semibold text-foreground">Información Adicional</h3>
        </div>
        
        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
            Comentarios (Opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Cuéntanos sobre tu experiencia futbolística o cualquier información relevante..."
            defaultValue={state.body.notes}
            className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Status Messages */}
      {state.message && (
        <div
          className={`rounded-lg border p-4 ${
            state.success
              ? "border-success/30 bg-success/10 text-foreground"
              : "border-destructive/30 bg-destructive/10 text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{state.success ? "✅" : "❌"}</span>
            <span className="font-medium">{state.message}</span>
          </div>
        </div>
      )}

      {/* Success State */}
      {state.success ? (
        <div className="space-y-4 text-center">
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-6">
            <div className="mb-2 text-4xl">🎉</div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">¡Solicitud Enviada!</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Tu solicitud ha sido recibida. Te contactaremos pronto con más información.
            </p>
            <Link
              href="/participa/gracias"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>👍</span>
              Ver Estado de Solicitud
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <ButtonSubmit
            processing={
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
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
  );
}
