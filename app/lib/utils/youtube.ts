import { CHANNEL_ID } from "@/lib/constants";
import { IVideo } from "@/lib/types/video";

export async function getYoutubeVideos() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    throw new Error("YOUTUBE_API_KEY isn't defined in environment variables.");
  }

  const params = new URLSearchParams({
    key: API_KEY,
    channelId: CHANNEL_ID,
    part: "snippet",
    order: "date",
    maxResults: "50",
    type: "video",
    q: "major league",
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error("YouTube API error:", res.statusText);
    throw new Error("Failed to fetch YouTube videos");
  }

  const data = await res.json();

  const filtered = data.items.filter(
    (item: IVideo) =>
      item.snippet.description?.toLowerCase().includes("major league") && item.snippet.liveBroadcastContent === "none",
  );

  return filtered.slice(0, 4);
}
