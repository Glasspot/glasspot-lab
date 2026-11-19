/**
 * Generación SIMULADA (Etapa 1).
 *
 * No usa inteligencia artificial ni envía la foto a ningún lado: todo ocurre en
 * el navegador. Superpone una imagen provisional del producto sobre la foto y
 * le agrega la marca "VISUALIZACIÓN DE PRUEBA".
 *
 * Modos de prueba (parámetro ?simular= en la URL):
 *   - error  → la generación falla
 *   - demora → la generación tarda más de lo habitual y luego termina bien
 *   - lento  → la generación supera el tiempo máximo (timeout)
 */

import {
  GenerationError,
  type GenerationInput,
  type GenerationResult,
  type ImageProvider,
} from "./types";

export type MockMode = "normal" | "error" | "demora" | "lento";

const DELAYS: Record<MockMode, number> = {
  normal: 3500,
  error: 2500,
  demora: 15000,
  lento: 60000,
};

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new GenerationError("cancelado", "cancelled"));
    });
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new GenerationError("imagen", "provider"));
    img.src = src;
  });
}

async function compose(input: GenerationInput): Promise<string> {
  const { photo, photoWidth: w, photoHeight: h, product } = input;
  const photoUrl = URL.createObjectURL(photo);
  try {
    const [base, overlay] = await Promise.all([
      loadImage(photoUrl),
      loadImage(product.superposicionDemo.src),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new GenerationError("canvas", "provider");

    ctx.drawImage(base, 0, 0, w, h);

    const ow = w * product.superposicionDemo.ancho;
    const oh = (overlay.naturalHeight / overlay.naturalWidth) * ow;
    const ox = (w - ow) / 2;
    const oy = h * product.superposicionDemo.centroY - oh / 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = Math.round(w * 0.02);
    ctx.shadowOffsetY = Math.round(w * 0.01);
    ctx.drawImage(overlay, ox, oy, ow, oh);
    ctx.restore();

    // Marca de prueba en diagonal
    ctx.save();
    ctx.translate(w / 2, h * 0.2);
    ctx.rotate(-Math.PI / 12);
    ctx.font = `600 ${Math.round(Math.min(w, h) * 0.055)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = Math.max(1, w * 0.002);
    ctx.fillText("VISUALIZACIÓN DE PRUEBA", 0, 0);
    ctx.strokeText("VISUALIZACIÓN DE PRUEBA", 0, 0);
    ctx.restore();

    // Franja inferior
    const band = Math.round(h * 0.06);
    ctx.fillStyle = "rgba(17,17,17,0.78)";
    ctx.fillRect(0, h - band, w, band);
    ctx.fillStyle = "#fff";
    ctx.font = `500 ${Math.round(band * 0.4)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Contenido de prueba · no es una generación real",
      w / 2,
      h - band / 2,
    );

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new GenerationError("canvas", "provider"))),
        "image/jpeg",
        0.85,
      ),
    );
    return URL.createObjectURL(blob);
  } finally {
    URL.revokeObjectURL(photoUrl);
  }
}

export function createMockProvider(mode: MockMode = "normal"): ImageProvider {
  return {
    id: `mock:${mode}`,
    async generate(input: GenerationInput): Promise<GenerationResult> {
      const start = performance.now();
      await wait(DELAYS[mode], input.signal);
      if (mode === "error") {
        throw new GenerationError("Fallo simulado", "provider");
      }
      const imageUrl = await compose(input);
      return {
        imageUrl,
        esPrueba: true,
        provider: this.id,
        durationMs: Math.round(performance.now() - start),
      };
    },
  };
}
