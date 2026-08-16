import { isSanityConfigured } from "@/sanity/env";
import { Studio } from "./studio";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div className="fixed inset-0 z-[200] grid place-items-center bg-[#f1fbfe] px-5">
        <div className="w-full max-w-xl rounded-[2rem] border border-[#063f5b]/10 bg-white p-8 shadow-[0_24px_60px_-28px_rgba(6,63,91,.45)] sm:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">MishBaby Studio</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#063f5b]">Connect your Sanity project</h1>
          <p className="mt-4 leading-7 text-[#063f5b]/65">Copy <code className="rounded bg-[#e8f8fc] px-1.5 py-1 text-sm font-bold">.env.example</code> to <code className="rounded bg-[#e8f8fc] px-1.5 py-1 text-sm font-bold">.env.local</code>, add your Sanity project ID, and restart the development server.</p>
          <a href="https://www.sanity.io/manage" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0]">Create or open a Sanity project</a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-white">
      <Studio />
    </div>
  );
}
