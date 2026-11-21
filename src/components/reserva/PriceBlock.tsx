"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/content/copy";
import { formatPrice, type Product } from "@/content/products";
import { track } from "@/lib/analytics";
import type { Recorrido } from "@/lib/journey";

/**
 * Sección de precio de lanzamiento. Es la misma en los dos recorridos
 * (experiencia interactiva y acceso directo).
 */
export function PriceBlock({
  product,
  precio,
  variante,
  recorrido,
  onReservar,
  onAhoraNo,
}: {
  product: Product;
  precio: number;
  variante: number;
  recorrido: Recorrido;
  onReservar: () => void;
  onAhoraNo?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // price_viewed: cuando el precio entra en pantalla
  useEffect(() => {
    if (!ref.current) return;
    let sent = false;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !sent) {
          sent = true;
          track("price_viewed", { product: product.slug, price: precio, variant: variante, path: recorrido });
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [precio, variante, recorrido, product.slug]);

  return (
    <section ref={ref} aria-label={copy.precio.etiqueta} className="rounded-2xl bg-white border border-gris-1 p-6 sm:p-8 aparecer">
      <p className="text-xs uppercase tracking-[0.18em] text-gris-3">{copy.precio.etiqueta}</p>
      <p className="mt-2 text-[40px] leading-none font-light tracking-tight">{formatPrice(precio, product.moneda)}</p>
      <p className="mt-3 text-lg font-light text-tinta">{copy.precio.bajada}</p>

      <div className="mt-6 space-y-3 border-t border-gris-1 pt-6 text-[15px] leading-relaxed text-gris-4">
        {copy.precio.parrafos.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="font-medium text-tinta">{copy.precio.destacado}</p>
        {copy.precio.anotarse && <p>{copy.precio.anotarse}</p>}
        <p className="text-sm text-gris-3">
          {copy.precio.sinPagos} {copy.precio.sinFecha}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          track("reserve_clicked", { product: product.slug, price: precio, variant: variante, path: recorrido });
          onReservar();
        }}
        className="mt-7 w-full min-h-12 rounded-full bg-tinta text-papel text-[15px] font-medium hover:bg-gris-4 transition-colors"
      >
        {copy.precio.reservar}
      </button>
      {onAhoraNo && (
        <button
          type="button"
          onClick={() => {
            track("reserve_declined", { product: product.slug, price: precio, variant: variante, path: recorrido });
            onAhoraNo();
          }}
          className="mt-3 w-full min-h-10 text-sm text-gris-3 underline underline-offset-4 hover:text-tinta"
        >
          {copy.precio.ahoraNo}
        </button>
      )}
    </section>
  );
}
