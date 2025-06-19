import { Suspense } from "react";

import FormRegister from "@/app/components/forms/FormRegister";

export default async function Register() {
  return (
    <section className="my-10 flex justify-center">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <FormRegister />
      </Suspense>
    </section>
  );
}
