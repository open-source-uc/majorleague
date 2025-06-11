import { redirect } from "next/navigation";

import { Suspense } from "react";

import { isAdmin } from "@/app/actions/auth";

async function AdminChecker({ children }: { children: React.ReactNode }) {
  const user = await isAdmin();
  if (!user) {
    redirect("/");
  }

  return <div>{children}</div>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p>Checking admin access...</p>}>
      <AdminChecker>{children}</AdminChecker>
    </Suspense>
  );
}
