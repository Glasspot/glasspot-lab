/**
 * Proceso de visualización con IA (Etapa 2). SOLO SERVIDOR.
 *
 * 1. Análisis de la foto con un modelo de visión (¿hay ventana?, ángulo, luz…).
 * 2. Edición con el modelo de imagen: foto del usuario + kit de referencia + prompt técnico.
 * 3. Control de calidad automático con el modelo de visión. Si falla, 1 reintento.
 *
 * La clave de API se lee de .env.local y nunca sale del servidor.
 */

import "server-only";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import type { ProductSpec } from "@/content/productSpecs";

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-5.4-mini";
const IMAGE_QUALITY = (process.env.OPENAI_IMAGE_QUALITY || "medium") as "low" | "medium" | "high";
const QA_ENABLED = process.env.CONTROL_CALIDAD !== "no";

export type SceneAnalysis = {
  apta: boolean;
  motivo_no_apta: string | null;
  hay_personas: boolean;
  tipo_ventana: string;
  angulo_camara: string;
  luz: string;
  material_marco: string;
  ancho_estimado_cm: number | null;
  paños?: string;
  posicion_sugerida: string;
  luz_detalle?: string;
};

export type QaResult = { aprobado: boolean; puntaje: number; problemas: string[]; ventosas_en_vidrio?: boolean };

export type VisualizationOutput = {
  imageBase64: string;
  mime: string;
  analisis: SceneAnalysis;
  calidad: QaResult | null;
  intentos: number;
  duracionMs: number;
  modelo: string;
  calidadImagen: string;
  usoTokens: Array<Record<string, unknown>>;
};

export class VisualizerError extends Error {
  constructor(
    message: string,
    public readonly code: "no_configurado" | "foto_no_apta" | "proveedor" | "calidad",
    public readonly detalle?: string,
    /** Última imagen generada (solo para la prueba comparativa). */
    public readonly ultimaImagen?: string,
  ) {
    super(message);
  }
}

let client: OpenAI | null = null;
export function isConfigured() {
  return !!process.env.OPENAI_API_KEY;
}
function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new VisualizerError("Falta OPENAI_API_KEY", "no_configurado");
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 150_000, maxRetries: 1 });
  return client;
}

function dataUrl(buf: Buffer, mime: string) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function loadReferences(spec: ProductSpec, extra: string[] = []) {
  const dir = path.join(process.cwd(), "referencias", spec.slug);
  return Promise.all(
    [...spec.referencias, ...extra].map(async (name) => ({ name, buf: await readFile(path.join(dir, name)) })),
  );
}

function parseJson<T>(text: string | null | undefined): T {
  const raw = (text ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  return JSON.parse(raw) as T;
}

/* ---------- 1. Análisis de la foto ---------- */

// Caché en memoria: "Ver este uso en mi espacio" reutiliza el análisis de la misma foto.
const analysisCache = new Map<string, { at: number; value: SceneAnalysis }>();
const CACHE_MS = 30 * 60_000;

async function analyzeSceneCached(photo: Buffer, mime: string, spec: ProductSpec) {
  const key = "v2:" + spec.slug + ":" + createHash("sha256").update(photo).digest("hex");
  const hit = analysisCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const value = await analyzeScene(photo, mime, spec);
  analysisCache.set(key, { at: Date.now(), value });
  if (analysisCache.size > 300) {
    const oldest = [...analysisCache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
    for (const [k] of oldest) analysisCache.delete(k);
  }
  return value;
}

async function analyzeScene(photo: Buffer, mime: string, spec: ProductSpec): Promise<SceneAnalysis> {
  const ctx = spec.contexto;
  const res = await getClient().chat.completions.create({
    model: VISION_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You analyze home photos for a product visualization tool. Answer ONLY with a JSON object with these keys: " +
          (ctx
            ? `apta (boolean: true if ${ctx.apta}), motivo_no_apta (string in Spanish for the user, or null), `
            : "apta (boolean: true if a window with visible glass is clearly shown), motivo_no_apta (string in Spanish for the user, or null), ") +
          (ctx
            ? "tipo_ventana (short English description of the surface where the product would go: window glass, glass shower screen or tiled wall; panes and frame color), "
            : "tipo_ventana (short English description: sliding/casement/fixed, panes, frame color), ") +
          "hay_personas (boolean: true ONLY if a real person is physically present inside the room and clearly identifiable, for example their face or most of their body is visible. " +
          "It is FALSE for: reflections of the photographer or anyone else on glass, mirrors or shiny surfaces; tiny distant people outside the window or on the street; people in paintings, posters, photos or screens; " +
          "a hand, arm, foot or finger at the edge of the frame; silhouettes you are not sure about. When in doubt, false), " +
          "angulo_camara (English: frontal or oblique, from left/right, height of the camera relative to the window), " +
          "luz (English: main light direction, daylight or artificial, warm or cool, soft or hard), material_marco (English), " +
          "ancho_estimado_cm (number or null: estimated width of the glass area in cm), " +
          "paños (English: how many separate glass panes are visible and the estimated width in cm of each, e.g. '2 panes, ~70 cm each'), " +
          (ctx
            ? `posicion_sugerida (English: ${ctx.posicion}), `
            : "posicion_sugerida (English: which single pane should hold a 40 cm wide desk board and where: centered left-to-right in that pane, " +
              "and at what height so that the two suction cups hanging below the board are fully on the glass, well above the bottom frame or any horizontal bar of that pane; " +
              "only if no pane is wider than ~60 cm say it must span two panes), ") +
          "luz_detalle (English: where the exterior light comes from, how strong, sun or overcast, and what shadows/highlights it would cast on an object placed against the glass).",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this photo." },
          { type: "image_url", image_url: { url: dataUrl(photo, mime) } },
        ],
      },
    ],
  });
  return parseJson<SceneAnalysis>(res.choices[0]?.message?.content);
}

