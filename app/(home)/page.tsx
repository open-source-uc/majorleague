export const runtime = "edge";

import Image from "next/image";

import image1 from "@/../public/assets/image1.png";
import image2 from "@/../public/assets/image2.png";

import Hero from "../components/home/Hero";
import Sponsors from "../components/home/Sponsors";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Sponsors />
      <section className="flex flex-col items-center justify-center gap-10 px-5 py-10 desktop:flex-row">
        <div className="w-full max-w-[399px]">
          <Image
            src={image1}
            alt="Major League UC - Comunidad de fútbol"
            className="h-full w-full rounded-lg object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 399px"
          />
        </div>
        <div className="flex max-w-xl flex-col gap-5">
          <h2 className="text-2xl font-bold">MAJOR LEAGUE UC: TU COMUNIDAD DE FÚTBOL EN INGENIERÍA UC</h2>
          <p className="text-lg">
            La historia de las grandes ligas de fútbol es un viaje fascinante que ha dejado una huella imborrable en el
            deporte. Desde sus inicios, estas ligas han sido el hogar de innumerables talentos que han elevado el juego
            a nuevas alturas.
          </p>
          <p className="text-lg">
            A lo largo de los años, han surgido leyendas que no solo han brillado en el campo, sino que también han
            inspirado a generaciones de aficionados y jugadores. La pasión por el fútbol se ha entrelazado con la
            cultura de cada comunidad, creando un legado que trasciende fronteras. Cada partido cuenta una historia, y
            cada equipo lleva consigo la esperanza de dejar su marca en la historia del fútbol.
          </p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center gap-10 px-5 py-10 desktop:flex-row-reverse">
        <div className="w-full max-w-[399px]">
          <Image
            src={image2}
            alt="Espacio para jugar fútbol en Major League UC"
            className="h-full w-full rounded-lg object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 399px"
          />
        </div>
        <div className="flex max-w-xl flex-col gap-5">
          <h2 className="text-2xl font-bold">TU ESPACIO PARA JUGAR FÚTBOL</h2>
          <p className="text-lg">
            La liga mayor de fútbol es un relato cautivador que ha dejado una marca indeleble en el mundo del deporte.
            Desde su creación, esta liga ha sido el escenario de talentos excepcionales que han llevado el juego a
            niveles extraordinarios.
          </p>
          <p className="text-lg">
            Con el paso del tiempo, han emergido íconos que no solo han destacado en el terreno de juego, sino que
            también han motivado a generaciones de aficionados y deportistas. La devoción por el fútbol se ha
            entrelazado con la identidad de cada comunidad, forjando un legado que supera fronteras. Cada encuentro
            narra una historia, y cada equipo lleva consigo la aspiración de hacer historia en el fútbol.
          </p>
        </div>
      </section>
    </>
  );
}
