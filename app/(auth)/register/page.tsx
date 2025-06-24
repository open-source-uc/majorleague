import { redirect } from "next/navigation";

import { Suspense } from "react";

import { isAuthUser } from "@/app/actions/auth";
import FormRegister from "@/app/components/forms/FormRegister";

async function AuthUserChecker({ children }: { children: React.ReactNode }) {
  const user = await isAuthUser();
  if (user) redirect("/participa");
  return <>{children}</>;
}

export default function Register() {
  return (
    <section className="my-10 flex justify-center">
      <Suspense>
        <AuthUserChecker>
          <FormRegister />
        </AuthUserChecker>
      </Suspense>
    </section>
  );
}
