export const siteConfig = {
  name: "MishBaby",
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, ""),
  title: "MishBaby | Thoughtful finds for little ones",
  description: "MishBaby helps parents discover thoughtful baby products, practical guides, and offers from multiple merchants.",
};
