"use client";

import { useActionState } from "react";

import { type TeamPhoto } from "@/actions/team-data";
import { updateTeamPage } from "@/actions/team-pages";
import type { Team, TeamPage } from "@/lib/types";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

import PhotoManager from "./PhotoManager";

interface TeamPageEditorProps {
  team: Team;
  teamPage: TeamPage | null;
  photos: TeamPhoto[];
}

export default function TeamPageEditor({ team, teamPage, photos }: TeamPageEditorProps) {
  const [state, formAction, pending] = useActionState(updateTeamPage, {
    success: 0,
    errors: 0,
    message: "",
    body: {
      team_id: team.id,
      description: teamPage?.description || "",
      instagram_handle: teamPage?.instagram_handle || "",
      captain_email: teamPage?.captain_email || "",
      founded_year: teamPage?.founded_year || undefined,
      motto: teamPage?.motto || "",
      achievements: teamPage?.achievements || "",
    },
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background-header border-border-header border-b">
        <div className="mx-auto max-w-4xl px-5 py-6">
          <h1 className="text-foreground text-2xl font-bold">Editar Página del Equipo</h1>
          <p className="text-ml-grey mt-2">Administra la información pública de {team.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {/* Success/Error Messages */}
        {state.success === 1 && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="mb-2 text-sm text-green-400">✅ Éxito</div>
            <p className="text-foreground text-sm">{state.message}</p>
          </div>
        )}

        {state.errors === 1 && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="mb-2 text-sm text-red-400">❌ Error</div>
            <p className="text-foreground text-sm">{state.message}</p>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-background-header border-border-header rounded-lg border p-6">
          <Form action={formAction}>
            <input type="hidden" name="team_id" value={team.id} />

            {/* Team Info Section */}
            <div className="mb-8">
              <h2 className="text-foreground mb-4 text-lg font-semibold">Información General</h2>
              <div className="space-y-4">
                <div className="flex w-full flex-col space-y-2">
                  <label htmlFor="description" className="text-foreground text-md">
                    Descripción del Equipo
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe tu equipo, su historia y objetivos..."
                    defaultValue={teamPage?.description || ""}
                    rows={4}
                    maxLength={1000}
                    className="border-border-header bg-background-header placeholder-foreground/50 text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border-2 p-4 focus:ring-2 focus:outline-hidden"
                  />
                </div>

                <Input
                  name="motto"
                  label="Lema del Equipo"
                  placeholder="ej. 'Unidos por la victoria'"
                  defaultValue={teamPage?.motto || ""}
                  maxLength={200}
                />

                <Input
                  name="founded_year"
                  label="Año de Fundación"
                  placeholder="ej. 2020"
                  defaultValue={teamPage?.founded_year?.toString() || ""}
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Contact Section */}
            <div className="mb-8">
              <h2 className="text-foreground mb-4 text-lg font-semibold">Información de Contacto</h2>
              <div className="space-y-4">
                <Input
                  name="instagram_handle"
                  label="Instagram del Equipo"
                  placeholder="ej. @atleticobyte_uc"
                  defaultValue={teamPage?.instagram_handle || ""}
                />

                <Input
                  name="captain_email"
                  label="Email del Capitán"
                  placeholder="capitan@equipo.com"
                  defaultValue={teamPage?.captain_email || ""}
                  type="email"
                />
              </div>
            </div>

            {/* Achievements Section */}
            <div className="mb-8">
              <h2 className="text-foreground mb-4 text-lg font-semibold">Logros y Reconocimientos</h2>
              <div className="flex w-full flex-col space-y-2">
                <label htmlFor="achievements" className="text-foreground text-md">
                  Logros
                </label>
                <textarea
                  id="achievements"
                  name="achievements"
                  placeholder="Lista los principales logros del equipo (separados por líneas)..."
                  defaultValue={teamPage?.achievements || ""}
                  rows={3}
                  className="border-border-header bg-background-header placeholder-foreground/50 text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border-2 p-4 focus:ring-2 focus:outline-hidden"
                />
              </div>
              <p className="text-ml-grey mt-2 text-xs">Tip: Escribe cada logro en una línea separada</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <a
                href={`/equipos/${team.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}`}
                className="border-border-header text-ml-grey hover:border-primary/50 hover:text-foreground rounded-lg border px-4 py-2 text-center text-sm transition-all duration-300"
              >
                ← Volver a la página del equipo
              </a>

              <ButtonSubmit
                processing={
                  <span className="flex items-center gap-2">
                    <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    Guardando...
                  </span>
                }
              >
                <span className="flex items-center gap-2">
                  <span>💾</span>
                  Guardar Cambios
                </span>
              </ButtonSubmit>
            </div>
          </Form>
        </div>

        {/* Photo Management Section */}
        <div className="bg-background-header border-border-header mt-8 rounded-lg border p-6">
          <PhotoManager teamId={team.id} photos={photos} />
        </div>

        {/* Help Section */}
        <div className="bg-primary/5 border-primary/20 mt-8 rounded-lg border p-4">
          <h3 className="text-primary mb-2 text-sm font-semibold">💡 Consejos para una mejor página</h3>
          <ul className="text-ml-grey space-y-1 text-xs">
            <li>• Mantén la descripción clara y atractiva para nuevos jugadores</li>
            <li>• Incluye tu Instagram para mayor visibilidad</li>
            <li>• Actualiza los logros regularmente</li>
            <li>• Asegúrate de que el email de contacto esté activo</li>
            <li>• Sube fotos de buena calidad para mostrar el equipo en acción</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
