import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[65vh] items-center overflow-hidden bg-[#f1fbfe] px-5 py-16 sm:px-8">
      <div className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 -z-10 size-72 rounded-full bg-[#d9f4ee]/75 blur-2xl" />

      <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-[.8fr_1.2fr] md:items-center">
        <div className="relative mx-auto grid size-64 place-items-center rounded-[3rem] bg-[#a8e8f5] shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)] sm:size-72">
          <div className="grid size-48 place-items-center rounded-[2.5rem] border border-white/65 bg-[#e8f8fc] sm:size-56">
            <div className="text-center">
              <span className="font-display text-7xl font-semibold tracking-[-0.06em] text-[#009dcc]">404</span>
              <span className="mt-2 block text-sm font-extrabold uppercase tracking-[0.14em] text-[#063f5b]/50">Little detour</span>
            </div>
          </div>
          <span className="absolute -right-3 -top-3 grid size-14 place-items-center rounded-full bg-white text-2xl text-[#009dcc] shadow-lg" aria-hidden="true">♡</span>
        </div>

        <div className="text-center md:text-left">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Page not found</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">This page wandered off.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#063f5b]/70 md:mx-0">The link may be outdated, or the page might still be taking shape. Let’s get you back to something helpful.</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <Link href="/" className="rounded-full bg-[#009dcc] px-6 py-3.5 text-center text-sm font-extrabold text-white transition hover:bg-[#0784b0]">Back to homepage</Link>
            <Link href="/categories" className="rounded-full border border-[#063f5b]/15 bg-white/75 px-6 py-3.5 text-center text-sm font-extrabold text-[#063f5b] transition hover:border-[#009dcc]">Explore categories</Link>
          </div>

          <Link href="/guides" className="mt-6 inline-flex text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">Or browse parenting guides <span className="ml-2" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
