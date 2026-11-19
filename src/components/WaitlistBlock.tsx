"use client";

import { useState } from "react";
import type { Product } from "@/content/products";
import { track } from "@/lib/analytics";
import { ContactStep } from "@/components/experience/ContactStep";
import { ButtonLink } from "@/components/Button";

/** Producto "Próximamente": mide interés con un aviso de lanzamiento (sin IA). */
export function WaitlistBlock({ product }: { product: Product }) {
  const [abierto, setAbierto] = useState(false);
  const [listo, setListo] = useState<null | "suscripcion" | "omitido">(null);

  if (listo) {
    return (
      <div className="mt-8 text-center aparecer">
        <p className="text-[15px] text-gris-4">
          {listo === "suscripcion"
            ? "¡Listo! Vas a ser de los primeros en enterarte del lanzamiento."
            : "¡Gracias por tu interés!"}
        </p>
        <div className="mt-6 max-w-xs mx-auto">
          <ButtonLink href="/" variant="secundario">Ver el escritorio de ventana</ButtonLink>
        </div>
      </div>
    );
  }

  if (!abierto) {
    return (
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            track("waitlist_opened", { product: product.slug });
            setAbierto(true);
          }}
          className="w-full min-h-12 rounded-full bg-tinta text-papel text-[15px] font-medium hover:bg-gris-4"
        >
          Quiero que me avisen
        </button>
        <ButtonLink href="/" variant="texto" className="self-center">
          Volver
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-gris-1 pt-8">
      <ContactStep
        product={product}
        modo={{ modo: "novedades" }}
        onDone={(r) => setListo(r === "suscripcion" ? "suscripcion" : "omitido")}
      />
    </div>
  );
}
