import { Suspense } from "react";

import FormLogin from "@/app/components/forms/FormLogin";

export default async function Login() {
  return (
    <div className="mt-10 flex justify-center">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <FormLogin />
      </Suspense>
    </div>
  );
}
