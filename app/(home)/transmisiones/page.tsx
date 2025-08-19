import { getMainStream, getPastStreams } from "@/actions/streams";
import Image from "next/image";

export const runtime = "edge";

export default async function TransmisionPage() {
  const [main, past] = await Promise.all([getMainStream(), getPastStreams(12)]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-primary-darken md:text-3xl">Transmisión en Vivo</h1>

      {main ? (
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-md font-semibold text-foreground md:text-xl">{main.title || "Transmisión principal"}</span>
            {main.is_live_stream ? (
              <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">EN VIVO</span>
            ) : null}
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              title={main.title || "YouTube Player"}
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${main.youtube_video_id}?rel=0&autoplay=1&mute=1&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="mt-3 text-sm text-ml-grey">{new Date(main.stream_date).toLocaleDateString("es-CL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}</p>
        </div>
      ) : (
        <div className="mb-10 rounded-lg border border-dashed p-8 text-center text-ml-grey">
          No hay una transmisión en vivo por el momento.
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-foreground md:text-xl">Transmisiones pasadas</h2>
      {past.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {past.map((s) => (
            <a
              key={s.id}
              href={`https://www.youtube.com/watch?v=${s.youtube_video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-lg border border-border-header bg-background-header transition-colors hover:bg-background"
            >
              <div className="aspect-video w-full bg-black">
                <Image
                  src={s.thumbnail_url || `https://i.ytimg.com/vi/${s.youtube_video_id}/hqdefault.jpg`}
                  alt={s.title || "Video thumbnail"}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  width={300}
                  height={300}
                  priority
                />
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-foreground">{s.title || "Video de YouTube"}</p>
                {s.stream_date ? (
                  <p className="mt-1 text-xs text-ml-grey">
                    {new Date(s.stream_date || "").toLocaleString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-ml-grey">Aún no hay transmisiones pasadas.</p>
      )}
    </section>
  );
}


