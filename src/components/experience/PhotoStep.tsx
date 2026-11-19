"use client";

import { useRef, useState } from "react";
import { copy } from "@/content/copy";
import type { Product } from "@/content/products";
import { track } from "@/lib/analytics";
import { prepareImage, type PreparedImage } from "@/lib/prepareImage";
import { Button } from "@/components/Button";
import { ProvisionalTag } from "@/components/ProvisionalTag";

/**
 * Pantalla 3 — Solicitud de fotografía.
 *
 * Usa el selector nativo del sistema (<input type="file" capture>), que abre la
 * cámara del celular sin pedir permisos de cámara al navegador y funciona mejor
 * dentro de los navegadores internos de Instagram y Facebook. La galería queda
 * siempre disponible como alternativa.
 */
export function PhotoStep({
  product,
  onConfirm,
}: {
  product: Product;
  onConfirm: (photo: PreparedImage) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreparedImage | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>, source: "camara" | "galeria") {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const prepared = await prepareImage(file);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return prepared;
      });
      setConsent(false);
      track("photo_captured", { product: product.slug, source });
    } catch {
      setError(copy.foto.errorFormato);
    } finally {
      setBusy(false);
    }
  }

  function openCamera() {
    track("camera_opened", { product: product.slug });
    cameraRef.current?.click();
  }

  return (
    <section className="aparecer">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleFile(e, "camara")}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleFile(e, "galeria")}
      />

      {!preview ? (
        <>
          <h1 className="text-[26px] leading-tight sm:text-4xl font-light tracking-tight">
            {copy.foto.titulo}
          </h1>
          <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-gris-4">
            {copy.foto.parrafos.map((p, i) => (
              <p key={p}>{i === 1 && product.textoFoto ? product.textoFoto : p}</p>
            ))}
          </div>

          <figure className="mt-6 relative rounded-2xl overflow-hidden border border-gris-1 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.ejemploFoto.src}
              alt={product.ejemploFoto.alt}
              className="w-full max-h-80 object-contain"
            />
            <figcaption className="absolute top-3 left-3 flex gap-2">
              <span className="rounded-full bg-tinta text-papel px-2.5 py-0.5 text-[11px] font-medium">
                {copy.foto.ejemplo}
              </span>
              <ProvisionalTag>Provisional</ProvisionalTag>
            </figcaption>
          </figure>

          <div className="mt-7 flex flex-col gap-3">
            <Button onClick={openCamera} disabled={busy}>
              {busy ? "Abriendo foto…" : copy.foto.botonCamara}
            </Button>
            <Button variant="secundario" onClick={() => galleryRef.current?.click()} disabled={busy}>
              {copy.foto.botonGaleria}
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <p className="mt-5 text-xs text-gris-3">{copy.foto.privacidadBreve}</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-light tracking-tight">¿Usamos esta foto?</h1>
          <div className="mt-5 rounded-2xl overflow-hidden border border-gris-1 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt="Vista previa de tu foto" className="w-full max-h-[60vh] object-contain" />
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm text-gris-4 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-tinta shrink-0"
            />
            <span>{copy.foto.consentimiento}</span>
          </label>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              disabled={!consent}
              onClick={() => {
                track("photo_submitted", { product: product.slug });
                onConfirm(preview);
              }}
            >
              {copy.foto.confirmar}
            </Button>
            <Button
              variant="secundario"
              onClick={() => {
                URL.revokeObjectURL(preview.url);
                setPreview(null);
                setConsent(false);
              }}
            >
              {copy.foto.repetir}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
