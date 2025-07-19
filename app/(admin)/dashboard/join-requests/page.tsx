import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getJoinTeamRequests,
  createJoinTeamRequest,
  updateJoinTeamRequest,
  deleteJoinTeamRequest,
} from "@/actions/join-requests";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getTeamOptions, getProfileOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function JoinRequestsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [joinRequests, teamOptions, profileOptions] = await Promise.all([
    getJoinTeamRequests(),
    getTeamOptions(),
    getProfileOptions(),
  ]);

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="join-requests"
        data={joinRequests}
        createAction={createJoinTeamRequest}
        updateAction={updateJoinTeamRequest}
        deleteAction={deleteJoinTeamRequest}
        dynamicOptions={{
          teams: teamOptions,
          profiles: profileOptions,
        }}
      />
    </section>
  );
}
