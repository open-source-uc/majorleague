import type { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ADMIN_USER: string;
    USER_TOKEN: string;
    YOUTUBE_API_KEY: string;
  }
}

export {};
