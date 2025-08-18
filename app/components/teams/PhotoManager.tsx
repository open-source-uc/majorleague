"use client";

import Image from "next/image";

import { useActionState, useState } from "react";

import type { TeamPhoto } from "@/actions/team-data";
import { addTeamPhoto, removeTeamPhoto } from "@/actions/team-pages";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

interface PhotoManagerProps {
  teamId: number;
  photos: TeamPhoto[];
}

export default function PhotoManager({ teamId, photos }: PhotoManagerProps) {
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  const [addState, addAction, addPending] = useActionState(addTeamPhoto, {
    success: 0,
    errors: 0,
    message: "",
    body: { team_id: teamId, url: "", caption: undefined },
  });

  const [removeState, removeAction, removePending] = useActionState(removeTeamPhoto, {
    success: 0,
    errors: 0,
    message: "",
    body: { photo_id: 0, team_id: teamId },
  });

  const handleAddSuccess = () => {
    if (addState.success === 1) {
      setIsAddingPhoto(false);
    }
  };

  if (addState.success === 1) {
    setTimeout(handleAddSuccess, 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-xl font-semibold">📸 Galería de Fotos</h3>
        <button
          onClick={() => setIsAddingPhoto(true)}
          className="bg-primary hover:bg-primary-darken rounded-lg px-4 py-2 font-medium text-black transition-all duration-300"
        >
          ➕ Agregar Foto
        </button>
      </div>

      {/* Success/Error Messages */}
      {(addState.success === 1 || removeState.success === 1) && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="flex items-center gap-2 font-medium text-green-400">
            <span>✅</span>
            {addState.message || removeState.message}
          </p>
        </div>
      )}

      {(addState.errors === 1 || removeState.errors === 1) && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="flex items-center gap-2 font-medium text-red-400">
            <span>❌</span>
            {addState.message || removeState.message}
          </p>
        </div>
      )}

      {/* Add Photo Form */}
      {isAddingPhoto ? (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
          <h4 className="mb-4 text-lg font-semibold text-blue-400">Agregar Nueva Foto</h4>
          <Form action={addAction}>
            <input type="hidden" name="team_id" value={teamId} />

            <div className="space-y-4">
              <Input
                name="url"
                label="URL de la Imagen"
                type="url"
                placeholder="https://example.com/imagen.jpg"
                required
              />
              <div className="text-ml-grey text-sm">
                <p className="mb-2">
                  💡 <strong>Servicios recomendados para subir imágenes:</strong>
                </p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>
                    <a
                      href="https://imgur.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Imgur
                    </a>{" "}
                    - Gratuito y fácil de usar
                  </li>
                  <li>
                    <a
                      href="https://postimages.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      PostImages
                    </a>{" "}
                    - Sin registro necesario
                  </li>
                  <li>
                    <a
                      href="https://imgbb.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ImgBB
                    </a>{" "}
                    - Rápido y confiable
                  </li>
                </ul>
              </div>

              <Input
                name="caption"
                label="Descripción (Opcional)"
                type="text"
                placeholder="Descripción de la foto..."
                maxLength={200}
              />

              <div className="flex gap-3">
                <ButtonSubmit
                  processing={
                    <span className="flex items-center gap-2">
                      <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Agregando...
                    </span>
                  }
                  className="bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700"
                >
                  <span className="flex items-center gap-2">
                    <span>💾</span>
                    Agregar Foto
                  </span>
                </ButtonSubmit>

                <button
                  type="button"
                  onClick={() => setIsAddingPhoto(false)}
                  className="border-border-header text-ml-grey hover:text-foreground hover:border-primary/50 rounded-lg border px-4 py-2 font-medium transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Form>
        </div>
      ) : null}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="bg-background-header border-border-header rounded-lg border p-8 text-center">
          <div className="text-ml-grey mb-4 text-4xl">📷</div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">No hay fotos en la galería</h3>
          <p className="text-ml-grey text-sm">Agrega fotos del equipo para mostrar en la página pública.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-background-header border-border-header group rounded-lg border p-4">
              <div className="relative mb-3 aspect-video overflow-hidden rounded-lg">
                <Image
                  src={photo.url}
                  alt={photo.caption || "Foto del equipo"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {photo.caption ? (
                <p className="text-foreground mb-3 line-clamp-2 text-sm font-medium">{photo.caption}</p>
              ) : null}

              <form
                action={(formData) => {
                  const confirmed = window.confirm("¿Estás seguro de que quieres eliminar esta foto?");
                  if (confirmed) {
                    removeAction(formData);
                  }
                }}
                className="flex justify-end"
              >
                <input type="hidden" name="photo_id" value={photo.id} />
                <input type="hidden" name="team_id" value={teamId} />

                <ButtonSubmit
                  processing={
                    <span className="flex items-center gap-2">
                      <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Eliminando...
                    </span>
                  }
                  className="rounded-lg bg-red-600/80 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  <span className="flex items-center gap-2">
                    <span>🗑️</span>
                    Eliminar
                  </span>
                </ButtonSubmit>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
