"use client";

import { copy } from "@/content/copy";
import { track } from "@/lib/analytics";
import { ButtonLink } from "@/components/Button";

/** Botón secundario «Ver precio de lanzamiento» (camino B). */
export function PriceLink({ slug }: { slug: string }) {
  return (
    <ButtonLink
      href={`/p/${slug}/precio`}
      variant="secundario"
      onClick={() => track("price_direct_clicked", { product: slug })}
    >
      {copy.concepto.ctaPrecio}
    </ButtonLink>
  );
}
