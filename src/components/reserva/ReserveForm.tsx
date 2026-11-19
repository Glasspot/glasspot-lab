"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { copy } from "@/content/copy";
import { formatPrice, type Product } from "@/content/products";
import { track } from "@/lib/analytics";
import { experienciaUsada, type Recorrido } from "@/lib/journey";
import { armarRegistro, registrarReserva } from "@/lib/reservas";
import { Button } from "@/components/Button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const telefonoValido = (v: string) => /^\+?\d{8,15}$/.test(v.replace(/[\s\-().]/g, ""));

/** Formulario de reserva gratuita del precio de lanzamiento. No pide pagos. */
export function ReserveForm({
  product,
  precio,
  variante,
  recorrido,
  onDone,
  onVolver,
}: {
  product: Product;
  precio: number;
  variante: number;
  recorrido: Recorrido;
  onDone: () => void;
  onVolver?: () => void;
}) {
  const t = copy.reserva;
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [consProducto, setConsProducto] = useState(false);
  const [consPromos, setConsPromos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const started = useRef(false);
  const abierto = useRef(false);

  useEffect(() => {
    if (abierto.current) return;
    abierto.current = true;
    track("reservation_form_opened", { product: product.slug, price: precio, variant: variante, path: recorrido });
  }, [product.slug, precio, variante, recorrido]);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("contact_form_started", { product: product.slug, path: recorrido });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim();
    const tel = telefono.trim();
    if (!em && !tel) return setError(t.errorFaltaContacto);
    if (em && !EMAIL_RE.test(em)) return setError(t.errorEmail);
    if (tel && !telefonoValido(tel)) return setError(t.errorTelefono);
    if (!consProducto) return setError(t.errorConsentimiento);
    setError(null);
    setEnviando(true);
    await registrarReserva(
      armarRegistro({
        producto: product.slug,
        precio,
        moneda: product.moneda,
        variantePrecio: variante,
        recorrido,
        usoExperiencia: recorrido === "interactivo" || experienciaUsada(product.slug),
        nombre: nombre.trim() || undefined,
        email: em || undefined,
        telefono: tel || undefined,
        consentimientoProducto: consProducto,
        consentimientoPromociones: consPromos,
      }),
    );
    setEnviando(false);
    onDone();
  }

  const input =
    "w-full min-h-12 rounded-xl border border-gris-2 bg-white px-4 text-[16px] focus:border-tinta outline-none";

  return (
    <section className="aparecer">
      <h1 className="text-[26px] leading-tight sm:text-3xl font-light tracking-tight">{t.titulo}</h1>
      <div className="mt-4 space-y-3 text-[15px] text-gris-4 leading-relaxed">
        {t.parrafos.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="font-medium text-tinta">{t.destacado}</p>
        {t.cierreTexto.map((p) => (
          <p key={p} className="text-sm text-gris-3">{p}</p>
        ))}
      </div>

      <div className="mt-6 flex items-baseline justify-between rounded-xl border border-gris-1 bg-white px-4 py-3">
        <span className="text-xs uppercase tracking-[0.16em] text-gris-3">
          {t.precioReservado} · {product.nombre}
        </span>
        <span className="text-lg font-light">{formatPrice(precio, product.moneda)}</span>
      </div>

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="r-nombre" className="block text-sm font-medium mb-2">
            {t.nombre} <span className="font-normal text-gris-3">{t.opcional}</span>
          </label>
          <input id="r-nombre" type="text" autoComplete="given-name" value={nombre} onFocus={markStarted}
            onChange={(e) => setNombre(e.target.value)} className={input} maxLength={80} />
        </div>
        <div>
          <label htmlFor="r-email" className="block text-sm font-medium mb-2">{t.email}</label>
          <input id="r-email" type="email" inputMode="email" autoComplete="email" placeholder={t.placeholderEmail}
            value={email} onFocus={markStarted}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }} className={input} />
        </div>
        <div>
          <label htmlFor="r-tel" className="block text-sm font-medium mb-2">{t.telefono}</label>
          <input id="r-tel" type="tel" inputMode="tel" autoComplete="tel" placeholder={t.placeholderTelefono}
            value={telefono} onFocus={markStarted}
            onChange={(e) => { setTelefono(e.target.value); if (error) setError(null); }} className={input} />
          <p className="mt-2 text-xs text-gris-3">{t.ayudaContacto}</p>
        </div>

        <label className="flex items-start gap-3 text-sm text-gris-4 cursor-pointer">
          <input type="checkbox" checked={consProducto}
            onChange={(e) => { setConsProducto(e.target.checked); markStarted(); if (error) setError(null); }}
            className="mt-0.5 h-5 w-5 accent-tinta shrink-0" />
          <span>
            {t.consentimientoProducto}{" "}
            <Link href="/privacidad" target="_blank" className="underline underline-offset-4">
              Política de privacidad
            </Link>
            .
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-gris-4 cursor-pointer">
          <input type="checkbox" checked={consPromos} onChange={(e) => setConsPromos(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-tinta shrink-0" />
          <span>{t.consentimientoPromociones} <span className="text-gris-3">{t.opcional}</span></span>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-700">{error}</p>
        )}

        <Button type="submit" disabled={enviando}>{t.boton}</Button>
        <p className="text-xs text-gris-3 leading-relaxed text-center">{t.aclaracion}</p>
      </form>

      {onVolver && (
        <div className="mt-6 flex justify-center">
          <Button variant="texto" onClick={onVolver}>{t.volver}</Button>
        </div>
      )}
    </section>
  );
}
