"use client";

import { useActionState } from "react";

import { ActionParticipation } from "@/app/actions/participation";
import { Tables } from "@/lib/types/database";
import { majors } from "@/lib/types/majors";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";
import Select from "../ui/Select";

type Team = Tables<"teams">;

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
    },
  });

  const majorOptions = majors.map((major) => ({ value: major, label: major }));

  // TODO: Change to current year
  const currentYear = 2025;

  const genOptions = [
    ...Array.from({ length: 10 }, (_, i) => {
      const year = currentYear - i;
      return { value: year.toString(), label: year.toString() };
    }),
  ];

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  return (
    <Form action={action} className="bg-background border-0">
      <h1 className="mb-6 text-center text-3xl font-bold">FORMULARIO DE PARTICIPACIÓN</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input label="Fecha de Nacimiento" name="birthdate" type="date" className="border-primary-darken/20" required />

        <Select
          label="Tu major"
          name="major"
          options={majorOptions}
          placeholder="Selecciona tu major"
          className="border-primary-darken/20"
          required
        />

        <Input
          label="Posición preferida"
          name="position"
          type="text"
          placeholder="Lateral Derecho"
          className="border-primary-darken/20"
          required
        />

        <Select
          label="Generación"
          name="generation"
          options={genOptions}
          placeholder="Selecciona tu generación"
          className="border-primary-darken/20"
          required
        />

        <Select
          label="Equipo"
          name="teamId"
          options={teamOptions}
          placeholder="Selecciona el equipo"
          className="border-primary-darken/20"
          required
        />

        <Input
          label="Comentarios (Opcional)"
          name="notes"
          type="text"
          placeholder="Comentarios"
          className="border-primary-darken/20"
        />
      </div>

      {state.success === 1 && <p className="mt-4 text-center text-green-500">{state.message}</p>}
      {state.errors === 1 && <p className="mt-4 text-center text-red-500">{state.message}</p>}

      <div className="mt-6 flex justify-center">
        <ButtonSubmit processing={<span>Enviando...</span>} className="w-auto px-12">
          Enviar
        </ButtonSubmit>
      </div>
    </Form>
  );
}
