"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/content/products";
import { getProduct } from "@/content/products";
import { getPriceVariant } from "@/lib/experiment";
import { PageViewTracker } from "@/components/PageViewTracker";
import { ButtonLink } from "@/components/Button";
import { copy } from "@/content/copy";
import { PriceBlock } from "./PriceBlock";
import { ReserveForm } from "./ReserveForm";
import { ReservaConfirmada } from "./ReservaConfirmada";

type Paso = "precio" | "formulario" | "listo";

/** Camino B — acceso directo al precio y la reserva (sin cámara, IA ni 3D). */
export function DirectPrice({ slug }: { slug: string }) {
  const product = getProduct(slug) as Product;
  const [precio, setPrecio] = useState<{ index: number; precio: number } | null>(null);
  const [paso, setPaso] = useState<Paso>("precio");

  useEffect(() => {
    setPrecio(getPriceVariant(product));
  }, [product]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [paso]);

  if (!precio) return null;

  return (
    <div className="mx-auto max-w-xl px-5">
      <PageViewTracker page={`precio-directo:${paso}`} product={product.slug} />

      {paso === "precio" && (
        <>
          <div className="flex items-center gap-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.concepto.src} alt="" aria-hidden className="h-20 w-20 rounded-xl object-cover border border-gris-1" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gris-3">{product.nombre}</p>
              <p className="mt-1 text-sm text-gris-4 leading-snug">{product.bajada}</p>
            </div>
          </div>
          <PriceBlock
            product={product}
            precio={precio.precio}
            variante={precio.index}
            recorrido="directo"
            onReservar={() => setPaso("formulario")}
          />
          <div className="mt-8 flex flex-col items-center gap-2">
            <ButtonLink href={`/p/${product.slug}/experiencia`} variant="texto">
              {copy.concepto.cta}
            </ButtonLink>
            <ButtonLink href={`/p/${product.slug}`} variant="texto">
              {copy.concepto.volver}
            </ButtonLink>
          </div>
        </>
      )}

      {paso === "formulario" && (
        <ReserveForm
          product={product}
          precio={precio.precio}
          variante={precio.index}
          recorrido="directo"
          onDone={() => setPaso("listo")}
          onVolver={() => setPaso("precio")}
        />
      )}

      {paso === "listo" && <ReservaConfirmada product={product} />}
    </div>
  );
}
