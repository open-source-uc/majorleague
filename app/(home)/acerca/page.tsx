import Image from "next/image";

import type { Metadata } from "next";

import image1 from "@/../public/assets/image1.png";
import image2 from "@/../public/assets/image2.png";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Acerca de Major League UC",
  description:
    "Conoce la historia y misión de Major League UC, la liga de fútbol más emocionante de la Universidad Católica. Una comunidad que une estudiantes a través del deporte.",
  keywords: "acerca de, historia, Major League UC, fútbol universitario, misión, comunidad estudiantil",
  openGraph: {
    title: "Acerca de Major League UC",
    description:
      "Conoce la historia y misión de Major League UC, la liga de fútbol más emocionante de la Universidad Católica.",
    url: "https://majorleague.uc.cl/acerca",
    images: [
      {
        url: "/assets/logo-horizontal.svg",
        width: 1200,
        height: 630,
        alt: "Acerca de Major League UC",
      },
    ],
  },
};

export default function AcercaDePage() {
  return;
  return (
    <>
      <h1 className="text-primary-darken mt-10 text-center text-4xl font-bold">Acerca De</h1>
      <section className="flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row">
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
          <h2 className="text-2xl font-bold">Lorem ipsum dolor sit amet</h2>
          <p className="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna leo, placerat quis eleifend eget,
            accumsan dignissim sapien. Nunc tempus nunc in nulla lacinia, eget eleifend orci luctus. Suspendisse ac
            mauris elementum, posuere nisl vitae, ornare arcu. Nullam sem enim, molestie sed iaculis cursus, consectetur
            id libero. Fusce faucibus vitae sem et volutpat. Maecenas sed euismod elit.
          </p>
          <p className="text-lg">
            Etiam sollicitudin eu ante sed auctor. In vitae arcu quam. Nunc tincidunt, ligula placerat dictum tincidunt,
            risus risus commodo ex, nec eleifend enim magna ut mauris. Donec tempor nec ante ac sollicitudin. Orci
            varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce non aliquam elit,
            non vulputate nisl.
          </p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row-reverse">
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
          <h2 className="text-2xl font-bold">Lorem ipsum dolor sit amet</h2>
          <p className="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna leo, placerat quis eleifend eget,
            accumsan dignissim sapien. Nunc tempus nunc in nulla lacinia, eget eleifend orci luctus. Suspendisse ac
            mauris elementum, posuere nisl vitae, ornare arcu. Nullam sem enim, molestie sed iaculis cursus, consectetur
            id libero. Fusce faucibus vitae sem et volutpat. Maecenas sed euismod elit.
          </p>
          <p className="text-lg">
            Etiam sollicitudin eu ante sed auctor. In vitae arcu quam. Nunc tincidunt, ligula placerat dictum tincidunt,
            risus risus commodo ex, nec eleifend enim magna ut mauris. Donec tempor nec ante ac sollicitudin. Orci
            varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce non aliquam elit,
            non vulputate nisl.
          </p>
        </div>
      </section>
    </>
  );
}
