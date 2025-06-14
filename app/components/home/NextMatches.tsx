export default function NextMatches() {
  const nextMatches = {
    matches: [
      {
        local: "MINERHAM FOREST",
        localLogo: "🌲",
        visitor: "ATLÉTICO BYTE",
        visitorLogo: "🛡️",
        date: "12/07",
        time: "5:00 p.m.",
      },
      {
        local: "OLD BOYS",
        localLogo: "⚪",
        visitor: "ATLÉTICO BYTE",
        visitorLogo: "🛡️",
        date: "14/07",
        time: "4:00 p.m.",
      },
      {
        local: "MINERHAM FOREST",
        localLogo: "🌲",
        visitor: "ROBOVOLT UNITED",
        visitorLogo: "⚡",
        date: "17/07",
        time: "3:00 p.m.",
      },
    ],
  };
  return (
    <div className="bg-background-header flex flex-col gap-6 rounded-lg px-6 py-4 md:px-12">
      <p className="border-foreground w-full border-b-2 py-2 text-xl font-bold">FUTUROS PARTIDOS</p>
      {nextMatches.matches.map((match, index) => (
        <div key={index} className="border-foreground flex w-full items-center justify-between gap-2.5 border-b-2 pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm text-white">
                {match.localLogo}
              </div>
              <p className="text-md font-bold">{match.local}</p>
            </div>
            <div className="flex items-center gap-3 p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                {match.visitorLogo}
              </div>
              <p className="text-md font-bold">{match.visitor}</p>
            </div>
          </div>
          <div className="border-foreground flex flex-col items-center border-l-2 p-2.5">
            <p className="text-md">{match.date}</p>
            <p className="text-md">{match.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
