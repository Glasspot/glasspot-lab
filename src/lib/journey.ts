/**
 * Recorrido del visitante, para distinguir resultados entre los dos caminos:
 *  - "interactivo": llegó al precio después de la visualización con IA.
 *  - "directo": tocó «Ver precio de lanzamiento» desde la presentación del producto.
 * También recuerda si la persona usó la experiencia interactiva en algún momento
 * de la sesión (aunque después haya ido al precio directo).
 */

export type Recorrido = "interactivo" | "directo";

const key = (slug: string) => `glasspot_ia_usada_${slug}`;

export function marcarExperienciaUsada(slug: string) {
  try {
    window.sessionStorage.setItem(key(slug), "1");
  } catch {}
}

export function experienciaUsada(slug: string): boolean {
  try {
    return window.sessionStorage.getItem(key(slug)) === "1";
  } catch {
    return false;
  }
}
