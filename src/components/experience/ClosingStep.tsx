import { copy } from "@/content/copy";
import { ButtonLink } from "@/components/Button";

/** Pantalla 7 — Cierre. */
export function ClosingStep({ resultado }: { resultado: "reserva" | "suscripcion" | null }) {
  const subscribed = resultado !== null;
  return (
    <section className="py-12 text-center aparecer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/isotipo.svg" alt="" aria-hidden className="mx-auto mb-8 h-14 w-auto" />
      <h1 className="text-[28px] leading-tight sm:text-4xl font-light tracking-tight">{copy.cierre.titulo}</h1>
      <div className="mt-5 space-y-2 text-[15px] text-gris-4 leading-relaxed">
        {copy.cierre.parrafos.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {subscribed && (
        <p className="mt-6 mx-auto max-w-sm rounded-lg bg-gris-1 px-3 py-2 text-xs text-gris-4">
          Versión de prueba: tus datos no se guardaron ni se enviaron.
        </p>
      )}
      <div className="mt-10 max-w-xs mx-auto">
        <ButtonLink href="/" variant="secundario">
          {copy.cierre.volverInicio}
        </ButtonLink>
      </div>
    </section>
  );
}
