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
      {/* Success State - Show immediately when profile is created */}
      {state.success ? (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              ¡Tu perfil está listo!
            </h3>
            <p className="text-muted-foreground">
              Ya tienes acceso completo a Major League UC
            </p>
          </div>
          
          <div className="pt-4">
            <a
              href="/perfil"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>👤</span>
              Ver Mi Perfil
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Clean Form Layout */}
          <Form action={action} className="space-y-6">
            <input type="hidden" name="userId" value={userId} />

            <div className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <Input
                  label="Nombre de Usuario"
                  name="username"
                  type="text"
                  placeholder="Ej: JuanPerez22"
                  defaultValue=""
                  required
                  aria-describedby="username-help"
                />
                <p id="username-help" className="text-sm text-muted-foreground">
                  Será visible públicamente. No podrás cambiarlo después.
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Input
                  label="Correo UC (opcional)"
                  name="email"
                  type="email"
                  placeholder="juan.perez@uc.cl"
                  defaultValue=""
                  aria-describedby="email-help"
                />
                <p id="email-help" className="text-sm text-muted-foreground">
                  Para recibir notificaciones sobre partidos y eventos importantes.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {state.message && !state.success ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                <div className="flex items-center gap-2">
                  <span className="text-lg">❌</span>
                  <span className="font-medium">{state.message}</span>
                </div>
              </div>
            ) : null}

            {/* Submit Button */}
            <div className="pt-4">
              <ButtonSubmit
                className="w-full"
                processing={
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Creando perfil...
                  </span>
                }
              >
                <span className="flex items-center text-background justify-center">
                  Crear Mi Perfil
                </span>
              </ButtonSubmit>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
}
