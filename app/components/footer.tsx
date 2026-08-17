import Link from "next/link";
import { Brand } from "./brand";

export function Footer() {
  return <footer className="border-t border-[#063f5b]/10 bg-[#e8f8fc]"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]"><div><Brand /><p className="mt-4 max-w-xs text-sm leading-6 text-[#063f5b]/65">Thoughtful finds, clear guidance, and a little more calm for the parenting journey.</p></div><div><h2 className="text-sm font-extrabold uppercase tracking-[0.14em]">Explore</h2><div className="mt-4 grid gap-2 text-sm text-[#063f5b]/70"><Link href="/categories">Product categories</Link><Link href="/guides">Parenting guides</Link><Link href="/about">Our approach</Link></div></div><div><h2 className="text-sm font-extrabold uppercase tracking-[0.14em]">A note on links</h2><p className="mt-4 text-sm leading-6 text-[#063f5b]/65">MishBaby may earn a commission when you shop through our links, at no extra cost to you.</p></div></div><div className="border-t border-[#063f5b]/10 px-5 py-5 text-center text-xs text-[#063f5b]/55">© {new Date().getFullYear()} MishBaby. Made with care for growing families.</div></footer>;
}
