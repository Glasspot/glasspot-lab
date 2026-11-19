/**
 * Contrato común para cualquier servicio de generación de imágenes.
 *
 * La interfaz de usuario solo conoce este contrato. En la Etapa 2 se agrega una
 * implementación real (que llamará a un endpoint propio del backend, nunca al
 * proveedor directamente desde el navegador) sin tocar las pantallas.
 */

import type { Product } from "@/content/products";

export type GenerationInput = {
  photo: Blob;
  /** Ancho de la ventana en cm, si el visitante lo indicó. */
  anchoVentanaCm?: number;
  sessionId?: string;
  /** Uso del carrusel a generar ("de-pie", "plegado"…). Sin valor = imagen principal. */
  escenario?: string;
  photoWidth: number;
  photoHeight: number;
  product: Product;
  signal?: AbortSignal;
};

export type GenerationResult = {
  /** URL de la imagen resultante (blob: o https:). */
  imageUrl: string;
  /** true si es contenido de prueba y no una generación real. */
  esPrueba: boolean;
  provider: string;
  durationMs: number;
};

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly reason:
      | "timeout"
      | "provider"
      | "cancelled"
      | "invalid_input"
      | "not_configured"
      | "rate_limited"
      | "quality",
    /** Mensaje apto para mostrar al visitante (si el servidor lo envía). */
    public readonly userMessage?: string,
  ) {
    super(message);
  }
}

export interface ImageProvider {
  readonly id: string;
  generate(input: GenerationInput): Promise<GenerationResult>;
}
