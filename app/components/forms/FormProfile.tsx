"use client";

import { useActionState } from "react";

import { CreateProfile } from "@/actions/auth";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

export default function FormProfile({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(CreateProfile, {
    success: 0,
    errors: 0,
    message: "",
    body: {
      id: "",
      username: "",
      email: "",
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-border-header rounded-lg border p-4">
        <h3 className="text-foreground mb-2 text-lg font-semibold">Información requerida</h3>
        <ul className="text-ml-grey space-y-1 text-sm">
          <li>
            • <strong>Nombre de usuario:</strong> Será visible públicamente
          </li>
          <li>
            • <strong>Correo UC:</strong> Opcional, para notificaciones importantes como partidos y eventos
          </li>
        </ul>
      </div>

      <Form action={action} className="space-y-6">
        <input type="hidden" name="userId" value={userId} />

        <div className="space-y-4">
          <Input
            label="Nombre de Usuario"
            name="username"
            type="text"
            placeholder="Ej: JuanPerez22"
            defaultValue=""
            required
          />
          <p className="text-ml-grey text-xs">
            Elige un nombre único que te represente en Major League UC. No podrás cambiarlo después.
          </p>

          <Input
            label="Correo UC (opcional)"
            name="email"
            type="email"
            placeholder="juan.perez@uc.cl"
            defaultValue=""
          />
          <p className="text-ml-grey text-xs">
            Tu correo @uc.cl para recibir notificaciones sobre partidos y eventos importantes.
          </p>
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
              <h3 className="text-foreground mb-2 text-2xl font-semibold">¡Perfil creado exitosamente!</h3>
              <p className="text-ml-grey mb-4 text-sm">
                Ya puedes acceder a todas las funcionalidades de Major League UC
              </p>
              <a
                href="/perfil"
                className="bg-primary-darken hover:bg-primary text-background inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
              >
                <span>👤</span>
                Ir a Mi Perfil
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ButtonSubmit
              processing={
                <span className="flex items-center gap-2">
                  <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Creando perfil...
                </span>
              }
            >
              <span className="flex items-center gap-2">
                <span>🚀</span>
                Crear Mi Perfil
              </span>
            </ButtonSubmit>
          </div>
        )}
      </Form>
    </div>
  );
}
