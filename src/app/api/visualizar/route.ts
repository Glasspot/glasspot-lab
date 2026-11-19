/**
 * POST /api/visualizar — genera la visualización con IA.
 *
 * Recibe (multipart/form-data):
 *   foto            imagen JPEG/PNG/WebP (ya reducida en el celular)
 *   producto        slug del producto (ej. "escritorio")
 *   ancho           (opcional) ancho de la ventana en cm
 *   sesion          (opcional) id anónimo de sesión, para límites
 *   escenario       (opcional) uso del carrusel: de-pie | desayuno | decorativo | plegado
 *
 * No guarda la foto: se procesa en memoria y se descarta.
 */

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getProductSpec } from "@/content/productSpecs";
import { isConfigured, visualize, VisualizerError } from "@/lib/server/visualizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_BYTES = 8 * 1024 * 1024;
const POR_IP_POR_HORA = Number(process.env.LIMITE_POR_IP_HORA || 6);
const POR_DIA = Number(process.env.LIMITE_DIARIO || 40);
const MODO_PRUEBA = process.env.MODO_PRUEBA === "si";

// Límites en memoria (suficiente para la prueba local; en producción se pasan a la base de datos).
const porIp = new Map<string, number[]>();
let dia = new Date().toDateString();
let usadosHoy = 0;

function controlarLimites(ip: string): string | null {
  const hoy = new Date().toDateString();
  if (hoy !== dia) {
    dia = hoy;
    usadosHoy = 0;
  }
  if (usadosHoy >= POR_DIA) return "Alcanzamos el máximo de visualizaciones por hoy. Probá de nuevo mañana.";
  const ahora = Date.now();
  const lista = (porIp.get(ip) ?? []).filter((t) => ahora - t < 3_600_000);
  if (lista.length >= POR_IP_POR_HORA) return "Hiciste varias pruebas seguidas. Esperá un rato y volvé a intentar.";
  lista.push(ahora);
  porIp.set(ip, lista);
  usadosHoy++;
  return null;
}

function error(status: number, code: string, mensaje: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, code, mensaje, ...extra }, { status });
}

export async function GET() {
  return NextResponse.json({ configurado: isConfigured() });
}

export async function POST(req: Request) {
  if (!isConfigured()) {
    return error(503, "no_configurado", "La generación con IA todavía no está configurada.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error(400, "formato", "No pudimos leer la foto enviada.");
  }

  const foto = form.get("foto");
  const producto = String(form.get("producto") ?? "");
  const anchoRaw = Number(form.get("ancho"));
  const ancho = Number.isFinite(anchoRaw) && anchoRaw >= 30 && anchoRaw <= 600 ? Math.round(anchoRaw) : undefined;
  const width = Number(form.get("width")) || 1024;
  const height = Number(form.get("height")) || 1024;

  const spec = getProductSpec(producto);
  if (!spec) return error(400, "producto", "Producto no disponible.");
  const escenarioRaw = String(form.get("escenario") ?? "");
  const escenario = escenarioRaw && spec.escenarios[escenarioRaw] ? escenarioRaw : undefined;
  if (!(foto instanceof Blob)) return error(400, "formato", "Falta la foto.");
  if (foto.size > MAX_BYTES) return error(413, "tamano", "La foto es demasiado pesada.");
  const mime = foto.type || "image/jpeg";
  if (!/^image\/(jpeg|png|webp)$/.test(mime)) return error(415, "formato", "Formato de imagen no compatible.");

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const limite = MODO_PRUEBA ? null : controlarLimites(ip);
  if (limite) return error(429, "limite", limite);

  const sesion = String(form.get("sesion") ?? ip);
  const safetyId = createHash("sha256").update(sesion).digest("hex").slice(0, 32);

  try {
    const out = await visualize({
      photo: Buffer.from(await foto.arrayBuffer()),
      mime,
      width,
      height,
      spec,
      anchoVentanaCm: ancho,
      safetyId,
      escenario,
    });
    return NextResponse.json({
      ok: true,
      imagen: `data:${out.mime};base64,${out.imageBase64}`,
      duracionMs: out.duracionMs,
      intentos: out.intentos,
      // Datos técnicos: solo en modo prueba (para la comparación)
      ...(MODO_PRUEBA
        ? { analisis: out.analisis, calidad: out.calidad, modelo: out.modelo, calidadImagen: out.calidadImagen, usoTokens: out.usoTokens }
        : {}),
    });
  } catch (e) {
    if (e instanceof VisualizerError) {
      const status = e.code === "foto_no_apta" ? 422 : e.code === "calidad" ? 502 : 502;
      console.error("[visualizar]", e.code, e.message, e.detalle ?? "");
      return error(status, e.code, e.message, MODO_PRUEBA ? { detalle: e.detalle, imagenRechazada: e.ultimaImagen ? `data:image/jpeg;base64,${e.ultimaImagen}` : undefined } : {});
    }
    console.error("[visualizar] error inesperado", e);
    return error(500, "interno", "Ocurrió un error inesperado.");
  }
}
