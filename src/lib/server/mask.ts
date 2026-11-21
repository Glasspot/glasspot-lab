import "server-only";
import { deflateSync } from "node:zlib";

/**
 * Máscara de edición para el generador de imágenes: PNG del mismo tamaño que la foto,
 * opaco en todo lo que NO se puede tocar y transparente solo en la zona donde va el producto.
 * Se arma sin dependencias externas.
 */

/** Lee ancho y alto de un JPEG (marcador SOF). Devuelve null si no lo puede leer. */
export function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    const esSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (esSOF) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** Rectángulo editable en fracciones de la imagen: [izquierda, arriba, derecha, abajo]. */
export type Zona = [number, number, number, number];

export function buildMaskPng(width: number, height: number, zona: Zona): Buffer {
  const [x0, y0, x1, y1] = zona;
  const X0 = Math.max(0, Math.floor(x0 * width));
  const X1 = Math.min(width, Math.ceil(x1 * width));
  const Y0 = Math.max(0, Math.floor(y0 * height));
  const Y1 = Math.min(height, Math.ceil(y1 * height));
  const row = 1 + width * 4;
  const raw = Buffer.alloc(row * height);
  for (let y = 0; y < height; y++) {
    const o = y * row;
    raw[o] = 0; // sin filtro
    const dentroY = y >= Y0 && y < Y1;
    for (let x = 0; x < width; x++) {
      const p = o + 1 + x * 4;
      raw[p] = 0;
      raw[p + 1] = 0;
      raw[p + 2] = 0;
      raw[p + 3] = dentroY && x >= X0 && x < X1 ? 0 : 255; // 0 = se puede editar
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * A partir de la zona donde van las ventosas (según el análisis de la foto), arma la zona
 * editable: se agranda hacia los costados y hacia arriba (la tapa queda por encima de las
 * ventosas) pero casi nada hacia abajo, para que las ventosas no puedan bajar al marco o al travesaño.
 * Devuelve null si la zona no es razonable.
 */
export function zonaEditable(z: unknown): Zona | null {
  if (!Array.isArray(z) || z.length !== 4 || !z.every((n) => typeof n === "number" && isFinite(n))) return null;
  const [x0, y0, x1, y1] = z as number[];
  const w = x1 - x0;
  const h = y1 - y0;
  if (x0 < 0 || y0 < 0 || x1 > 1 || y1 > 1 || w < 0.06 || w > 0.75 || h < 0.02 || h > 0.5) return null;
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  return [clamp(x0 - w * 0.3), clamp(y0 - Math.max(h * 1.6, 0.12)), clamp(x1 + w * 0.3), clamp(y1 + 0.015)];
}
