import Link from "next/link";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { categories } from "./category-data";

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-16 sm:px-8 md:py-22">
          <div className="absolute -right-16 -top-16 -z-10 size-80 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Explore by category</p>
            <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">A thoughtful start for every little stage.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#063f5b]/70">Find the baby essentials, everyday helpers, and joyful discoveries that fit your family right now.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="group relative min-h-70 overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white p-7 shadow-[0_16px_36px_-28px_rgba(6,63,91,.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-26px_rgba(6,63,91,.35)]">
                <div className={`absolute -right-8 -top-8 grid size-36 place-items-center rounded-full ${category.color} text-5xl text-[#009dcc] transition-transform duration-300 group-hover:scale-110`} aria-hidden="true">{category.symbol}</div>
                <div className="relative flex h-full flex-col justify-end">
                  <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Discover</span>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">{category.name}</h2>
                  <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#063f5b]/65">{category.description}</p>
                  <span className="mt-5 text-sm font-extrabold text-[#009dcc]">Explore category <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 md:pb-22">
          <div className="rounded-[2rem] bg-[#063f5b] px-7 py-11 text-center text-white sm:px-12">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Growing with you</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">More useful finds and helpful guidance are on the way.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/70">We’re building each category thoughtfully, so you can spend less time searching and more time with your little one.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
