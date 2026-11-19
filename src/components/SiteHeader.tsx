import Link from "next/link";
import { copy } from "@/content/copy";

export function SiteHeader() {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-end gap-2"
          aria-label={`${copy.marca}, ir al inicio`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/logotipo.svg" alt="" className="h-6 sm:h-7 w-auto" />
          <span className="pb-[3px] text-[11px] sm:text-xs font-medium tracking-[0.3em] text-gris-4">
            LAB
          </span>
        </Link>
      </div>
    </header>
  );
}
