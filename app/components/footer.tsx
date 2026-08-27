import Image from "next/image";
import Link from "next/link";
import { Brand } from "./brand";

const socialLinks = [
  {
    name: "Instagram",
    icon: "/social-media/instagram.png",
    url: "https://www.instagram.com/mishbabystore",
  },
  {
    name: "Facebook",
    icon: "/social-media/facebook.png",
    url: "https://www.facebook.com/profile.php?id=61567086625746",
  },
  {
    name: "YouTube",
    icon: "/social-media/youtube.png",
    url: "https://www.youtube.com/@MishBabyShop",
  },
  {
    name: "TikTok",
    icon: "/social-media/tiktok.png",
    url: "https://www.tiktok.com/@mishbaby_shop",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#063f5b]/10 bg-[#e8f8fc]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 sm:py-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#063f5b]/65">
            Thoughtful finds, clear guidance, and a little more calm for the
            parenting journey.
          </p>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.14em] text-[#063f5b]">
            Follow us
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {socialLinks.map((socialLink) => (
              <a
                key={socialLink.name}
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow MishBaby on ${socialLink.name} (opens in a new tab)`}
                className="grid size-11 place-items-center rounded-full border border-[#063f5b]/10 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#009dcc]/35 hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#009dcc]"
              >
                <Image
                  src={socialLink.icon}
                  alt=""
                  width={26}
                  height={26}
                  className="size-6.5 object-contain"
                />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em]">
            Explore
          </h2>
          <div className="mt-3 grid text-sm text-[#063f5b]/70 sm:mt-4">
            <Link className="flex min-h-10 items-center" href="/categories">Product categories</Link>
            <Link className="flex min-h-10 items-center" href="/amazon-finds">Amazon Finds</Link>
            <Link className="flex min-h-10 items-center" href="/aliexpress-finds">AliExpress Finds</Link>
            {/* <Link href="/collections">Curated collections</Link> */}
            <Link className="flex min-h-10 items-center" href="/guides">Parenting guides</Link>
            <Link className="flex min-h-10 items-center" href="/about">Our approach</Link>
            <Link className="flex min-h-10 items-center" href="/affiliate-disclosure">Affiliate disclosure</Link>
            <Link className="flex min-h-10 items-center" href="/privacy">Privacy policy</Link>
            <Link className="flex min-h-10 items-center" href="/terms">Terms of use</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em]">
            A note on links
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#063f5b]/65">
            MishBaby may earn a commission when you shop through eligible links.
          </p>
          <p className="mt-3 text-xs leading-5 text-[#063f5b]/55">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
      </div>
      <div className="border-t border-[#063f5b]/10 px-4 py-5 text-center text-xs leading-5 text-[#063f5b]/55 sm:px-5">
        © {new Date().getFullYear()} MishBaby. Made with care for growing
        families.
      </div>
    </footer>
  );
}
