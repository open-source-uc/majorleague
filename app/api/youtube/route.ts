import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const topic = searchParams.get("hub.topic");

  if (mode === "subscribe" || mode === "unsubscribe") {
    console.log(`[WebSub] ${mode} request received for topic ${topic}`);
    return new Response(challenge, { status: 200 });
  }

  return new Response("Invalid hub.mode", { status: 400 });
}

export async function POST(req: NextRequest) {
  const xml = await req.text();

  console.log("[WebSub] Received notification:");
  console.log(xml);

  return new Response(null, { status: 200 });
}