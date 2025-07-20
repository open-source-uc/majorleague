export default function Loading() {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-5 py-15 lg:flex-row">
        <div className="w-full max-w-4xl">
          <div className="mb-4 h-12 w-3/4 animate-pulse rounded bg-gray-700" />
          <div className="w-full">
            <div className="mb-2 h-12 w-full animate-pulse rounded bg-gray-700" />
            <div className="mb-4 overflow-hidden rounded">
              <div className="mb-2 h-12 w-full animate-pulse bg-gray-700" />
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="mb-2 flex w-full">
                  <div className="h-16 w-full animate-pulse bg-gray-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-gray-700" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 w-full animate-pulse rounded bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="h-10 w-1/3 animate-pulse rounded bg-gray-700" />
      </div>
    </>
  );
}
