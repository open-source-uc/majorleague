import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { isCaptain } from "@/actions/auth";
import { getAuthStatus } from "@/lib/services/auth";

export const metadata: Metadata = {
  title: "Panel del Capitán - Major League",
  description: "Panel de gestión para capitanes de equipo",
};

export default async function CaptainLayout({ children }: { children: React.ReactNode }) {
  // Check if user is authenticated and is a team captain
  const { isAdmin, userProfile } = await getAuthStatus();

  if (!userProfile) {
    redirect("/login");
  }

  // Check if user is captain of any team (or admin)
  if (!isAdmin) {
    const isUserCaptain = await isCaptain(userProfile.id);

    if (!isUserCaptain) {
      redirect("/");
    }
  }

  return <>{children}</>;
}
