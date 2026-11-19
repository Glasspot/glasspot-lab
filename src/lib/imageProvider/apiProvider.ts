/**
 * Generación REAL (Etapa 2): llama al endpoint propio /api/visualizar.
 * El navegador nunca habla directo con el proveedor de IA ni ve la clave.
 */

import { GenerationError, type GenerationInput, type GenerationResult, type ImageProvider } from "./types";

type ApiOk = { ok: true; imagen: string; duracionMs: number; intentos: number };
type ApiErr = { ok: false; code: string; mensaje: string };

const REASONS: Record<string, GenerationError["reason"]> = {
  no_configurado: "not_configured",
  foto_no_apta: "invalid_input",
  formato: "invalid_input",
  tamano: "invalid_input",
  limite: "rate_limited",
  calidad: "quality",
};

export function createApiProvider(): ImageProvider {
  return {
    id: "api",
    async generate(input: GenerationInput): Promise<GenerationResult> {
      const form = new FormData();
      form.append("foto", input.photo, "foto.jpg");
      form.append("producto", input.product.slug);
      form.append("width", String(input.photoWidth));
      form.append("height", String(input.photoHeight));
      if (input.anchoVentanaCm) form.append("ancho", String(input.anchoVentanaCm));
      if (input.sessionId) form.append("sesion", input.sessionId);
      if (input.escenario) form.append("escenario", input.escenario);

      let res: Response;
      try {
        res = await fetch("/api/visualizar", { method: "POST", body: form, signal: input.signal });
      } catch (e) {
        if (input.signal?.aborted) throw new GenerationError("cancelado", "cancelled");
        throw new GenerationError(String(e), "provider");
      }
      const data = (await res.json().catch(() => null)) as ApiOk | ApiErr | null;
      if (!data || !data.ok) {
        const code = data && !data.ok ? data.code : "interno";
        const reason = REASONS[code] ?? "provider";
        const userMessage = reason === "invalid_input" || reason === "rate_limited" ? data?.mensaje : undefined;
        throw new GenerationError(data && !data.ok ? data.mensaje : "error", reason, userMessage);
      }
      return { imageUrl: data.imagen, esPrueba: false, provider: "api", durationMs: data.duracionMs };
    },
  };
}
