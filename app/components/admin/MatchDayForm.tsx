"use client";

import { useState, useActionState } from "react";

import { PlusIcon, TrashIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

import { createMatchDay } from "@/actions/match-days";
import Button from "@/components/ui/Button";
import ButtonSubmit from "@/components/ui/ButtonSubmit";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface MatchDayFormProps {
  teamOptions: { value: string; label: string }[];
  competitionOptions: { value: string; label: string }[];
  onSuccess?: () => void;
}

interface TeamPair {
  id: string;
  local_team_id: string;
  visitor_team_id: string;
  time: string;
}

export default function MatchDayForm({ teamOptions, competitionOptions, onSuccess }: MatchDayFormProps) {
  const [teamPairs, setTeamPairs] = useState<TeamPair[]>([
    { id: "1", local_team_id: "", visitor_team_id: "", time: "15:00" },
    { id: "2", local_team_id: "", visitor_team_id: "", time: "16:30" },
    { id: "3", local_team_id: "", visitor_team_id: "", time: "18:00" },
    { id: "4", local_team_id: "", visitor_team_id: "", time: "19:30" },
  ]);

  const [state, formAction, pending] = useActionState(createMatchDay, {
    success: 0,
    errors: 0,
    message: "",
  });

  const addTeamPair = () => {
    const newId = (teamPairs.length + 1).toString();
    setTeamPairs([
      ...teamPairs,
      {
        id: newId,
        local_team_id: "",
        visitor_team_id: "",
        time: "20:00",
      },
    ]);
  };

  const removeTeamPair = (id: string) => {
    if (teamPairs.length > 1) {
      setTeamPairs(teamPairs.filter((pair) => pair.id !== id));
    }
  };

  const updateTeamPair = (id: string, field: keyof Omit<TeamPair, "id">, value: string) => {
    setTeamPairs(teamPairs.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)));
  };

  const getAvailableTeams = (excludeTeamId?: string) => {
    const usedTeams = teamPairs.reduce<string[]>((acc, pair) => {
      if (pair.local_team_id) acc.push(pair.local_team_id);
      if (pair.visitor_team_id) acc.push(pair.visitor_team_id);
      return acc;
    }, []);

    return teamOptions.filter((team) => !usedTeams.includes(team.value) || team.value === excludeTeamId);
  };

  const handleSubmit = (formData: FormData) => {
    // Add team pairs data to form
    formData.append(
      "team_pairs",
      JSON.stringify(
        teamPairs.map((pair) => ({
          local_team_id: parseInt(pair.local_team_id),
          visitor_team_id: parseInt(pair.visitor_team_id),
          time: pair.time,
        })),
      ),
    );

    formAction(formData);
    if (state.success) {
      onSuccess?.();
    }
  };

  const validateForm = () => {
    return teamPairs.every(
      (pair) => pair.local_team_id && pair.visitor_team_id && pair.local_team_id !== pair.visitor_team_id && pair.time,
    );
  };

  return (
    <div className="bg-card border-border rounded-lg border p-6">
      <div className="mb-6 flex items-center">
        <CalendarDaysIcon className="text-primary mr-3 h-6 w-6" />
        <div>
          <h2 className="text-foreground text-xl font-semibold">Crear Nueva Jornada</h2>
          <p className="text-muted-foreground text-sm">Programa múltiples partidos para una fecha específica</p>
        </div>
      </div>

      <Form action={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input name="date" type="date" label="Fecha de la Jornada" required />

            <Select name="competition_id" label="Competición" options={competitionOptions} required />

            <Input name="location" label="Ubicación" placeholder="Ej: Estadio UC San Carlos de Apoquindo" />
          </div>

          {/* Team Pairs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-lg font-medium">Partidos ({teamPairs.length})</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTeamPair}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Agregar Partido
              </Button>
            </div>

            <div className="space-y-4">
              {teamPairs.map((pair, index) => (
                <div key={pair.id} className="bg-muted rounded-lg p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-foreground text-sm font-medium">Partido {index + 1}</h4>
                    {Boolean(teamPairs.length > 1) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamPair(pair.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Select
                      name={`local_team_id_${pair.id}`}
                      label="Equipo Local"
                      options={getAvailableTeams(pair.local_team_id)}
                      defaultValue={pair.local_team_id}
                      onChange={(value) => updateTeamPair(pair.id, "local_team_id", value)}
                      required
                    />

                    <Select
                      name={`visitor_team_id_${pair.id}`}
                      label="Equipo Visitante"
                      options={getAvailableTeams(pair.visitor_team_id)}
                      defaultValue={pair.visitor_team_id}
                      onChange={(value) => updateTeamPair(pair.id, "visitor_team_id", value)}
                      required
                    />

                    <Input
                      name={`time_${pair.id}`}
                      type="time"
                      label="Hora"
                      value={pair.time}
                      onChange={(e) => updateTeamPair(pair.id, "time", e.target.value)}
                      required
                    />
                  </div>

                  {/* Validation Messages */}
                  {Boolean(
                    pair.local_team_id && pair.visitor_team_id && pair.local_team_id === pair.visitor_team_id,
                  ) && (
                    <div className="text-destructive mt-2 text-sm">
                      ⚠️ El equipo local y visitante no pueden ser el mismo
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="border-border flex items-center justify-between border-t pt-6">
            <div className="text-muted-foreground text-sm">
              {teamPairs.length} partido{teamPairs.length !== 1 ? "s" : ""} programado
              {teamPairs.length !== 1 ? "s" : ""}
            </div>

            <div className="flex space-x-3">
              <ButtonSubmit processing={"Creando..."} disabled={!validateForm()}>
                Crear Jornada
              </ButtonSubmit>
            </div>
          </div>

          {/* Results */}
          {Boolean(state.message) && (
            <div
              className={`rounded-lg p-4 ${
                state.success
                  ? "border border-green-500/20 bg-green-500/10 text-green-600"
                  : "border border-red-500/20 bg-red-500/10 text-red-600"
              }`}
            >
              {state.message}
            </div>
          )}
        </div>
      </Form>

      {/* Quick Tips */}
      <div className="bg-muted/50 mt-6 rounded-lg p-4">
        <h4 className="text-foreground mb-2 text-sm font-medium">💡 Consejos:</h4>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>• Una jornada típica incluye 4 partidos</li>
          <li>• Cada equipo solo puede jugar una vez por jornada</li>
          <li>• Los horarios sugeridos permiten 90 minutos entre partidos</li>
          <li>• Puedes agregar o eliminar partidos según sea necesario</li>
        </ul>
      </div>
    </div>
  );
}
