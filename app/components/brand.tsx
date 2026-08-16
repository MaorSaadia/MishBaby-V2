import Link from "next/link";

export function Brand() {
  return <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="MishBaby home"><span className="grid size-9 place-items-center rounded-full bg-[#f6c9c0] text-[#25433a] transition-transform group-hover:rotate-6"><svg viewBox="0 0 32 32" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M16 25.5s-9-4.8-9-11.1C7 11.7 9 10 11.4 10c1.8 0 3.5 1 4.6 2.6C17.1 11 18.8 10 20.6 10 23 10 25 11.7 25 14.4c0 6.3-9 11.1-9 11.1Z" /><path d="M12.3 7.7c.8-1.2 2-1.7 3.7-1.7 1.6 0 2.9.6 3.7 1.7" /></svg></span><span className="font-display text-[1.45rem] font-semibold tracking-[-0.05em] text-[#25433a]">MishBaby</span></Link>;
}
