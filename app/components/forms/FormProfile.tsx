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
    <Form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

      <Input label="Nombre de Usuario" name="username" type="text" placeholder="JuanPerez" defaultValue="" required />

      <Input label="Correo @uc.cl (opcional)" name="email" type="email" placeholder="jperez@uc.cl" defaultValue="" />
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-green-500" : "text-red-500"}`}>{state.message}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm">
          <a href="/profile" className="text-blue-500 hover:underline">
            Tu perfil
          </a>
        </p>
      ) : null}

      <ButtonSubmit processing={<span>Cargando…</span>}>Crear Perfil</ButtonSubmit>
    </Form>
  );
}
