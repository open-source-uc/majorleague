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
      jerseyNumber: undefined,
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
    Química: ["Mathchester Science"],
    Física: ["Mathchester Science"],
    "Matemática Biomédica": ["Mathchester Science"],
    Biología: ["Mathchester Science"],
    Minería: ["Minerham Forest"],
    Ambiental: ["Minerham Forest"],
    Hidráulica: ["Minerham Forest"],
    Geociencias: ["Minerham Forest"],
    Mecánica: ["Naranja Mecanica"],
    "Diseño e Innovación": ["Naranja Mecanica"],
    Eléctrica: ["AC Robovolt"],
    Robótica: ["AC Robovolt"],
    Otra: [],
  };

  const generationYear = parseInt(selectedGeneration) || currentYear;
  const isNovato = selectedGeneration && generationYear >= currentYear - 1;

  const getAvailableTeams = () => {
    if (isNovato || selectedMajor === "Otra") {
      return teams;
    }
    if (!selectedMajor) {
      return [];
    }

    const allowedTeamNames = majorToTeamMapping[selectedMajor] || [];
    return teams.filter((team) => allowedTeamNames.includes(team.name));
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
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <h3 className="text-foreground text-lg font-semibold">Información Personal</h3>
        </div>

        <div className="tablet:grid-cols-2 grid grid-cols-1 gap-4">
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
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <h3 className="text-foreground text-lg font-semibold">Información Académica</h3>
        </div>

        <div className="tablet:grid-cols-2 grid grid-cols-1 gap-4">
          <Select
            label="Por que Major quieres jugar"
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
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <h3 className="text-foreground text-lg font-semibold">Información Futbolística</h3>
        </div>

        <div className="tablet:grid-cols-2 grid grid-cols-1 gap-4">
          <Select
            label="Posición Preferida"
            name="position"
            options={positionOptions}
            defaultValue={state.body.position}
            required
          />

          <Input
            label="Número de Camiseta (Opcional)"
            name="jerseyNumber"
            type="number"
            placeholder="10"
            defaultValue={state.body.jerseyNumber || ""}
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
            {isNovato ? (
              <div className="border-primary/30 bg-primary/10 mt-3 rounded-lg border p-3">
                <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <span>🆕</span>
                  Acceso de Novato
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Como estudiante reciente, puedes elegir cualquier equipo, incluyendo &quot;New Boys&quot;.
                </p>
              </div>
            ) : null}

            {!isNovato && selectedMajor && selectedMajor !== "Otra" ? (
              <div className="border-success/30 bg-success/10 mt-3 rounded-lg border p-3">
                <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <span>🎓</span>
                  Asignado por carrera
                </p>
                <p className="text-muted-foreground mt-1 text-xs">Tu carrera determina automáticamente tu equipo</p>
              </div>
            ) : null}

            {!isNovato && selectedMajor === "Otra" && (
              <div className="border-warning/30 bg-warning/10 mt-3 rounded-lg border p-3">
                <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <span>🔄</span>
                  Selección libre
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Puedes elegir entre todos los equipos disponibles. En los comentarios, indica en qué carrera/major
                  estás para validar tu asignación.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">💭</span>
          <h3 className="text-foreground text-lg font-semibold">Información Adicional</h3>
        </div>

        <div>
          <label htmlFor="notes" className="text-foreground mb-2 block text-sm font-medium">
            Comentarios (Opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Cuéntanos sobre tu experiencia futbolística o cualquier información relevante..."
            defaultValue={state.body.notes}
            className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Status Messages */}
      {state.message ? (
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
      ) : null}

      {/* Success State */}
      {state.success ? (
        <div className="space-y-4 text-center">
          <div className="border-primary/30 bg-primary/10 rounded-lg border p-6">
            <div className="mb-2 text-4xl">🎉</div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">¡Solicitud Enviada!</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Tu solicitud ha sido recibida. Te contactaremos pronto con más información.
            </p>
            <Link
              href="/participa/gracias"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
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
                <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
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
