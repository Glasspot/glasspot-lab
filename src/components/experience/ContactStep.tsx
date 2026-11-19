"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { copy } from "@/content/copy";
import type { Product } from "@/content/products";
import { track } from "@/lib/analytics";
import { Button } from "@/components/Button";
import type { ContinueMode } from "./ResultStep";

/** Versión del texto de consentimiento. Se registrará junto a cada suscripción (Etapa 3). */
export const CONSENT_VERSION = "2026-11-13-provisional";

type Channel = "email" | "telefono";

export function detectChannel(raw: string): Channel | null {
  const value = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "email";
  const digits = value.replace(/[\s\-().]/g, "");
  if (/^\+?\d{8,15}$/.test(digits)) return "telefono";
  return null;
}

/** Pantalla 6 — Contacto y suscripción (opcional). */
export function ContactStep({
  product,
  modo,
  onDone,
}: {
  product: Product;
  modo: ContinueMode;
  onDone: (resultado: "reserva" | "suscripcion" | null) => void;
}) {
  void modo;
  const t = {
    titulo: copy.contacto.titulo,
    subtitulo: copy.contacto.subtitulo,
    boton: copy.contacto.boton,
    consentimiento: copy.contacto.consentimiento,
    omitir: copy.contacto.omitir,
    aclaracion: copy.contacto.aclaracion,
  };
  const [value, setValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("contact_form_started", { product: product.slug });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const channel = detectChannel(value);
    if (!channel) return setError(copy.contacto.errorFormato);
    if (!consent) return setError(copy.contacto.errorConsentimiento);
    setError(null);
    // Etapa 1: no se guarda ni se envía el dato. Solo se registra el evento,
    // SIN el email o teléfono.
    const extra = { mode: "novedades" };
    track("subscription_consent_given", { product: product.slug, channel, consent_version: CONSENT_VERSION, ...extra });
    track("contact_submitted", { product: product.slug, channel, ...extra });
    onDone("suscripcion");
  }

  return (
    <section className="aparecer">
      <h1 className="text-[26px] leading-tight sm:text-3xl font-light tracking-tight">{t.titulo}</h1>
      <p className="mt-3 text-[15px] text-gris-4 leading-relaxed">{t.subtitulo}</p>

      <form onSubmit={submit} noValidate className="mt-7 flex flex-col gap-4">
        <div>
          <label htmlFor="contacto" className="block text-sm font-medium mb-2">
            {copy.contacto.etiquetaCampo}
          </label>
          <input
            id="contacto"
            name="contacto"
            type="text"
            autoComplete="email"
            placeholder={copy.contacto.placeholder}
            value={value}
            onFocus={markStarted}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "contacto-error" : undefined}
            className="w-full min-h-12 rounded-xl border border-gris-2 bg-white px-4 text-[16px] focus:border-tinta outline-none"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-gris-4 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              markStarted();
            }}
            className="mt-0.5 h-5 w-5 accent-tinta shrink-0"
          />
          <span>
            {t.consentimiento}{" "}
            <Link href="/privacidad" target="_blank" className="underline underline-offset-4">
              Política de privacidad
            </Link>
            .
          </span>
        </label>

        {error && (
          <p id="contacto-error" role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" className="tracking-wide">
          {t.boton}
        </Button>
        <p className="text-xs text-gris-3 text-center">{t.aclaracion}</p>
      </form>

      <div className="mt-6 flex justify-center">
        <Button variant="texto" onClick={() => onDone(null)}>
          {t.omitir}
        </Button>
      </div>
    </section>
  );
}
