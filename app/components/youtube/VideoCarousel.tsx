"use client";

import { useState, useEffect } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { IVideo } from "@/lib/types/video";

export default function VideoCarousel({ videos }: { videos: IVideo[] }) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeString, setTimeString] = useState("");

  function getRelativeTime(dateString: string, userLang: string) {
    const rtf = new Intl.RelativeTimeFormat(userLang, { numeric: "auto" });
    const publishedDate = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.floor((publishedDate.getTime() - now.getTime()) / 1000);

    const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
      ["year", 60 * 60 * 24 * 365],
      ["month", 60 * 60 * 24 * 30],
      ["week", 60 * 60 * 24 * 7],
      ["day", 60 * 60 * 24],
      ["hour", 60 * 60],
      ["minute", 60],
      ["second", 1],
    ];

    for (const [unit, secondsInUnit] of divisions) {
      const delta = diffInSeconds / secondsInUnit;
      if (Math.abs(delta) >= 1) {
        return rtf.format(Math.round(delta), unit);
      }
    }

    return rtf.format(0, "second");
  }

  useEffect(() => {
    const userLang = navigator.language || "en";
    const relativeTime = getRelativeTime(videos[index].snippet.publishedAt, userLang);
    setTimeString(relativeTime.charAt(0).toUpperCase() + relativeTime.slice(1));
  }, [index, videos]);

  const changeVideo = (direction: "next" | "prev") => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setIndex((prev) =>
        direction === "next" ? (prev + 1) % videos.length : (prev - 1 + videos.length) % videos.length,
      );
      setIsTransitioning(false);
    }, 300);
  };

  const currentVideo = videos[index];

  return (
    <div className="relative mx-auto flex max-w-2xl items-center justify-center space-x-4">
      <button
        aria-label="Previous video"
        onMouseUp={(e) => {
          if (e.button !== 0) return;
          changeVideo("prev");
        }}
        className="rounded-xl p-3 text-white hover:bg-[#1e1e1e] active:bg-[#212121]"
      >
        <ChevronLeftIcon strokeWidth={3} className="h-5 w-5" />
      </button>
      <div
        className="flex overflow-hidden rounded-sm bg-[#101010] shadow-md transition-opacity duration-300"
        style={{
          width: "1800px",
          height: "200px",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.6)",
          opacity: isTransitioning ? 0 : 1,
          transition: "opacity 300ms ease-in-out",
        }}
      >
        <iframe
          title="YouTube Video"
          key={currentVideo.id.videoId}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${currentVideo.id.videoId}?`}
          allowFullScreen
        />

        <div className="flex w-1/2 flex-col justify-center px-4 py-3">
          <h2 className="mb-1 line-clamp-3 text-base font-bold text-[#c3c3c3] antialiased">
            {currentVideo.snippet.title}
          </h2>
          <div className="mt-auto self-end text-sm text-[#6a6a6a] antialiased">{timeString}</div>
        </div>
      </div>
      <button
        aria-label="Next video"
        onMouseUp={(e) => {
          if (e.button !== 0) return;
          changeVideo("next");
        }}
        className="rounded-xl p-3 text-white hover:bg-[#1e1e1e] active:bg-[#212121]"
      >
        <ChevronRightIcon strokeWidth={3} className="h-5 w-5" />
      </button>
    </div>
  );
}
