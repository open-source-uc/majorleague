import { Suspense } from "react";

import CompetitionsGrid from "@/app/components/dashboard/CompetitionsGrid";
import MatchesGrid from "@/app/components/dashboard/MatchesGrid";
import TeamsGrid from "@/app/components/dashboard/TeamsGrid";

function DashboardContent() {
  return (
    <div>
      <div>
        <h2>Dashboard</h2>
        <div>
          <h3>Teams</h3>
          <Suspense fallback={<div className="p-4 text-center">Loading teams...</div>}>
            <TeamsGrid />
          </Suspense>
        </div>
        <div>
          <h3>Matches</h3>
          <Suspense fallback={<div className="p-4 text-center">Loading matches...</div>}>
            <MatchesGrid />
          </Suspense>
        </div>
        <div>
          <h3>Competitions</h3>
          <Suspense fallback={<div className="p-4 text-center">Loading competitions...</div>}>
            <CompetitionsGrid />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Checking user role...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
