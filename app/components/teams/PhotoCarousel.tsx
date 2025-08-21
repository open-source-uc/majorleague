"use client";

import Image from "next/image";

import { useState } from "react";

import { TeamPhoto } from "@/actions/team-data";

interface PhotoCarouselProps {
  photos: TeamPhoto[];
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (photos.length === 0) {
    return (
      <div className="bg-background-header border-border-header flex h-64 items-center justify-center rounded-lg border">
        <p className="text-ml-grey">No hay fotos disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-background-header border-border-header animate-in fade-in-0 slide-in-from-right-4 rounded-lg border p-4 duration-500">
      <h3 className="text-foreground mb-4 text-xl font-bold">Galería del Equipo</h3>

      <div className="group relative">
        <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-lg">
          <Image
            src={photos[currentPhoto].url}
            alt={photos[currentPhoto].caption ?? ""}
            fill
            className="object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="bg-background/80 hover:bg-background absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:scale-110"
              aria-label="Foto anterior"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextPhoto}
              className="bg-background/80 hover:bg-background absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:scale-110"
              aria-label="Siguiente foto"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {photos[currentPhoto].caption ? (
        <p className="text-ml-grey animate-in fade-in-0 mt-3 text-center text-sm duration-300">
          {photos[currentPhoto].caption}
        </p>
      ) : null}

      {photos.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPhoto(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentPhoto
                  ? "bg-primary w-6 shadow-md"
                  : "bg-border-header hover:bg-ml-grey w-2 hover:scale-125"
              }`}
              aria-label={`Ver foto ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
