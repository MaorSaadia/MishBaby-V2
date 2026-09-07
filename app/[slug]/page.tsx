import type { Metadata } from "next";
import ProductPage, {
  generateMetadata as generateProductMetadata,
  generateStaticParams,
} from "@/app/products/[slug]/page";

export { generateStaticParams };

type RootProductPageProps = PageProps<"/[slug]">;

export function generateMetadata(props: RootProductPageProps): Promise<Metadata> {
  return generateProductMetadata(props);
}

export default function RootProductPage(props: RootProductPageProps) {
  return ProductPage(props);
}
