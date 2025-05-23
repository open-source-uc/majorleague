export async function getYoutubeVideos() {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=50&type=video&q=major league`;

    const res = await fetch(url, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        console.error("YouTube API error:", res.statusText);
        throw new Error("Failed to fetch YouTube videos");
    }

    const data = await res.json();

    const filtered = data.items.filter(
        (item: any) =>
        item.snippet.description?.toLowerCase().includes("major league")
    );

    return filtered;
}
