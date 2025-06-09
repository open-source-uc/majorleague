"use client";

import { useSearchParams } from "next/navigation";

import { useActionState } from "react";

import { ActionLogin } from "@/app/actions/login";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

export default function FormLogin() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("from");
  const [state, action, pending] = useActionState(ActionLogin, {
    errors: 0,
    success: 0,
    message: "",
    body: {
      email: "",
      password: "",
    },
  });

  return (
    <Form action={action}>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Iniciar sesión</h2>
        {slug === "confirm" && <p className="text-primary-darken text-md mt-2 text-sm">Cuenta verificada!</p>}
      </div>
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="Correo electrónico"
        defaultValue={state.body.email}
        required
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Tu contraseña"
        defaultValue={state.body.password}
        required
      />
      {state.success === 1 && <p className="text-md mt-2 text-sm text-green-500">{state.message}</p>}
      {state.success === 0 && <p className="text-md mt-2 text-sm text-red-500">{state.message}</p>}
      <ButtonSubmit processing={<span>Cargando...</span>}>Login</ButtonSubmit>
    </Form>
  );
}
