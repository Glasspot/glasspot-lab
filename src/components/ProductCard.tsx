"use client";

import Link from "next/link";
import type { Product } from "@/content/products";
import { track } from "@/lib/analytics";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <Link
      href={`/p/${product.slug}`}
      onClick={() => track("product_selected", { product: product.slug })}
      className="group block rounded-2xl overflow-hidden bg-white border border-gris-1 hover:border-gris-2 transition-colors"
    >
      <div className="relative aspect-[4/3] bg-gris-1 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.portada.src}
          alt={product.portada.alt}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {product.estado === "proximamente" && (
          <span className="absolute top-3 left-3 rounded-full bg-tinta text-papel px-2.5 py-1 text-[11px] font-medium tracking-wide">
            Próximamente
          </span>
        )}
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <span className="text-[15px] font-medium leading-snug">{product.nombre}</span>
        {product.estado === "disponible" && (
          <span className="ml-auto text-xs text-gris-3 whitespace-nowrap">Probalo en tu espacio</span>
        )}
        <span aria-hidden className="text-xl transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
