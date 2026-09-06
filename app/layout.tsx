import type { Metadata } from "next";
import { Footer } from "./components/footer";
import { Navbar } from "./components/navbar";
import { getProductSearchItems } from "@/lib/products";
import { getPublishedCategories } from "@/lib/categories";
import { siteConfig } from "@/lib/site";
import { FavoritesProvider } from "./components/favorites-provider";
import "./globals.css";

const themeScript = `(() => {
  try {
    const root = document.documentElement;
    if (window.location.pathname.startsWith("/studio")) {
      root.dataset.theme = "light";
      root.style.colorScheme = "light";
      return;
    }
    const storedTheme = window.localStorage.getItem("mishbaby-theme");
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch {}
})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [productSearchItems, categories] = await Promise.all([
    getProductSearchItems(),
    getPublishedCategories(),
  ]);

  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="flex min-h-full flex-col">
        <FavoritesProvider>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Navbar products={productSearchItems} categories={categories} />
          <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
          <Footer />
        </FavoritesProvider>
      </body>
    </html>
  );
}
