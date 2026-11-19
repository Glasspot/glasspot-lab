"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/* eslint-disable @typescript-eslint/no-namespace */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
    }
  }
}

/** Visor 3D del producto (Google model-viewer). Se carga solo en el navegador. */
export function Viewer3D({
  src,
  alt,
  product,
  orbita = "215deg 72deg auto",
}: {
  src: string;
  alt: string;
  product: string;
  orbita?: string;
}) {
  const [listo, setListo] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const tocado = useRef(false);

  useEffect(() => {
    import("@google/model-viewer").then(() => setListo(true)).catch(() => setListo(false));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onInteract = () => {
      if (tocado.current) return;
      tocado.current = true;
      track("model3d_viewed", { product });
    };
    el.addEventListener("camera-change", (e: Event) => {
      if ((e as CustomEvent).detail?.source === "user-interaction") onInteract();
    });
  }, [listo, product]);

  return (
    <section className="mt-10" aria-label="Modelo 3D">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Miralo en 3D</h2>
        <span className="text-xs text-gris-3">Arrastrá para girarlo</span>
      </div>
      <div className="mt-3 rounded-2xl overflow-hidden border border-gris-1 bg-[#f1efea] aspect-[4/3]">
        {listo ? (
          <model-viewer
            ref={ref}
            src={src}
            alt={alt}
            camera-controls=""
            auto-rotate=""
            auto-rotate-delay="1500"
            rotation-per-second="18deg"
            shadow-intensity="1.5"
            shadow-softness="0.45"
            exposure="0.95"
            tone-mapping="aces"
            environment-image="neutral"
            camera-orbit={orbita}
            interaction-prompt="auto"
            touch-action="pan-y"
            style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gris-3">Cargando modelo 3D…</div>
        )}
      </div>
    </section>
  );
}
