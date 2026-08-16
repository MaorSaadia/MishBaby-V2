import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="MishBaby home">
      <Image src="/mb-logo.png" alt="MishBaby" width={150} height={60} className="h-11 w-auto object-contain" priority />
    </Link>
  );
}
