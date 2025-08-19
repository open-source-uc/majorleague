export function extractYouTubeVideoId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (host.endsWith("youtube.com")) {
      // https://www.youtube.com/watch?v=VIDEOID
      const vParam = url.searchParams.get("v");
      if (vParam) return vParam;

      // https://www.youtube.com/embed/VIDEOID
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2 && pathParts[0] === "embed") {
        return pathParts[1] || null;
      }

      // https://www.youtube.com/shorts/VIDEOID
      if (pathParts.length >= 2 && pathParts[0] === "shorts") {
        return pathParts[1] || null;
      }

      // https://www.youtube.com/live/VIDEOID
      if (pathParts.length >= 2 && pathParts[0] === "live") {
        return pathParts[1] || null;
      }
    }

    // Fallback: try to match typical 11-char YouTube id in the string
    const match = rawUrl.match(/[A-Za-z0-9_-]{11}/);
    return match ? match[0] : null;
  } catch {
    const match = rawUrl.match(/[A-Za-z0-9_-]{11}/);
    return match ? match[0] : null;
  }
}

export async function fetchYouTubeOEmbedByUrl(youtubeUrl: string): Promise<{
  title?: string;
  thumbnail_url?: string;
}> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return {};
    const data = (await res.json()) as { title?: string; thumbnail_url?: string };
    return { title: data.title, thumbnail_url: data.thumbnail_url };
  } catch {
    return {};
  }
}


