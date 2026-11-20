"use client";

import { useEffect, useState } from "react";
import { copy } from "@/content/copy";
import type { Product } from "@/content/products";

const INTERVALO_MS = 5000;

/**
 * Frases de marca que rotan mientras se genera la imagen.
 * No demoran nada: cuando la imagen está lista, la pantalla avanza en el acto
 * aunque no se hayan mostrado todas. Si la espera es larga, vuelven a empezar.
 */
export function FrasesEspera({ product, compacto = false }: { product: Product; compacto?: boolean }) {
  const frases = copy.procesando.frases
    .map((f) => (f === "{producto}" ? product.fraseEspera ?? "" : f))
    .filter(Boolean);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % frases.length), INTERVALO_MS);
    return () => clearInterval(t);
  }, [frases.length]);

  return (
    <p
      key={i}
      className={
        "frase-espera px-4 text-center font-light tracking-tight text-tinta " +
        (compacto ? "text-lg leading-snug" : "text-[26px] leading-tight sm:text-3xl")
      }
    >
      {frases[i]}
    </p>
  );
}
