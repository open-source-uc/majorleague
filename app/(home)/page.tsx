import { Suspense } from "react";

import Hero from "../components/home/Hero";
import TextBar from "../components/home/TextBar";

export default async function HomePage() {
  return (
    <div>
      <div className="flex flex-col">
        <TextBar />
        <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200">...</div>}>
          <Hero />
        </Suspense>
      </div>
    </div>
  );
}
