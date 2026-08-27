export default function Loading() {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="bg-[#f7fcfe] px-4 py-10 sm:px-8 sm:py-16"
    >
      <div className="mx-auto max-w-6xl animate-pulse">
        <span className="sr-only">Loading page…</span>
        <div className="h-3 w-28 rounded-full bg-[#a8e8f5]/70" />
        <div className="mt-4 h-10 w-3/4 max-w-lg rounded-2xl bg-[#d2f2f9] sm:h-12" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-[#e2f7fc]" />
        <div className="mt-2 h-4 w-2/3 max-w-lg rounded-full bg-[#e2f7fc]" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-[#063f5b]/10 bg-white sm:rounded-[2rem]">
              <div className="aspect-square bg-[#e8f8fc]" />
              <div className="space-y-3 p-4 sm:p-5">
                <div className="h-4 w-4/5 rounded-full bg-[#d2f2f9]" />
                <div className="h-3 w-full rounded-full bg-[#e2f7fc]" />
                <div className="h-3 w-2/3 rounded-full bg-[#e2f7fc]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
