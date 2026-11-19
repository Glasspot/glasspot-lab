"use client";

import { copy } from "@/content/copy";
import { getActiveProducts, type Product } from "@/content/products";
import { track } from "@/lib/analytics";
import { ButtonLink } from "@/components/Button";

/** Mensaje después de completar la reserva. */
export function ReservaConfirmada({ product }: { product: Product }) {
  const t = copy.parteDelLab;
  const otro = getActiveProducts().find((p) => p.slug !== product.slug);
  return (
    <section className="py-10 text-center aparecer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/isotipo.svg" alt="" aria-hidden className="mx-auto mb-8 h-14 w-auto" />
      <h1 className="text-[28px] leading-tight sm:text-4xl font-light tracking-tight">{t.titulo}</h1>
      <div className="mt-5 mx-auto max-w-md space-y-3 text-[15px] text-gris-4 leading-relaxed">
        {t.parrafos.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="font-medium text-tinta">{t.destacado}</p>
        {t.gracias && <p>{t.gracias}</p>}
      </div>
      <p className="mt-6 mx-auto max-w-sm rounded-lg bg-gris-1 px-3 py-2 text-xs text-gris-4">
        Versión de prueba: tus datos todavía no se guardan ni se envían.
      </p>
      <div className="mt-10 max-w-xs mx-auto flex flex-col gap-3">
        <ButtonLink
          href={otro ? `/p/${otro.slug}` : "/"}
          variant="secundario"
          onClick={() => track("other_solutions_clicked", { product: product.slug, to: otro?.slug ?? "inicio" })}
        >
          {t.otras}
        </ButtonLink>
        <ButtonLink href="/" variant="texto" className="self-center">
          {copy.cierre.volverInicio}
        </ButtonLink>
      </div>
    </section>
  );
}
