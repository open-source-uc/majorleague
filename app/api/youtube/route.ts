import { NextResponse } from "next/server";

export async function GET() {
    const CHANNEL_ID = "UCyTQCtnLOKhhN_vQmOZseDg";

    if (!CHANNEL_ID) {
        return NextResponse.json({ error: "Missing channel ID" }, { status: 500 });
    }

    try {
        const liveCheckURL = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}`;
        const res = await fetch(liveCheckURL);
        const text = await res.text();

        let isLive = !text.includes('\\"previewPlayabilityStatus\\":{\\"status\\":\\"ERROR\\"');
        if (isLive) {
            isLive = text.toLowerCase().includes("major league")
        }

        return NextResponse.json({ isLive });
    } catch (error) {
        return NextResponse.json({ error: "Failed to check live status" }, { status: 500 });
    }
}