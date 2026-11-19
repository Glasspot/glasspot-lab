"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/content/copy";
import type { Product, UsoProducto } from "@/content/products";
import { track } from "@/lib/analytics";

export type UsoEstado = "idle" | "cargando" | "listo" | "error";

/**
 * Carrusel de usos estilo Instagram (scroll horizontal con "snap", sin librerías).
 * Cada slide tiene el botón "Ver este uso en mi espacio".
 */
export function UsageCarousel({
  product,
  estados,
  onVerEnMiEspacio,
}: {
  product: Product;
  estados: Record<string, UsoEstado>;
  onVerEnMiEspacio: (uso: UsoProducto) => void;
}) {
  const vistos = useRef(new Set<string>());
  const pista = useRef<HTMLDivElement>(null);

  // En PC (mouse) no hay deslizamiento táctil: flechas para moverse.
  function mover(dir: 1 | -1) {
    const el = pista.current;
    if (!el) return;
    const card = el.querySelector("article");
    const paso = card ? card.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * paso, behavior: "smooth" });
  }
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.uso!;
          if (e.isIntersecting && !vistos.current.has(id)) {
            vistos.current.add(id);
            track("usage_slide_viewed", { product: product.slug, usage: id });
          }
        }
      },
      { threshold: 0.6 },
    );
    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [product.slug]);

  return (
    <section className="mt-10" aria-label={copy.usos.titulo}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{copy.usos.titulo}</h2>
        <div className="hidden [@media(hover:hover)]:flex gap-2">
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Ver el uso anterior"
            className="h-10 w-10 rounded-full border border-gris-2 hover:border-tinta text-lg"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Ver el uso siguiente"
            className="h-10 w-10 rounded-full border border-gris-2 hover:border-tinta text-lg"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={pista}
        className="mt-4 -mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {product.usos.map((uso) => {
          const estado = estados[uso.id] ?? "idle";
          return (
            <article
              key={uso.id}
              data-uso={uso.id}
              ref={(el) => {
                refs.current[uso.id] = el;
              }}
              className="snap-center shrink-0 w-[78%] sm:w-[46%] rounded-2xl overflow-hidden bg-white border border-gris-1"
            >
              <div className="relative aspect-[4/5] bg-gris-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uso.imagen.src} alt={uso.imagen.alt} loading="lazy" className="h-full w-full object-cover" />
                {/ilustrativa/i.test(uso.imagen.etiqueta) && (
                  <span className="absolute top-3 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white">
                    Imagen ilustrativa
                  </span>
                )}
                {product.usosConTitulo && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-12">
                    <p className="text-papel text-xl font-light tracking-tight">{uso.titulo}</p>
                  </div>
                )}
              </div>
              <div className="p-3">
                <button
                  type="button"
                  disabled={estado === "cargando" || estado === "listo"}
                  onClick={() => onVerEnMiEspacio(uso)}
                  className="w-full min-h-11 rounded-full border border-tinta text-[14px] font-medium hover:bg-gris-1 disabled:opacity-50"
                >
                  {estado === "cargando" ? "Preparando…" : estado === "listo" ? "Listo ↓" : copy.usos.verEnMiEspacio}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
