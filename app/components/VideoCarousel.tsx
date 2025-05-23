"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function VideoCarousel({ videos }: { videos: any[] }) {
    const [index, setIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const changeVideo = (direction: "next" | "prev") => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        setTimeout(() => {
            setIndex((prev) =>
                direction === "next"
                ? (prev + 1) % videos.length
                : (prev - 1 + videos.length) % videos.length
            );
            setIsTransitioning(false);
        }, 300);
    };

    const currentVideo = videos[index];

    return (
        <div className="flex items-center justify-center space-x-4 max-w-xl mx-auto relative">
            <button
                onClick={() => changeVideo("prev")}
                disabled={isTransitioning}
                className={
                    `hover:bg-[#1e1e1e] text-white p-3 rounded-full ${
                    isTransitioning ? "opacity-50 cursor-not-allowed" : ""}`
                }
            >
                <ChevronLeftIcon strokeWidth={3} className="h-5 w-5" />
            </button>
            <div
                className={
                    `flex bg-[#1e1e1e] shadow-md rounded-xl overflow-hidden transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"}`
                }
                style={{ width: "1800px", minHeight: "0" }}
            >
                <a
                    href={`https://youtube.com/watch?v=${currentVideo.id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-1/2 aspect-video block rounded-l-xl overflow-hidden"
                >
                    <Image
                        src={currentVideo.snippet.thumbnails.medium.url}
                        alt="video-thumbnail"
                        fill
                    />
                </a>

                <div className="flex flex-col justify-center px-4 py-2 w-1/2">
                    <a href={`https://youtube.com/watch?v=${currentVideo.id.videoId}`}>
                        <h2 className="text-white text-xs font-semibold mb-1">
                            {currentVideo.snippet.title}
                        </h2>
                    </a>
                    <p className="text-gray-400 text-xs line-clamp-2">
                        {currentVideo.snippet.description}
                    </p>
                    <div className="text-gray-400 text-[10px] mt-auto self-end">
                        {new Date(currentVideo.snippet.publishedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
            <button
                onClick={() => changeVideo("next")}
                disabled={isTransitioning}
                className={
                    `hover:bg-[#1e1e1e] text-white p-3 rounded-full ${
                    isTransitioning ? "opacity-50 cursor-not-allowed" : ""}`
                }
            >
                <ChevronRightIcon strokeWidth={3} className="h-5 w-5" />
            </button>
        </div>
    );
}