/* ---------- 2. Prompt técnico ---------- */

export function buildPrompt(spec: ProductSpec, scene: SceneAnalysis, anchoVentanaCm?: number, escenario?: string) {
  const extra = escenario ? spec.escenarios[escenario] : undefined;
  const refCount = spec.referencias.length + (extra?.referenciasExtra?.length ?? 0);
  const ctx = spec.contexto;
  const lines: string[] = [];
  lines.push(
    `Image 1 is a real photo of ${ctx ? ctx.escenaFoto : "a window"} in someone's home. It is the ONLY scene: the output must be Image 1 with the product added.`,
    `Images 2 to ${refCount + 1} are product references (a ${spec.nombreEnIngles}). Use them ONLY to learn the product's shape, parts and materials. Ignore their backgrounds, walls, windows, views and lighting, and never copy any part of their scenes into the output.`,
    "",
    "PRODUCT (must match the references exactly):",
    spec.descripcionVisual,
  );
  const dims: string[] = [];
  if (spec.medidas.anchoCm) dims.push(`board width ${spec.medidas.anchoCm} cm`);
  if (spec.medidas.profundidadCm) dims.push(`depth ${spec.medidas.profundidadCm} cm`);
  if (spec.medidas.espesorMm) dims.push(`board thickness ${spec.medidas.espesorMm} mm`);
  if (spec.medidas.alturaTotalMm) dims.push(`total height from board top to the bottom of the suction cups ${spec.medidas.alturaTotalMm / 10} cm`);
  if (dims.length) lines.push(`Real dimensions: ${dims.join(", ")}.`);
  if (spec.proporciones) lines.push(`PROPORTIONS: ${spec.proporciones}`);
  if (spec.material) lines.push(`Material: ${spec.material}.`);
  if (spec.color) lines.push(`Color/finish: ${spec.color}.`);

  lines.push(
    "",
    "SCENE (from Image 1):",
    `- ${ctx ? "Surface" : "Window"}: ${scene.tipo_ventana}; frame: ${scene.material_marco}.`,
    `- Camera: ${scene.angulo_camara}.`,
    `- Lighting: ${scene.luz}.`,
    ...(scene.luz_detalle ? [`- Light detail: ${scene.luz_detalle}.`] : []),
    ...(scene.paños ? [`- Glass panes: ${scene.paños}.`] : []),
    `- Best placement: ${scene.posicion_sugerida}.`,
  );
  const ancho = anchoVentanaCm ?? scene.ancho_estimado_cm ?? null;
  if (ancho) {
    lines.push(
      `- The window is about ${ancho} cm wide${anchoVentanaCm ? " (measured by the owner)" : " (estimated)"}.`,
    );
  }
  if (ctx) {
    lines.push(`- SCALE IS CRITICAL: ${ctx.escala}`);
  } else if (spec.medidas.anchoCm && ancho) {
    const pct = Math.round((spec.medidas.anchoCm / ancho) * 100);
    lines.push(`- SCALE IS CRITICAL: the board must occupy about ${pct}% of the window width (${spec.medidas.anchoCm} cm of ~${ancho} cm). Do not make it bigger or smaller. For reference, a 14-inch laptop (about 32 cm wide) covers about 80% of the board width, almost all of it.`);
  } else if (spec.medidas.anchoCm) {
    lines.push(`- SCALE IS CRITICAL: the board is ${spec.medidas.anchoCm} cm wide. Use the window frame, sills and any known objects to keep that real size. A 14-inch laptop (about 32 cm wide) covers about 80% of the board width, almost all of it.`);
  } else {
    lines.push("- SCALE IS CRITICAL: the board is only slightly larger than a 14-inch laptop (a laptop covers most of it). It is a compact accessory, never as wide as the window pane.");
  }

  lines.push(
    "",
    `TASK: Edit Image 1 so the product appears really installed ${ctx ? "in this space" : "on this window"}, as if photographed in place.`,
    ...(extra ? [extra.escena, "- The scene description above overrides the default placement height."] : []),
    `- Placement: ${spec.ubicacion}`,
    `- SUCTION CUP RULE (non-negotiable, overrides everything else, including the use scene): ${spec.reglaVentosas}`,
    ...(ctx
      ? [ctx.perspectivaYLuz]
      : [
    "- Follow the exact perspective and vanishing lines of Image 1; the board must be level and perpendicular to the glass.",
    "- LIGHTING IS KEY TO REALISM: the product is against the window, so it is backlit by the exterior light. Match the real light direction, intensity and color temperature of Image 1: " +
      "light falling on the top of the board, darker underside and front edge, soft shadows cast by the board and the suction cups onto the glass, frame and sill, highlights and slight translucency on the suction cups, " +
      "reflections of the product on the glass, and shadows of any object on the board. The product must look photographed in that exact light, never pasted or evenly lit.",
        ]),
    "- Keep EVERYTHING else in Image 1 unchanged: same window or shower, frame, walls, tiles, curtains, view outside, colors, framing and resolution. Do not move the camera. The composition of the output must match Image 1, not any reference.",
    "- Photorealistic, natural phone-photo look. No people, no text, no logos, no watermarks.",
    "",
    "Do NOT add: " + spec.prohibido.join("; ") + ".",
  );
  return lines.join("\n");
}

