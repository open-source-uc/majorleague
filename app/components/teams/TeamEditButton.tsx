import Link from "next/link";

interface TeamEditButtonProps {
  teamSlug: string;
  isAdmin: boolean;
  isCaptain: boolean;
}

export default function TeamEditButton({ teamSlug, isAdmin, isCaptain }: TeamEditButtonProps) {
  if (!isAdmin && !isCaptain) {
    return null;
  }

  return (
    <Link
      href={`/equipos/${teamSlug}/edit`}
      className="bg-primary hover:bg-primary-darken inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      {isAdmin ? "Editar Página" : "Editar Mi Equipo"}
    </Link>
  );
}
