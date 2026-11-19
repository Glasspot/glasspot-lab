/**
 * Prueba comparativa de la generación con IA.
 *
 * Toma cada foto de 02_Contenido/prueba_ia/fotos_ventanas, la envía al endpoint
 * local /api/visualizar (la web tiene que estar encendida) y guarda los
 * resultados en 02_Contenido/prueba_ia/resultados/<fecha-hora>/.
 *
 * Si el nombre del archivo incluye el ancho (ej. "cocina_120cm.jpg"), cada foto se
 * prueba dos veces: CON el dato del ancho y SIN él, para comparar.
 *
 * Uso: node scripts/prueba-ia.mjs   (o doble clic en "Prueba IA.bat")
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BASE = process.env.PRUEBA_URL || "http://localhost:3000";
const PRODUCTO = process.env.PRUEBA_PRODUCTO || "escritorio";
const MAX_FOTOS = Number(process.env.MAX_FOTOS || 20);
const RAIZ = process.env.PRUEBA_RAIZ || path.resolve(process.cwd(), "..", "..", "02_Contenido", "prueba_ia");
const ENTRADA = path.join(RAIZ, "fotos_ventanas");

const sello = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const SALIDA = path.join(RAIZ, "resultados", sello);

function anchoDelNombre(nombre) {
  const m = nombre.match(/(\d{2,3})\s*cm/i);
  return m ? Number(m[1]) : null;
}

async function preparar(file) {
  const img = sharp(await readFile(file)).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true });
  const { data, info } = await img.jpeg({ quality: 85 }).toBuffer({ resolveWithObject: true });
  return { buf: data, width: info.width, height: info.height };
}

async function enviar(foto, ancho) {
  const form = new FormData();
  form.append("foto", new Blob([foto.buf], { type: "image/jpeg" }), "foto.jpg");
  form.append("producto", PRODUCTO);
  form.append("width", String(foto.width));
  form.append("height", String(foto.height));
  if (ancho) form.append("ancho", String(ancho));
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/visualizar`, { method: "POST", body: form });
  const data = await res.json().catch(() => ({ ok: false, code: "respuesta_invalida", mensaje: `HTTP ${res.status}` }));
  return { data, ms: Date.now() - t0 };
}

function guardarImagen(dataUrl, destino) {
  const b64 = dataUrl.split(",")[1];
  return writeFile(destino, Buffer.from(b64, "base64"));
}

async function main() {
  const estado = await fetch(`${BASE}/api/visualizar`).then((r) => r.json()).catch(() => null);
  if (!estado) throw new Error(`No se pudo conectar con ${BASE}. ¿Está encendida la web ("Iniciar Glasspot Lab")?`);
  if (!estado.configurado) throw new Error("Falta la clave OPENAI_API_KEY en el archivo .env.local");

  const archivos = (await readdir(ENTRADA)).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f)).slice(0, MAX_FOTOS);
  if (!archivos.length) throw new Error(`No hay fotos en ${ENTRADA}`);
  await mkdir(SALIDA, { recursive: true });

  const filas = [["foto", "variante", "ancho_cm", "resultado", "intentos", "segundos", "puntaje_qa", "problemas", "tokens_entrada", "tokens_salida"]];
  const detalle = [];
  console.log(`\nProbando ${archivos.length} foto(s) con "${PRODUCTO}". Resultados en:\n${SALIDA}\n`);

  for (const [i, nombre] of archivos.entries()) {
    const base = path.parse(nombre).name;
    let foto;
    try {
      foto = await preparar(path.join(ENTRADA, nombre));
    } catch {
      console.log(`  [${i + 1}] ${nombre}: no se pudo abrir (¿HEIC? convertila a JPG).`);
      continue;
    }
    await writeFile(path.join(SALIDA, `${base}__0_original.jpg`), foto.buf);
    const ancho = anchoDelNombre(nombre);
    const variantes = ancho ? [["con-ancho", ancho], ["sin-ancho", null]] : [["sin-ancho", null]];

    for (const [variante, a] of variantes) {
      process.stdout.write(`  [${i + 1}/${archivos.length}] ${nombre} (${variante})... `);
      const { data, ms } = await enviar(foto, a);
      const uso = (data.usoTokens ?? []).reduce(
        (acc, u) => ({ in: acc.in + (u.input_tokens ?? 0), out: acc.out + (u.output_tokens ?? 0) }),
        { in: 0, out: 0 },
      );
      if (data.ok) {
        await guardarImagen(data.imagen, path.join(SALIDA, `${base}__${variante}.jpg`));
        console.log(`OK en ${(ms / 1000).toFixed(0)} s`);
      } else {
        if (data.imagenRechazada) await guardarImagen(data.imagenRechazada, path.join(SALIDA, `${base}__${variante}__RECHAZADA.jpg`));
        console.log(`FALLÓ (${data.code}): ${data.mensaje}`);
      }
      const qa = data.calidad ?? (data.detalle ? (() => { try { return JSON.parse(data.detalle); } catch { return null; } })() : null);
      filas.push([
        nombre, variante, a ?? "", data.ok ? "ok" : data.code, data.intentos ?? "", (ms / 1000).toFixed(1),
        qa?.puntaje ?? "", (qa?.problemas ?? []).join(" | "), uso.in, uso.out,
      ]);
      detalle.push({ foto: nombre, variante, ancho: a, respuesta: { ...data, imagen: undefined, imagenRechazada: undefined }, ms });
    }
  }

  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  await writeFile(path.join(SALIDA, "resumen.csv"), "﻿" + csv);
  await writeFile(path.join(SALIDA, "detalle.json"), JSON.stringify(detalle, null, 2));
  console.log(`\nListo. Abrí la carpeta de resultados y el archivo resumen.csv (se abre con Excel).`);
  console.log(`El costo real lo ves en platform.openai.com → Usage.\n`);
}

main().catch((e) => {
  console.error(`\nERROR: ${e.message}\n`);
  process.exitCode = 1;
});
