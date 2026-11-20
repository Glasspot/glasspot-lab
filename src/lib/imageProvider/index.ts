/**
 * Punto único de selección del proveedor de imágenes.
 *
 * - Modo normal: intenta la generación real (/api/visualizar). Si el servidor
 *   todavía no tiene la clave configurada, usa la simulación y lo marca como prueba.
 * - ?simular=error|demora|lento: siempre la simulación (para probar pantallas).
 */

import { createApiProvider } from "./apiProvider";
import { createMockProvider, type MockMode } from "./mockProvider";
import { GenerationError, type ImageProvider } from "./types";

export * from "./types";

/** A partir de acá se avisa que la espera es más larga de lo habitual. */
export const SLOW_AFTER_MS = 75_000; // coherente con "Tarda alrededor de un minuto"
/** Tiempo máximo de espera antes de mostrar un error recuperable. */
export const TIMEOUT_MS = 150_000;

export function getImageProvider(mode: MockMode = "normal"): ImageProvider {
  if (mode !== "normal") return createMockProvider(mode);
  const api = createApiProvider();
  const mock = createMockProvider("normal");
  return {
    id: "api+respaldo",
    async generate(input) {
      try {
        return await api.generate(input);
      } catch (e) {
        if (e instanceof GenerationError && e.reason === "not_configured") {
          return mock.generate(input);
        }
        throw e;
      }
    },
  };
}

export type { MockMode };
