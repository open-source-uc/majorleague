import { TeamPage } from "@/lib/types";

interface ContactInfoProps {
  contact: TeamPage;
  teamName: string;
}

export default function ContactInfo({ contact, teamName }: ContactInfoProps) {
  return (
    <div className="bg-background-header border-border-header animate-in fade-in-0 slide-in-from-bottom-4 rounded-lg border p-4 duration-500 md:p-6">
      <h3 className="text-foreground mb-4 text-center text-lg font-bold md:mb-6 md:text-xl">Contacto</h3>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row md:gap-4 lg:gap-6">
        {contact?.instagram_handle ? (
          <a
            href={`https://instagram.com/${contact.instagram_handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:border-primary/50 border-border-header hover:bg-primary/5 group animate-in fade-in-0 slide-in-from-left-4 flex min-h-[60px] w-full touch-manipulation items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-[0.98] sm:w-auto md:min-h-[68px] md:px-6 md:py-4"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1.5 md:h-10 md:w-10 md:p-2">
              <svg className="h-4 w-4 text-white md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors duration-300 md:text-base">
                Instagram
              </p>
              <p className="text-primary truncate text-xs md:text-sm">{contact.instagram_handle}</p>
            </div>
          </a>
        ) : null}

        {contact?.captain_email ? (
          <a
            href={`mailto:${contact.captain_email}`}
            className="hover:border-primary/50 border-border-header hover:bg-primary/5 group animate-in fade-in-0 slide-in-from-right-4 flex min-h-[60px] w-full touch-manipulation items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-[0.98] sm:w-auto md:min-h-[68px] md:px-6 md:py-4"
          >
            <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full p-1.5 md:h-10 md:w-10 md:p-2">
              <svg className="h-4 w-4 text-black md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors duration-300 md:text-base">
                Capitán
              </p>
              <p className="text-primary truncate text-xs md:text-sm">{contact.captain_email}</p>
            </div>
          </a>
        ) : null}

        {!contact?.instagram_handle && !contact?.captain_email && (
          <p className="text-ml-grey text-center text-sm">No hay información de contacto disponible</p>
        )}
      </div>
    </div>
  );
}
