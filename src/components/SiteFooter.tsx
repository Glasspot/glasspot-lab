import Link from "next/link";
import { copy } from "@/content/copy";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-gris-1 mt-12">
      <div className="mx-auto max-w-5xl px-5 py-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gris-3">
        <p>{copy.pie.lema}</p>
        <Link href="/privacidad" className="underline underline-offset-4 hover:text-tinta">
          {copy.pie.privacidad}
        </Link>
      </div>
    </footer>
  );
}
