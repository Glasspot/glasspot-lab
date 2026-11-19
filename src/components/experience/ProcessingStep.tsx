"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { copy } from "@/content/copy";
import type { Product } from "@/content/products";
import { getSessionId, track } from "@/lib/analytics";
import {
  GenerationError,
  getImageProvider,
  SLOW_AFTER_MS,
  TIMEOUT_MS,
  type GenerationResult,
  type MockMode,
} from "@/lib/imageProvider";
import type { PreparedImage } from "@/lib/prepareImage";
import { Button } from "@/components/Button";

type Status = "trabajando" | "demorado" | "error";

/** Pantalla 4 — Procesamiento. */
export function ProcessingStep({
  product,
  photo,
  mode,
  onDone,
  onNewPhoto,
}: {
  product: Product;
  photo: PreparedImage;
  mode: MockMode;
  onDone: (r: GenerationResult) => void;
  onNewPhoto: () => void;
}) {
  const [status, setStatus] = useState<Status>("trabajando");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(1);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    setStatus("trabajando");
    setErrorMsg(null);

    // En los modos de simulación se usan tiempos cortos para poder probar rápido.
    const simulado = mode !== "normal";
    const slowAfter = simulado ? 10_000 : SLOW_AFTER_MS;
    const timeout = simulado ? 30_000 : TIMEOUT_MS;
    const slowTimer = setTimeout(() => setStatus("demorado"), slowAfter);
    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);

    track("image_generation_started", { product: product.slug, attempt });

    getImageProvider(mode)
      .generate({
        photo: photo.blob,
        photoWidth: photo.width,
        photoHeight: photo.height,
        product,
        sessionId: getSessionId(),
        signal: controller.signal,
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        track("image_generation_completed", {
          product: product.slug,
          attempt,
          provider: result.provider,
          duration_ms: result.durationMs,
        });
        onDoneRef.current(result);
      })
      .catch((err: unknown) => {
        // Cancelación por desmontar la pantalla: no es un error del usuario
        if (controller.signal.aborted && !timedOut) return;
        const reason = timedOut
          ? "timeout"
          : err instanceof GenerationError
            ? err.reason
            : "provider";
        track("image_generation_failed", { product: product.slug, attempt, reason });
        setErrorMsg(err instanceof GenerationError && err.userMessage ? err.userMessage : null);
        setStatus("error");
      })
      .finally(() => {
        clearTimeout(slowTimer);
        clearTimeout(timeoutTimer);
      });

    return () => {
      clearTimeout(slowTimer);
      clearTimeout(timeoutTimer);
      controller.abort();
    };
  }, [attempt, mode, photo, product]);

  if (status === "error") {
    return (
      <section className="py-14 text-center aparecer" role="alert">
        <h1 className="text-2xl font-light tracking-tight">{copy.procesando.error}</h1>
        {errorMsg && <p className="mt-3 text-[15px] text-gris-4">{errorMsg}</p>}
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => setAttempt((a) => a + 1)}>{copy.procesando.reintentar}</Button>
          <Button variant="secundario" onClick={onNewPhoto}>
            {copy.procesando.otraFoto}
          </Button>
          <Link href="/" className="mt-2 text-sm text-gris-4 underline underline-offset-4">
            {copy.procesando.salir}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 flex flex-col items-center text-center" aria-live="polite">
      <div className="relative h-44 w-44" aria-hidden>
        <div className="onda absolute inset-0 rounded-full bg-[radial-gradient(circle,#cfccc4_0%,transparent_70%)]" />
        <div className="onda onda-2 absolute inset-0 rounded-full bg-[radial-gradient(circle,#cfccc4_0%,transparent_70%)]" />
        <div className="respiracion absolute inset-8 rounded-full bg-[radial-gradient(circle_at_40%_35%,#ffffff_0%,#e9e7e2_45%,#bdb9b0_100%)]" />
      </div>
      <h1 className="mt-10 text-2xl font-light tracking-tight">{copy.procesando.titulo}</h1>
      <div className="min-h-20 mt-4">
        {status === "demorado" && (
          <div className="aparecer">
            <p className="text-sm text-gris-4">{copy.procesando.demora}</p>
            <Link href="/" className="mt-3 inline-block text-sm text-gris-4 underline underline-offset-4">
              {copy.procesando.salir}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
