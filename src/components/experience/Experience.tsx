"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProduct } from "@/content/products";
import type { GenerationResult, MockMode } from "@/lib/imageProvider";
import { createMockProvider } from "@/lib/imageProvider/mockProvider";
import { fetchAsBlob, prepareImage, type PreparedImage } from "@/lib/prepareImage";
import { PageViewTracker } from "@/components/PageViewTracker";
import { PhotoStep } from "./PhotoStep";
import { ProcessingStep } from "./ProcessingStep";
import { ResultStep } from "./ResultStep";
import { ContactStep } from "./ContactStep";
import { ClosingStep } from "./ClosingStep";
import { ReserveForm } from "@/components/reserva/ReserveForm";
import { ReservaConfirmada } from "@/components/reserva/ReservaConfirmada";
import { track } from "@/lib/analytics";
import { marcarExperienciaUsada } from "@/lib/journey";
import type { ContinueMode } from "./ResultStep";

export type Step = "foto" | "procesando" | "resultado" | "contacto" | "cierre";
const STEPS: Step[] = ["foto", "procesando", "resultado", "contacto", "cierre"];
const MODES: MockMode[] = ["normal", "error", "demora", "lento"];
const DEMO_PHOTO = "/demo/foto-demo.jpg";

/**
 * Controla el recorrido de las pantallas 3 a 7.
 *
 * Modo prueba por URL (solo para revisar pantallas):
 *   ?paso=procesando|resultado|contacto|cierre  → abre directamente esa pantalla
 *                                                 usando una foto de demostración
 *   ?simular=error|demora|lento                 → fuerza el comportamiento de la
 *                                                 generación simulada
 */
export function Experience({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const params = useSearchParams();
  const pasoParam = params.get("paso") as Step | null;
  const simularParam = params.get("simular") as MockMode | null;
  const mode: MockMode = simularParam && MODES.includes(simularParam) ? simularParam : "normal";

  const [step, setStep] = useState<Step>("foto");
  const [photo, setPhoto] = useState<PreparedImage | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [cierre, setCierre] = useState<"reserva" | "suscripcion" | null>(null);
  const [modoContacto, setModoContacto] = useState<ContinueMode>({ modo: "novedades" });
  const jumping = !!pasoParam && STEPS.includes(pasoParam) && pasoParam !== "foto";
  const [ready, setReady] = useState(!jumping);

  // Salto directo a una pantalla (modo prueba)
  useEffect(() => {
    if (!pasoParam || !STEPS.includes(pasoParam) || pasoParam === "foto") return;
    let cancelled = false;
    (async () => {
      const demo = await prepareImage(await fetchAsBlob(DEMO_PHOTO));
      if (cancelled) return;
      setPhoto(demo);
      if (pasoParam !== "procesando") {
        // Genera el resultado simulado para poder revisar la pantalla elegida
        const r = await createMockProvider("normal")
          .generate({
            photo: demo.blob,
            photoWidth: demo.width,
            photoHeight: demo.height,
            product,
            signal: AbortSignal.timeout(10_000),
          })
          .catch(() => null);
        if (cancelled) return;
        setResult(r);
      }
      setStep(pasoParam);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasoParam]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const iniciado = useRef(false);
  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    track("experience_started", { product: product.slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-xl px-5">
      <PageViewTracker page={`experiencia:${step}`} product={product.slug} />
      {mode !== "normal" && (
        <p className="mb-4 rounded-lg bg-gris-1 px-3 py-2 text-xs text-gris-4">
          Modo prueba activo: generación simulada «{mode}».
        </p>
      )}

      {!ready && <p className="py-20 text-center text-sm text-gris-3">Preparando pantalla de prueba…</p>}

      {ready && step === "foto" && (
        <PhotoStep
          product={product}
          onConfirm={(p) => {
            setPhoto(p);
            setResult(null);
            setStep("procesando");
          }}
        />
      )}

      {step === "procesando" && photo && (
        <ProcessingStep
          product={product}
          photo={photo}
          mode={mode}
          onDone={(r) => {
            setResult(r);
            marcarExperienciaUsada(product.slug);
            setStep("resultado");
          }}
          onNewPhoto={() => setStep("foto")}
        />
      )}

      {step === "resultado" && result && (
        <ResultStep
          product={product}
          result={result}
          photo={photo}
          mode={mode}
          onContinue={(m) => {
            setModoContacto(m);
            setStep("contacto");
          }}
        />
      )}

      {step === "contacto" && modoContacto.modo === "reserva" && (
        <ReserveForm
          product={product}
          precio={modoContacto.precio}
          variante={modoContacto.variante}
          recorrido="interactivo"
          onDone={() => {
            setCierre("reserva");
            setStep("cierre");
          }}
          onVolver={() => setStep("resultado")}
        />
      )}

      {step === "contacto" && modoContacto.modo === "novedades" && (
        <ContactStep
          product={product}
          modo={modoContacto}
          onDone={(r) => {
            setCierre(r);
            setStep("cierre");
          }}
        />
      )}

      {step === "cierre" &&
        (cierre === "reserva" ? <ReservaConfirmada product={product} /> : <ClosingStep resultado={cierre} />)}
    </div>
  );
}
