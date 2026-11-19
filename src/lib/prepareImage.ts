/**
 * Prepara la foto del usuario en el propio dispositivo, antes de cualquier envío:
 * - corrige la orientación,
 * - la reduce a un tamaño razonable,
 * - la vuelve a codificar como JPEG.
 *
 * Al redibujarla en un canvas se descartan los metadatos EXIF
 * (incluida la ubicación GPS y el modelo del teléfono).
 */

const MAX_SIDE = 1600;
const QUALITY = 0.85;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export type PreparedImage = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
};

export class ImagePrepError extends Error {}

async function decode(file: Blob): Promise<CanvasImageSource & { width: number; height: number }> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Algunos navegadores no aceptan opciones: probamos con <img>.
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImagePrepError("formato"));
    };
    img.src = url;
  });
}

export async function prepareImage(file: Blob): Promise<PreparedImage> {
  if (file.size > MAX_INPUT_BYTES) throw new ImagePrepError("tamaño");
  if (file.type && !file.type.startsWith("image/")) throw new ImagePrepError("formato");

  const source = await decode(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImagePrepError("canvas");
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source && typeof source.close === "function") source.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new ImagePrepError("codificacion"))),
      "image/jpeg",
      QUALITY,
    ),
  );
  return { blob, url: URL.createObjectURL(blob), width, height };
}

/** Carga una imagen pública (por ejemplo, la foto de demostración) como Blob. */
export async function fetchAsBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new ImagePrepError("descarga");
  return res.blob();
}
