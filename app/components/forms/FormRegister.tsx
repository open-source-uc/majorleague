"use client";

import { useActionState } from "react";

import { ActionRegister } from "@/app/actions/register";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

export default function FormRegister() {
  const [state, action, pending] = useActionState(ActionRegister, {
    errors: 0,
    success: 0,
    message: "",
    body: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  return (
    <Form action={action}>
      <Input
        label="Nombre"
        name="first_name"
        type="text"
        placeholder="Tu nombre"
        defaultValue={state.body.first_name}
      />
      <Input
        label="Apellido"
        name="last_name"
        type="text"
        placeholder="Tu apellido"
        defaultValue={state.body.last_name}
      />
      <Input label="Email" name="email" type="email" placeholder="Correo electrónico" defaultValue={state.body.email} />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Tu contraseña"
        defaultValue={state.body.password}
      />
      <p>{state.message}</p>
      <ButtonSubmit processing={<span>Cargando...</span>}>Registrarse</ButtonSubmit>
    </Form>
  );
}
