"use client";

import { useEffect, useRef, useState } from "react";
import { copy } from "@/content/copy";
import type { Product, UsoProducto } from "@/content/products";
import { getSessionId, track } from "@/lib/analytics";
import { getPriceVariant } from "@/lib/experiment";
import { GenerationError, getImageProvider, type GenerationResult, type MockMode } from "@/lib/imageProvider";
import type { PreparedImage } from "@/lib/prepareImage";
import { Button } from "@/components/Button";
import { ProvisionalTag } from "@/components/ProvisionalTag";
import { PriceBlock } from "@/components/reserva/PriceBlock";
import { Viewer3D } from "@/components/Viewer3D";
import { FrasesEspera } from "./FrasesEspera";
import { UsageCarousel, type UsoEstado } from "./UsageCarousel";

type Answer = "nueva" | "conocida";
export type ContinueMode = { modo: "reserva"; precio: number; variante: number } | { modo: "novedades" };

type UsoResultado = { uso: UsoProducto; estado: UsoEstado; imagen?: string; mensaje?: string; esPrueba?: boolean };

/** Pantalla 5 — Resultado personalizado, usos, precio y pregunta de percepción. */
export function ResultStep({
  product,
  result,
  photo,
  mode,
  onContinue,
}: {
  product: Product;
  result: GenerationResult;
  photo: PreparedImage | null;
  mode: MockMode;
  onContinue: (m: ContinueMode) => void;
}) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [usos, setUsos] = useState<Record<string, UsoResultado>>({});
  const [precio, setPrecio] = useState<{ index: number; precio: number } | null>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  // Variante de precio de la sesión (test A/B)
  useEffect(() => {
    setPrecio(getPriceVariant(product));
  }, [product]);

  function answerWith(a: Answer) {
    if (answer) return;
    setAnswer(a);
    track("perception_question_answered", { product: product.slug, answer: a });
  }

  async function verEnMiEspacio(uso: UsoProducto) {
    if (!photo) return;
    track("usage_in_my_space_requested", { product: product.slug, usage: uso.id });
    setUsos((u) => ({ ...u, [uso.id]: { uso, estado: "cargando" } }));
    setTimeout(() => resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    try {
      const r = await getImageProvider(mode).generate({
        photo: photo.blob,
        photoWidth: photo.width,
        photoHeight: photo.height,
        product,
        escenario: uso.id,
        sessionId: getSessionId(),
        signal: AbortSignal.timeout(170_000),
      });
      track("usage_generation_completed", { product: product.slug, usage: uso.id, duration_ms: r.durationMs });
      setUsos((u) => ({ ...u, [uso.id]: { uso, estado: "listo", imagen: r.imageUrl, esPrueba: r.esPrueba } }));
    } catch (e) {
      const reason = e instanceof GenerationError ? e.reason : "provider";
      track("usage_generation_failed", { product: product.slug, usage: uso.id, reason });
      const mensaje = e instanceof GenerationError && e.userMessage ? e.userMessage : copy.usos.error;
      setUsos((u) => ({ ...u, [uso.id]: { uso, estado: "error", mensaje } }));
    }
  }

  const estados = Object.fromEntries(Object.entries(usos).map(([k, v]) => [k, v.estado]));
  const generados = Object.values(usos);

  return (
    <section className="aparecer">
      {/* Imagen personalizada */}
      <figure>
        <div className="relative rounded-2xl overflow-hidden border border-gris-1 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.imageUrl}
            alt={`Visualización de ${product.nombre} en tu espacio`}
            className="w-full max-h-[70vh] object-contain"
          />
          {result.esPrueba && <ProvisionalTag forzar className="absolute top-3 left-3">Resultado de prueba</ProvisionalTag>}
        </div>
        <figcaption className="mt-2 text-xs text-gris-3 leading-relaxed">{copy.resultado.aviso}</figcaption>
      </figure>

      {/* Pregunta de percepción: justo después del "wow" */}
      <div className="mt-8 rounded-2xl bg-white border border-gris-1 p-5">
        <h2 className="text-lg font-medium leading-snug">{copy.resultado.pregunta}</h2>
        <div className="mt-4 flex flex-col gap-3" role="group" aria-label={copy.resultado.pregunta}>
          {(Object.keys(copy.resultado.opciones) as Answer[]).map((key) => {
            const selected = answer === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                disabled={!!answer && !selected}
                onClick={() => answerWith(key)}
                className={`min-h-12 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${
                  selected ? "border-tinta bg-tinta text-papel" : "border-gris-2 hover:border-tinta disabled:opacity-40"
                }`}
              >
                {copy.resultado.opciones[key]}
              </button>
            );
          })}
        </div>
        {answer && <p className="mt-4 text-sm text-gris-4 aparecer">{copy.resultado.graciasRespuesta}</p>}
      </div>

      {/* Producto y beneficios */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-light tracking-tight">{product.nombre}</h1>
          {product.nombreProvisional && <ProvisionalTag>Nombre provisional</ProvisionalTag>}
        </div>
        <ul className="mt-5 divide-y divide-gris-1 border-y border-gris-1">
          {product.beneficios.map((b) => (
            <li key={b.titulo} className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[15px] font-medium">{b.titulo}</h2>
                {b.provisional && <ProvisionalTag />}
              </div>
              <p className="mt-1 text-sm text-gris-4 leading-relaxed">{b.texto}</p>
            </li>
          ))}
        </ul>
        {product.datosTecnicos.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {product.datosTecnicos.map((d) => (
              <div key={d.nombre} className="contents">
                <dt className="text-gris-3">{d.nombre}</dt>
                <dd>{d.valor}</dd>
              </div>
            ))}
          </dl>
        )}
        {product.modelo3d && (
          <Viewer3D src={product.modelo3d} alt={`Modelo 3D de ${product.nombre}`} product={product.slug} orbita={product.orbita3d} />
        )}
      </div>

      {/* Carrusel de usos */}
      {product.usos.length > 0 && (
        <UsageCarousel product={product} estados={estados} onVerEnMiEspacio={verEnMiEspacio} />
      )}

      {/* Usos generados en el espacio del visitante */}
      <div ref={resultadosRef} className="scroll-mt-6">
        {generados.map(({ uso, estado, imagen, mensaje, esPrueba }) => (
          <figure key={uso.id} className="mt-6 aparecer">
            <p className="text-xs uppercase tracking-[0.16em] text-gris-3">
              {copy.usos.enTuEspacio} · {uso.titulo}
            </p>
            <div className="mt-2 relative rounded-2xl overflow-hidden border border-gris-1 bg-white min-h-40 flex items-center justify-center">
              {estado === "cargando" && (
                <div className="py-14 flex flex-col items-center gap-4">
                  <div className="relative h-16 w-16" aria-hidden>
                    <div className="respiracion absolute inset-0 rounded-full bg-[radial-gradient(circle_at_40%_35%,#ffffff_0%,#e9e7e2_45%,#bdb9b0_100%)]" />
                  </div>
                  <span className="sr-only">{copy.usos.preparando}</span>
                  <div className="min-h-14 flex items-center">
                    <FrasesEspera product={product} compacto />
                  </div>
                </div>
              )}
              {estado === "listo" && imagen && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagen} alt={`${uso.titulo} en tu espacio`} className="w-full max-h-[70vh] object-contain" />
                  {esPrueba && <ProvisionalTag forzar className="absolute top-3 left-3">Resultado de prueba</ProvisionalTag>}
                </>
              )}
              {estado === "error" && (
                <div className="p-6 text-center">
                  <p className="text-sm text-gris-4">{mensaje}</p>
                  <Button variant="texto" onClick={() => verEnMiEspacio(uso)}>
                    {copy.usos.reintentar}
                  </Button>
                </div>
              )}
            </div>
            {estado === "listo" && (
              <figcaption className="mt-2 text-xs text-gris-3">{copy.resultado.aviso}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Precio de lanzamiento + reserva (test A/B de precio) */}
      {precio ? (
        <div className="mt-12">
          <PriceBlock
            product={product}
            precio={precio.precio}
            variante={precio.index}
            recorrido="interactivo"
            onReservar={() => onContinue({ modo: "reserva", precio: precio.precio, variante: precio.index })}
            onAhoraNo={() => onContinue({ modo: "novedades" })}
          />
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-2">
          <Button onClick={() => onContinue({ modo: "novedades" })}>{copy.resultado.continuar}</Button>
        </div>
      )}
    </section>
  );
}
