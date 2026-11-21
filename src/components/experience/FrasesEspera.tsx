"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy } from "@/content/copy";
import type { Product } from "@/content/products";

const INTERVALO_MS = 5000;
const FINAL_DESDE_MS = 45_000;

function mezclar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Frases de marca que rotan mientras se genera la imagen.
 * - La primera es siempre la misma; el resto sale al azar sin repetir hasta agotarlas.
 * - "Ya casi." aparece recién cuando la espera supera los 45 segundos.
 * - No demoran nada: cuando la imagen está lista, la pantalla avanza en el acto.
 */
export function FrasesEspera({ product, compacto = false }: { product: Product; compacto?: boolean }) {
  const pool = useMemo(() => [...copy.procesando.frases, ...(product.frasesEspera ?? [])], [product.frasesEspera]);
  const [frase, setFrase] = useState<string>(copy.procesando.fraseInicial);
  const [n, setN] = useState(0);
  const cola = useRef<string[]>([]);
  const inicio = useRef(0);
  const finalMostrada = useRef(false);

  useEffect(() => {
    inicio.current = Date.now();
    cola.current = mezclar(pool);
    const t = setInterval(() => {
      let siguiente: string;
      if (!finalMostrada.current && Date.now() - inicio.current >= FINAL_DESDE_MS) {
        finalMostrada.current = true;
        siguiente = copy.procesando.fraseFinal;
      } else {
        if (cola.current.length === 0) cola.current = mezclar(pool);
        siguiente = cola.current.shift() as string;
      }
      setFrase(siguiente);
      setN((x) => x + 1);
    }, INTERVALO_MS);
    return () => clearInterval(t);
  }, [pool]);

  return (
    <p
      key={n}
      className={
        "frase-espera px-4 text-center font-light tracking-tight text-tinta " +
        (compacto ? "text-lg leading-snug" : "text-[26px] leading-tight sm:text-3xl")
      }
    >
      {frase}
    </p>
  );
}
