interface IVideoId {
  videoId: string;
}

interface ISnippet {
  title: string;
  description: string;
  liveBroadcastContent: string;
  publishedAt: string;
}

export interface IVideo {
  snippet: ISnippet;
  id: IVideoId;
}
