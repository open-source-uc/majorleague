"use client";

export default function LiveStreamPlayer() {
  // const [isLive, setIsLive] = useState<boolean | null>(null);
  // useEffect(() => {
  //   const checkLiveStatus = async () => {
  //     try {
  //       const res = await fetch("/api/youtube");
  //       const data = await res.json();
  //       setIsLive(data.isLive);
  //     } catch (err) {
  //       console.error("Error fetching live status:", err);
  //       setIsLive(false);
  //     }
  //   };
  //   checkLiveStatus();
  // }, []);
  // if (isLive === null) return null;
  // if (!isLive) return null;
  // return (
  //   <iframe
  //     title="YouTube LiveStream"
  //     width="50%"
  //     height="50%"
  //     src={`https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}`}
  //     allowFullScreen
  //   />
  // );
}
