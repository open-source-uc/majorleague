"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useActionState } from "react";

import { ActionRegister } from "@/app/actions/register";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

export default function FormRegister() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("from");
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

  const getHeaderText = () => {
    if (slug === "participa") {
      return "¡Únete a la Liga! Regístrate para participar";
    }
    return "Crear cuenta nueva";
  };

  const getButtonText = () => {
    if (slug === "participa") {
      return "Registrarse y Participar";
    }
    return "Registrarse";
  };

  return (
    <Form action={action}>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{getHeaderText()}</h2>
        {slug === "participa" && (
          <p className="text-primary-darken text-md mt-2 text-sm">
            Completa tu registro para comenzar a participar en los torneos
          </p>
        )}
      </div>

      <Input
        label="Nombre"
        name="first_name"
        type="text"
        placeholder="Tu nombre"
        defaultValue={state.body.first_name}
        required
      />
      <Input
        label="Apellido"
        name="last_name"
        type="text"
        placeholder="Tu apellido"
        defaultValue={state.body.last_name}
        required
      />
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
      <ButtonSubmit processing={<span>Cargando...</span>}>{getButtonText()}</ButtonSubmit>
      <div className="text-md text-foreground mt-2 text-sm">
        Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-primary-darken">
          Iniciar sesión
        </Link>
      </div>
    </Form>
  );
}