/* ---------- 3. Control de calidad ---------- */

async function qualityCheck(result: Buffer, photo: Buffer, photoMime: string, refs: { buf: Buffer }[], nota?: string, spec?: ProductSpec): Promise<QaResult> {
  const res = await getClient().chat.completions.create({
    model: VISION_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a strict quality inspector for product visualizations. Compare the EDITED image with the ORIGINAL photo and the PRODUCT references. " +
          'Answer ONLY JSON: {"aprobado": boolean, "puntaje": number 1-5, "ventosas_en_vidrio": boolean, "problemas": [short strings in Spanish]}. ' +
          "ventosas_en_vidrio is true only if BOTH suction cups are fully on glass (or on smooth tile in a bathroom), with no part of any cup on a frame, profile, sash, horizontal bar between panes, track, sill or edge; look carefully at where each cup is. " +
          (spec?.contexto
            ? `Reject (aprobado=false) if: ${spec.contexto.qaRechazo}, `
            : "Reject (aprobado=false) if: any suction cup touches, overlaps or sits on a window frame, aluminum profile, sash, mullion, horizontal bar between panes, track, sill or wall instead of being fully on the glass, the board rests on a horizontal frame bar, the two suction cups are on different glass panes or across a frame when a single pane was wide enough, the product does not resemble the references (shape, two black suction cups, flat board), the suction cups look clearly smaller than in the references relative to the board, it has legs or extra parts, ") +
          "it floats without touching the glass, the scale is absurd, the perspective is clearly wrong, or the rest of the original photo was noticeably changed " +
          "(added people, objects or a lowered curtain are OK only if the scene note allows them)." +
          (nota ? ` SCENE NOTE: ${nota}` : ""),
      },
      {
        role: "user",
        content: [
          { type: "text", text: "ORIGINAL photo:" },
          { type: "image_url", image_url: { url: dataUrl(photo, photoMime), detail: "low" } },
          { type: "text", text: "PRODUCT references:" },
          ...refs.slice(0, 2).map((r) => ({
            type: "image_url" as const,
            image_url: { url: dataUrl(r.buf, "image/jpeg"), detail: "low" as const },
          })),
          { type: "text", text: "EDITED image to inspect:" },
          { type: "image_url", image_url: { url: dataUrl(result, "image/jpeg") } },
        ],
      },
    ],
  });
  return parseJson<QaResult>(res.choices[0]?.message?.content);
}

