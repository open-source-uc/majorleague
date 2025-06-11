import { redirect } from "next/navigation";

import { Suspense } from "react";

import { isAuthUser } from "@/app/actions/auth";

async function AuthUserChecker({ children }: { children: React.ReactNode }) {
  const user = await isAuthUser();
  if (!user) {
    redirect("/");
  }

  return <div>{children}</div>;
}

export default function AuthUserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p>Checking auth user access...</p>}>
      <AuthUserChecker>{children}</AuthUserChecker>
    </Suspense>
  );
}
