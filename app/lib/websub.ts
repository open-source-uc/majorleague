import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const hubUrl = "https://pubsubhubbub.appspot.com/subscribe";
const callbackUrl = `${BASE_URL}/api/youtube`;

export async function subscribe() {
    try {
        const res = await axios.post(
            hubUrl,
            new URLSearchParams({
                "hub.mode": "subscribe",
                "hub.topic": `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
                "hub.callback": callbackUrl,
                "hub.verify": "async"
            }),
            {
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        console.log("Subscription sent with success:", res.status);
    } catch (err: any) {
        console.log("An error has ocurred while subscribing to the channel videos:", err.response?.data || err.message);
    }
}