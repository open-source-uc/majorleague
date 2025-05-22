import { NextRequest } from "next/server";
import { subscribe } from "@/app/lib/websub";

export async function GET(req: NextRequest) {
    try {
        await subscribe();
        return new Response("Subscribed successfully", { status: 200 });
    } catch (error: any) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}