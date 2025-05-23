"use client";

import { useEffect, useState } from "react";

const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

export default function LiveStreamPlayer() {
    const [isLive, setIsLive] = useState<boolean | null>(null);

    useEffect(() => {
        const checkLiveStatus = async () => {
            try {
                const res = await fetch("/api/youtube");
                const data = await res.json();
                setIsLive(data.isLive);
            } catch (err) {
                console.error("Error fetching live status:", err);
                setIsLive(false);
            }
        };

        checkLiveStatus();
    }, []);

    if (isLive === null) return;
    if (!isLive) return;

    return (
        <iframe
            width="50%"
            height="50%"
            src={`https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}`}
            allowFullScreen
        />
    );
}