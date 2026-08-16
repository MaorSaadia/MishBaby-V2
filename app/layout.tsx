import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MishBaby | Thoughtful finds for little ones",
  description: "MishBaby helps parents discover thoughtful products and trusted guidance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
