import Link from "next/link";
import { redirect } from "next/navigation";

import { getStreams, createStream, updateStream, deleteStream } from "@/actions/streams";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function StreamsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [streams] = await Promise.all([getStreams()]);

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="streams"
        data={streams}
        createAction={createStream}
        updateAction={updateStream}
        deleteAction={deleteStream}
      />
    </section>
  );
}