/* ---------- Proceso completo ---------- */

function sizeFor(width: number, height: number) {
  const r = width / height;
  if (r > 1.15) return "1536x1024";
  if (r < 0.87) return "1024x1536";
  return "1024x1024";
}

export async function visualize(input: {
  photo: Buffer;
  mime: string;
  width: number;
  height: number;
  spec: ProductSpec;
  anchoVentanaCm?: number;
  safetyId?: string;
  escenario?: string;
}): Promise<VisualizationOutput> {
  const started = Date.now();
  const usage: Array<Record<string, unknown>> = [];

  const analisis = await analyzeSceneCached(input.photo, input.mime, input.spec).catch((e) => {
    throw new VisualizerError("No se pudo analizar la foto", "proveedor", String(e?.message ?? e));
  });
  if (!analisis.apta || analisis.hay_personas) {
    console.warn("[visualizar] foto rechazada por el análisis:", JSON.stringify({ apta: analisis.apta, hay_personas: analisis.hay_personas, motivo: analisis.motivo_no_apta, superficie: analisis.tipo_ventana }));
    throw new VisualizerError(
      analisis.hay_personas
        ? "Para cuidar tu privacidad, usá una foto donde no aparezcan personas."
        : analisis.motivo_no_apta || input.spec.contexto?.noApta || "No encontramos una ventana en la foto.",
      "foto_no_apta",
    );
  }

  const extra = input.escenario ? input.spec.escenarios[input.escenario] : undefined;
  const refs = await loadReferences(input.spec, extra?.referenciasExtra);
  const prompt = buildPrompt(input.spec, analisis, input.anchoVentanaCm, input.escenario);
  const images = [
    await toFile(input.photo, "foto.jpg", { type: input.mime }),
    ...(await Promise.all(refs.map((r) => toFile(r.buf, r.name, { type: "image/jpeg" })))),
  ];

  let last: { b64: string; qa: QaResult | null } | null = null;
  const maxIntentos = QA_ENABLED ? 2 : 1;
  for (let intento = 1; intento <= maxIntentos; intento++) {
    let res;
    try {
      // En el reintento se le dice qué salió mal la primera vez.
      const promptIntento: string =
        intento > 1 && last?.qa
          ? `${prompt}\n\nA PREVIOUS ATTEMPT WAS REJECTED. Fix these problems: ${last.qa.problemas.join("; ")}.` +
            (last.qa.ventosas_en_vidrio === false ? " Above all: put BOTH suction cups fully on the glass, never on any frame, profile or horizontal bar between panes." : "")
          : prompt;
      res = await getClient().images.edit({
        model: IMAGE_MODEL,
        image: images,
        prompt: promptIntento,
        quality: IMAGE_QUALITY,
        size: sizeFor(input.width, input.height),
        output_format: "jpeg",
        output_compression: 88,
        ...(input.safetyId ? { safety_identifier: input.safetyId } : {}),
      });
    } catch (e) {
      const err = e as { message?: string };
      throw new VisualizerError("El servicio de imágenes falló", "proveedor", err?.message);
    }
    if (res.usage) usage.push(res.usage as unknown as Record<string, unknown>);
    const b64: string | undefined = res.data?.[0]?.b64_json;
    if (!b64) throw new VisualizerError("Respuesta vacía del servicio", "proveedor");

    let qa: QaResult | null = null;
    if (QA_ENABLED) {
      qa = await qualityCheck(Buffer.from(b64, "base64"), input.photo, input.mime, refs, extra?.controlCalidad, input.spec).catch(() => null);
    }
    last = { b64, qa };
    // Se acepta si el control lo aprueba, o si en el último intento el puntaje es aceptable (3/5 o más):
    // es preferible mostrar una imagen correcta aunque no perfecta que un error.
    // Las ventosas fuera del vidrio son un rechazo sin excepción.
    const ventosasOk = !qa || qa.ventosas_en_vidrio !== false;
    const aceptable = ventosasOk && (!qa || qa.aprobado || (intento === maxIntentos && qa.puntaje >= 3));
    if (aceptable) {
      return {
        imageBase64: b64,
        mime: "image/jpeg",
        analisis,
        calidad: qa,
        intentos: intento,
        duracionMs: Date.now() - started,
        modelo: IMAGE_MODEL,
        calidadImagen: IMAGE_QUALITY,
        usoTokens: usage,
      };
    }
  }
  throw new VisualizerError(
    "La visualización no superó el control de calidad",
    "calidad",
    JSON.stringify(last?.qa ?? null),
    last?.b64,
  );
}
